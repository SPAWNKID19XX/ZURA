from django.db.models.signals import m2m_changed
from django.dispatch import receiver


@receiver(m2m_changed, sender='projects.Project_members')
def project_member_added_notification(sender, instance, action, pk_set, **kwargs):
    if action != 'post_add' or not pk_set:
        return

    from django.contrib.auth import get_user_model
    from notifications.models import Notification

    User = get_user_model()
    for user_pk in pk_set:
        try:
            user = User.objects.get(pk=user_pk)
        except User.DoesNotExist:
            continue

        # Don't notify the project creator
        if user == instance.created_by:
            continue

        Notification.objects.create(
            recipient=user,
            type=Notification.Type.PROJECT_ADDED,
            message=f'You have been added to project "{instance.title}"',
            project=instance,
        )
