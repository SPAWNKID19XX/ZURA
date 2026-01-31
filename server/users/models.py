from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, AbstractUser
from django.db import models

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)

        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_employee", True)
        extra_fields.setdefault("is_seo_user", False)
        new_user=self.model(
            email=email,
            **extra_fields
        )
        if not password:
            raise ValueError("Users must have a password")
        new_user.set_password(password)
        new_user.save(using=self._db)
        return new_user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_employee", True)
        extra_fields.setdefault("is_seo_user", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")
        new_user=self.create_user(
            email=email,
            password=password,
            **extra_fields
        )
        return new_user


class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100)
    department = models.ForeignKey("department", on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.code

class EmployeeUser(AbstractUser):
    username = None

    email = models.EmailField(max_length=255, unique=True)
    is_seo_user = models.BooleanField(default=False)
    is_employee = models.BooleanField(default=True)
    #todo company field pk to model company witch can be created only by is_seo_user
    avatar = models.ImageField(upload_to="avatars", blank=True, null=True)
    company = models.ForeignKey("Company", on_delete=models.CASCADE, related_name="employees", null=True,blank=True)
    department = models.ForeignKey("department", on_delete=models.CASCADE,null=True,blank=True)
    role = models.ForeignKey("Role", on_delete=models.CASCADE, null=True,blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name}  {self.last_name}"

class Company(models.Model):
    name = models.CharField(max_length=100)
    #projects= models.ManyToManyField("Project",related_name="company")

    def __str__(self):
        return self.name


