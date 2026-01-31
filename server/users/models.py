from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class Departament(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)

    def __str__(self):
        return self.code

class EmployeeUser(AbstractUser):
    username = None
    USERNAME_FIELD = "email"
    is_seo_user = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=True)
    #todo company field pk to model company witch can be created only by is_seo_user
    avatar = models.ImageField(upload_to="avatars", blank=True, null=True)
    company = models.ForeignKey("Company", on_delete=models.CASCADE)
    departament = models.ForeignKey("Departament", on_delete=models.CASCADE)
    role = models.ForeignKey("Role", on_delete=models.CASCADE)

class Company(models.Model):
    name = models.CharField(max_length=100)
    employeers = models.ManyToManyField(EmployeeUser)
    projects= models.ManyToManyField("Project")

    def __str__(self):
        return self.name


