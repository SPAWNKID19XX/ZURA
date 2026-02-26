from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsOwnerOrReadOnly, IsSeoUserOrReadOnly
from .models import Company, Department, EmployeeUser, Role
from .serializers import CompanySerializer, DepartmentSerializer, EmployeeSerializer, RoleSerializer, SignUpSerializer, ChangePasswordSerializer


# Create your views here.
class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = (IsAuthenticated,)


class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = (IsAuthenticated,)


class CompanyCRUDViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class =  CompanySerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EmployeeSeoCreateAPIView(generics.CreateAPIView):
    queryset = EmployeeUser.objects.all()
    serializer_class = SignUpSerializer
    permission_classes = (AllowAny,)

class MeIdentificationRetrieveUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'detail': "Password updated"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HireCrudEmployeeAPIView(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = (IsSeoUserOrReadOnly,)

    def get_queryset(self):
        return EmployeeUser.objects.filter(company= self.request.user.company).exclude(id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            is_staff=True,
            is_seo_user=False,
            password='admin12345',
            company=self.request.user.company,
        )


