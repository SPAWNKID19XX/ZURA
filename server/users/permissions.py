import logging
from rest_framework import permissions
logger = logging.getLogger('zura')


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve']:
            return True
        if view.action == 'create':
            return request.user and request.user.is_authenticated and request.user.is_seo_user
        return request.user.is_authenticated

    def has_object_permission(self, request, view, object):
        if not object.created_by:
            logger.error(f"DATABASE INTEGRITY ERROR: Company {object.id} has no owner!")
            return False

        if view.action == 'retrieve':
            return True
        if view.action in ['update', 'partial_update', 'destroy']:
            is_owner = request.user == object.created_by
            if not is_owner:
                logger.debug(f"Access danied for User: {request.user.id} becouse owner on Object is: {object.id}")
            return is_owner