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
        fields = ('first_name', 'last_name', 'email', 'password','is_seo_user','is_employee','company', 'department', 'role')
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
    password1 = serializers.CharField(write_only=True, label='Password', validators=[validate_password], required=True)
    password2 = serializers.CharField(write_only=True, label='Password confirmation')

    class Meta:
        model = EmployeeUser
        fields = ('email', 'password1', 'password2')

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords does not mutch'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        return EmployeeUser.objects.create_user(password=password, **validated_data)
#todo class EmployeeUserDetailSerializer(serializers.ModelSerializer):