from rest_framework import serializers
from .models import Notification


class TaskBriefSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()


class ProjectBriefSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()


class NotificationSerializer(serializers.ModelSerializer):
    task = TaskBriefSerializer(read_only=True)
    project = ProjectBriefSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'type', 'message', 'is_read', 'created_at', 'task', 'project']
        read_only_fields = ['id', 'type', 'message', 'created_at', 'task', 'project']
