from django.urls import path, include
from .views import HireCrudEmployeeAPIView, CompanyCRUDViewSet, EmployeeSeoCreateAPIView, MeIdentificationRetrieveUpdateDeleteAPIView, ChangePasswordView
from rest_framework import routers

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

router = routers.DefaultRouter()

router.register('companies', CompanyCRUDViewSet, basename='companies')
router.register(r'my_employeers', HireCrudEmployeeAPIView, basename='my_employeers')
urlpatterns = [
    path('', include(router.urls)),
    path('change_password/', ChangePasswordView.as_view(), name='change_password'),
    path('my_account/', MeIdentificationRetrieveUpdateDeleteAPIView.as_view(), name='my_account'),
    path('new_seo/', EmployeeSeoCreateAPIView.as_view(), name='new_seo'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # Documentation (OpenAPI 3.0)


]
