# Generated migration to create default sample categories

from django.db import migrations


def create_default_categories(apps, schema_editor):
    SampleCategory = apps.get_model('presenta', 'SampleCategory')
    
    categories = [
        {'name': 'Presentations', 'slug': 'presentations', 'description': 'Professional presentation decks and business slides', 'icon': '📊', 'order': 0},
        {'name': 'Infographics', 'slug': 'infographics', 'description': 'Data visualization and informative graphics', 'icon': '📈', 'order': 1},
        {'name': 'Posters', 'slug': 'posters', 'description': 'Eye-catching poster designs and promotional materials', 'icon': '🎨', 'order': 2},
    ]
    
    for cat_data in categories:
        SampleCategory.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={
                'name': cat_data['name'],
                'description': cat_data['description'],
                'icon': cat_data['icon'],
                'order': cat_data['order'],
            }
        )


def remove_default_categories(apps, schema_editor):
    SampleCategory = apps.get_model('presenta', 'SampleCategory')
    SampleCategory.objects.filter(slug__in=['presentations', 'infographics', 'posters']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('presenta', '0042_alter_designrequest_status'),
    ]

    operations = [
        migrations.RunPython(create_default_categories, remove_default_categories),
    ]