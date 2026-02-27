from rest_framework import serializers
from django.conf import settings
from .models import Task
from django.contrib.auth import get_user_model


class TaskSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=settings.AUTH_USER_MODEL,
        allow_null=True,
        required=False,
    )
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'created_at', 'updated_at', 'author', 'assigned_to', 'assigned_to_name',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'author', 'assigned_to_name')

    def get_assigned_to_name(self, obj):
        if not obj.assigned_to:
            return None
        name = f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
        return name or obj.assigned_to.email

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.company:
            User = get_user_model()
            self.fields['assigned_to'].queryset = User.objects.filter(
                company=request.user.company.id
            )
