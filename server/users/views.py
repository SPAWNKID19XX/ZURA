from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny

from .permissions import IsOwnerOrReadOnly
from .models import Company, EmployeeUser
from .serializers import CompanySerializer, EmployeeSerializer


# Create your views here.
class CompanyCRUDViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class =  CompanySerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EmployeeUserCreateAPIView(generics.CreateAPIView):
    queryset = EmployeeUser.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (AllowAny,)


