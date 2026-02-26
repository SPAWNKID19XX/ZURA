from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "assigned_to":
            print("assigned_to", db_field.name, request.user.company)
            if request.user.company:
                kwargs["queryset"] = db_field.related_model.objects.filter(
                    company=request.user.company
                )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


