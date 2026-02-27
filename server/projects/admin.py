from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'company', 'created_by', 'lead', 'start_date', 'end_date')
    list_filter = ('status', 'company')
    filter_horizontal = ('members',)