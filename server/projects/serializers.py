from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Project

User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True, allow_null=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'full_name', 'role_name')

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.email


class ProjectSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    lead_name = serializers.SerializerMethodField()
    members_detail = ProjectMemberSerializer(source='members', many=True, read_only=True)
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.none(),
        required=False,
    )
    lead = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.none(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Project
        fields = (
            'id', 'title', 'description', 'status',
            'created_by', 'created_by_name',
            'lead', 'lead_name',
            'members', 'members_detail',
            'start_date', 'end_date',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_by', 'created_by_name', 'lead_name', 'members_detail', 'created_at', 'updated_at')

    def get_created_by_name(self, obj):
        name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return name or obj.created_by.email

    def get_lead_name(self, obj):
        if not obj.lead:
            return None
        name = f"{obj.lead.first_name} {obj.lead.last_name}".strip()
        return name or obj.lead.email

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.company:
            company_users = User.objects.filter(company=request.user.company)
            self.fields['members'].child_relation.queryset = company_users
            self.fields['lead'].queryset = company_users