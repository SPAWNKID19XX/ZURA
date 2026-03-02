from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Task
from .serializers import TaskSerializer
from users.permissions import CanCreateTask


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated, CanCreateTask)

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.filter(company=user.company).order_by('-created_at')

        is_management = user.department and user.department.name == 'Management'
        if not (user.is_seo_user or is_management):
            qs = qs.filter(Q(author=user) | Q(assigned_to=user))

        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            company=self.request.user.company,
        )
