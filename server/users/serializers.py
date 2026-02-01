from rest_framework import serializers

from .models import Company, EmployeeUser


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('name',)

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