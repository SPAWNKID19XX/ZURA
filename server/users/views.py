from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsOwnerOrReadOnly
from .models import Company, EmployeeUser
from .serializers import CompanySerializer, EmployeeSerializer, SignUpSerializer, ChangePasswordSerializer


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

