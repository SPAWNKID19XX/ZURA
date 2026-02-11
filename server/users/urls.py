from django.urls import path, include
from .views import CompanyCRUDViewSet, EmployeeUserCreateAPIView, MeIdentificationRetrieveAPIView
from rest_framework import routers

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

router = routers.DefaultRouter()

router.register('companies', CompanyCRUDViewSet, basename='companies')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', MeIdentificationRetrieveAPIView.as_view(), name='me'),
    path('new_employer/', EmployeeUserCreateAPIView.as_view(), name='new_employer'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Documentation (OpenAPI 3.0)


]
