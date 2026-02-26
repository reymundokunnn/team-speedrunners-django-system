# Presenta

A Django web app for managing design requests (presentations, infographics, posters). Connects clients with designers.

## Quick Start

```bash
# Setup
python -m venv .venv
source .venv/bin/activate
pip install django pillow

# Run
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Visit `http://127.0.0.1:8000/`

## Features

- **3 User Roles**: Clients, Designers, Admins
- **Design Requests**: Submit, track, and manage requests
- **File Uploads**: Reference files and finished designs
- **Activity Tracking**: Logs all platform activity
- **User Profiles**: With image upload/cropping

## Project Structure

```
main_site/       # Django project config
presenta/        # Main app (models, views, urls)
templates/       # HTML templates
static/          # CSS, JS, images
media/           # User uploads
```

## Tech Stack

- Django 4.2.11
- Python 3.12
- SQLite (default)
- Pillow (image processing)

## Environment Variables (Production)

Create `.env`:
```
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com
```

## User Guide

| Role | Actions |
|------|---------|
| **Client** | Submit requests, track progress, download files |
| **Designer** | Accept jobs, upload work, update status |
| **Admin** | Manage users, view all requests, monitor activity |

## Deployment Checklist

- [ ] `DEBUG = False`
- [ ] Set `SECRET_KEY` and `ALLOWED_HOSTS`
- [ ] Use PostgreSQL (not SQLite)
- [ ] Configure static/media file serving
- [ ] Enable HTTPS

## License

MIT
