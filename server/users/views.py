from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from urllib3 import request

from .permissions import IsOwnerOrReadOnly
from .models import Company, EmployeeUser
from .serializers import CompanySerializer, EmployeeSerializer, SignUpSerializer


# Create your views here.
class CompanyCRUDViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class =  CompanySerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EmployeeUserCreateAPIView(generics.CreateAPIView):
    queryset = EmployeeUser.objects.all()
    serializer_class = SignUpSerializer
    permission_classes = (AllowAny,)

class MeIdentificationRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user



