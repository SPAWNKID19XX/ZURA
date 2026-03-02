from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver


@receiver(pre_save, sender='tasks.Task')
def cache_old_assigned_to(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_assigned_to = old.assigned_to
        except sender.DoesNotExist:
            instance._old_assigned_to = None
    else:
        instance._old_assigned_to = None


@receiver(post_save, sender='tasks.Task')
def task_assigned_notification(sender, instance, created, **kwargs):
    from notifications.models import Notification

    assigned_to = instance.assigned_to
    if not assigned_to:
        return

    # Don't notify if the assignee is the author
    if assigned_to == instance.author:
        return

    old_assigned_to = getattr(instance, '_old_assigned_to', None)

    if assigned_to != old_assigned_to:
        Notification.objects.create(
            recipient=assigned_to,
            type=Notification.Type.TASK_ASSIGNED,
            message=f'You have been assigned to task "{instance.title}"',
            task=instance,
        )
