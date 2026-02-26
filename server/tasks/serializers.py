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

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'priority',
            'due_date', 'created_at', 'updated_at', 'author', 'assigned_to',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'author')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.company:
            User = get_user_model()
            self.fields['assigned_to'].queryset = User.objects.filter(
                company=request.user.company.id
            )
