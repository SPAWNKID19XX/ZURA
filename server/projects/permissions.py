from rest_framework import permissions


class ProjectPermission(permissions.BasePermission):
    """
    - create:           only seo_user
    - update/partial:   seo_user OR project lead
    - destroy:          only seo_user
    - list/retrieve:    only project members, lead, created_by, or seo_user
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if view.action == 'create':
            return getattr(request.user, 'is_seo_user', False)
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if getattr(user, 'is_seo_user', False):
            return True

        if view.action in ['update', 'partial_update']:
            return obj.lead == user

        if view.action == 'destroy':
            return False

        # retrieve
        return (
            obj.created_by == user
            or obj.lead == user
            or obj.members.filter(pk=user.pk).exists()
        )