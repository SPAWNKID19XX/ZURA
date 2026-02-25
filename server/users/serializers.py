from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.db import transaction
from .models import Company, EmployeeUser


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('name', "created_by")
        extra_kwargs = {
            'created_by': {'write_only': True}
        }


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeUser
        fields = ('first_name', 'last_name', 'email', 'phone', 'password', 'is_seo_user', 'is_employee', 'company',
                  'department',
                  'role')
        extra_kwargs = {
            'password': {'write_only': True}, 'email': {'read_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        company_name = validated_data.pop('company', None)
        instance = self.Meta.model(**validated_data)

        if password:
            instance.set_password(password)
        else:
            raise serializers.ValidationError({'password': 'Password must be introduced'})

        if company_name:
            if isinstance(company_name, str):
                instance.save()
                company, created = Company.objects.get_or_create(name=company_name, created_by=instance)
                instance.company = company
            else:
                instance.company = company_name

        instance.save()
        return instance


class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, label='Password', validators=[validate_password], required=True)
    password_confirm = serializers.CharField(write_only=True, label='Password confirmation', required=True)
    companyName = serializers.CharField(write_only=True, allow_blank=True, label='Company Name', required=False)
    is_seo_user = serializers.BooleanField(write_only=True, label='Is Seo User', required=False)

    class Meta:
        model = EmployeeUser
        fields = ('email', 'password', 'password_confirm', "is_seo_user", "companyName")

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):

        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        is_seo_user = validated_data.pop('is_seo_user', True)
        company_name = validated_data.pop('companyName', None)
        new_user = EmployeeUser.objects.create_user(password=password, is_seo_user=is_seo_user, **validated_data)

        if is_seo_user and company_name:
            Company.objects.create(name=company_name, created_by=new_user)

        return new_user

class ChangePasswordSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, label='Old Password', required=True)
    password = serializers.CharField(write_only=True, label='Password', required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, label='Password confirmation', required=True)

    class Meta:
        model = EmployeeUser
        fields = ('current_password', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'new_password': 'Password does not match'})
        return attrs

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is not correct.')
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['password'])
        user.save()
        return user