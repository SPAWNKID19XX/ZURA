from django.contrib import admin
from .models import EmployeeUser, Company, Department, Role


# Register your models here.
class EmployeeUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name')

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name',)

class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', )

class RoleAdmin(admin.ModelAdmin):
    list_display = ('name','code','department')

admin.site.register(EmployeeUser, EmployeeUserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Department, DepartmentAdmin)
admin.site.register(Role, RoleAdmin)
