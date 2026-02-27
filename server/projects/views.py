from rest_framework import viewsets
from django.db.models import Q

from .models import Project
from .serializers import ProjectSerializer
from .permissions import ProjectPermission


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = (ProjectPermission,)

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            company=user.company,
        ).filter(
            Q(created_by=user) | Q(lead=user) | Q(members=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            company=self.request.user.company,
        )