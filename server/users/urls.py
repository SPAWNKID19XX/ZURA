from django.urls import path, include
from .views import CompanyCRUDViewSet, EmployeeUserCreateAPIView
from rest_framework import routers
router = routers.DefaultRouter()

router.register('companies', CompanyCRUDViewSet, basename='companies')

urlpatterns = [
    path('', include(router.urls)),
    path('new_employer/', EmployeeUserCreateAPIView.as_view(), name='new_employer'),
]