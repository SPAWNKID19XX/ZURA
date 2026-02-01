from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return True
        if view.action == 'create':
            return request.user and request.user.is_authenticated and request.user.is_seo_user

    def has_object_permission(self, request, view, object):

        if view.action == 'retrieve':
            return True
        if view.action == 'create':
            return request.user and request.user.is_authenticated and request.user.is_seo_user
        if view.action == 'update' or view.action == 'partial_update' or view.action == 'distroy':
            created_by = object.created_by
            return request.user and request.user.is_authenticated and request.user.is_seo_user and request.user.id == created_by.id