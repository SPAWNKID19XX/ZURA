from django.core.management.base import BaseCommand
from users.models import Departament, Role
DEPARTMENTS = {
    "QA": [
        "QA Engineer (Manual)",
        "QA Automation Engineer",
        "Software Tester",
        "Test Engineer",
    ],

    "Development": [
        "Backend",
        "Frontend",
        "Full-Stack",
        "Mobile",
    ],
    "DevOps": [
        "DevOps Engineer",
        "Cloud Engineer",
        "Site Reliability Engineer (SRE)",
        "System Administrator",
        "Linux Administrator",
        "Network Engineer",
    ],

    "Cybersecurity": [
        "Cybersecurity Engineer",
        "Information Security Specialist",
        "Penetration Tester",
        "SOC Analyst",
        "Security Engineer",
    ],

    "Data & AI": [
        "Data Analyst",
        "Data Engineer",
        "Data Scientist",
        "Machine Learning Engineer",
        "AI Engineer",
        "BI Developer",
    ],

    "Design": [
        "UI Designer",
        "UX Designer",
        "UI/UX Designer",
        "Product Designer",
        "Graphic Designer",
        "Motion Designer",
    ],

    "Management": [
        "Product Manager",
        "Project Manager",
        "IT Project Manager",
        "Scrum Master",
        "Agile Coach",
        "Product Owner",
    ],

    "Business & Analysis": [
        "Business Analyst",
        "System Analyst",
        "Functional Analyst",
        "Technical Analyst",
    ],

    "Support": [
        "IT Support Specialist",
        "Helpdesk Engineer",
        "Technical Support Engineer",
        "Application Support Engineer",
    ],

    "Enterprise&Platforms": [
        "ERP Consultant",
        "SAP Consultant",
        "Salesforce Developer",
        "CRM Specialist",
        "Odoo Developer",
        "1C Developer",
        "Low-Code Developer",
        "No-Code Developer"
    ],
}

class Command(BaseCommand):
    def handle(self, *args, **options):
        department_list = []
        roles_list = []
        for dep, rls in DEPARTMENTS.items():
            new_department = Departament(
                name=dep,
            )
            if new_department not in department_list:
                department_list.append(new_department)
            if isinstance(rls, list):
                for rl in rls:
                    new_role = Role(
                        name=rl,
                        code=dep,
                        department=new_department,
                    )
                    if new_role not in roles_list:
                        roles_list.append(new_role)
        Departament.objects.bulk_create(department_list)
        Role.objects.bulk_create(roles_list)
