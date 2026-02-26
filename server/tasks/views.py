from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Task.objects.filter(company=self.request.user.company).order_by('-created_at')
        if self.request.query_params.get('mine') == 'true':
            qs = qs.filter(assigned_to=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            company=self.request.user.company,
        )
