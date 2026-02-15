from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

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
        fields = ('first_name', 'last_name', 'email', 'password', 'is_seo_user', 'is_employee', 'company', 'department',
                  'role')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        if validated_data['password']:
            instance.set_password(validated_data['password'])
            instance.save()
        else:
            raise serializers.ValidationError({'password': 'Password mast be introduced'})
        return instance


class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, label='Password', validators=[validate_password], required=True)
    password_confirm = serializers.CharField(write_only=True, label='Password confirmation')
    companyName = serializers.CharField(write_only=True, label='Company Name', required=False)
    is_seo_user = serializers.BooleanField(write_only=True, label='Is Seo User', required=False)

    class Meta:
        model = EmployeeUser
        fields = ('email', 'password', 'password_confirm', "is_seo_user", "companyName")

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords does not mutch'})
        return attrs

    def create(self, validated_data):

        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        is_seo_user = validated_data.pop('is_seo_user', False)
        company_name = validated_data.pop('companyName', None)
        new_user = EmployeeUser.objects.create_user(password=password, **validated_data, is_seo_user=is_seo_user)

        if is_seo_user and company_name:
            Company.objects.create(name=company_name, created_by=new_user)

        return new_user
# todo class EmployeeUserDetailSerializer(serializers.ModelSerializer):
