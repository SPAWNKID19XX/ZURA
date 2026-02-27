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


class IsSeoUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "is_seo_user", False)
        )


class IsSeoUserOrReadOnly(permissions.BasePermission):
    """Allows list/retrieve for any authenticated user. Write actions require is_seo_user."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if view.action in ['list', 'retrieve']:
            return True
        return getattr(request.user, 'is_seo_user', False)


class CanCreateTask(permissions.BasePermission):
    """
    Allows task creation only for SEO users or users from allowed departments.
    Does not restrict list / retrieve / update / destroy.
    """

    ALLOWED_DEPARTMENTS = {
        'QA', 'Development', 'DevOps', 'Cybersecurity',
        'Design', 'Management', 'Business & Analysis',
    }

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if view.action != 'create':
            return True
        if getattr(request.user, 'is_seo_user', False):
            return True
        dept = getattr(request.user, 'department', None)
        return dept is not None and dept.name in self.ALLOWED_DEPARTMENTS