# Presenta

A Django web application for managing design requests. Clients submit requests for presentations, infographics, and posters. Designers claim and complete jobs. Administrators oversee the entire platform.

---

## Prerequisites

Before starting, ensure you have:
- **Python 3.12+** installed
- **pip** (Python package manager)
- **Git** (to clone the repository)

---

## Installation & Setup

Follow these steps to get the project running locally:

### 1. Clone the Repository

```bash
git clone https://github.com/reymundokunnn/team-speedrunners-django-system.git
cd team-speedrunners-django-system
```

### 2. Create a Virtual Environment

This keeps project dependencies isolated:

```bash
python -m venv .venv
```

Activate it:
- **Linux/Mac**: `source .venv/bin/activate`
- **Windows**: `.venv\Scripts\activate`

### 3. Install Dependencies

Install the dependencies specified in requirements.txt

```bash
pip install -r requirements.txt
```

### 4. Set Up the Database

Run migrations to create the database tables:

```bash
python manage.py migrate
```

### 5. Create an Admin Account

```bash
python manage.py createsuperuser
```

Enter a username, email, and password when prompted.

### 6. Collect Static Files

```bash
python manage.py collectstatic
```

Type `yes` when prompted.

### 7. Start the Development Server

```bash
python manage.py runserver
```

Open your browser and go to: **http://127.0.0.1:8000/**

---

## Project Structure

```
main_site/
├── main_site/          # Django project settings
│   ├── settings.py     # Main configuration
│   ├── urls.py         # Root URL routing
│   └── wsgi.py         # WSGI entry point
├── presenta/           # Main application
│   ├── models.py       # Database models
│   ├── views.py        # View logic
│   ├── urls.py         # App URL routing
│   └── forms.py        # Form definitions
├── templates/          # HTML templates
├── static/             # CSS, JavaScript, images
├── media/              # User-uploaded files
└── manage.py           # Django management commands
```

---

## How to Use

### For Clients
1. Register a new account at `/signin/`
2. Submit design requests from your dashboard
3. Upload reference files to help designers
4. Track request status and download completed work

### For Designers
1. Log in to see available requests
2. Click "Accept" on requests you want to work on
3. Upload finished designs and mark requests complete
4. View your assigned jobs on the designer dashboard

### For Administrators
1. Log in with your superuser account
2. Access the admin dashboard at `/dashboard/admin/`
3. Create users, manage requests, and monitor all activity

---

## Configuration

### Development Settings

The default settings in `main_site/settings.py` work for local development:
- `DEBUG = True` (shows detailed error pages)
- SQLite database (file-based, no setup needed)
- Static files served automatically

### Production Settings

Before deploying, update these in `settings.py` or use environment variables:

```python
DEBUG = False
SECRET_KEY = 'your-secure-random-key-here'
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
```

**Important**: Never commit your production secret key to version control. Use environment variables instead:

```python
import os
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-key-for-dev-only')
```

For production databases (PostgreSQL/MySQL), update the `DATABASES` setting in `settings.py`.

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `python manage.py runserver` | Start development server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py makemigrations` | Create new migrations |
| `python manage.py createsuperuser` | Create admin account |
| `python manage.py collectstatic` | Gather static files |
| `python manage.py shell` | Open Django shell |

---

## Troubleshooting

**Issue**: `ModuleNotFoundError: No module named 'django'`
- **Solution**: Ensure your virtual environment is activated, then run `pip install django pillow`

**Issue**: `sqlite3.OperationalError: no such table`
- **Solution**: Run `python manage.py migrate` to create database tables

**Issue**: Static files not loading
- **Solution**: Run `python manage.py collectstatic` and ensure `DEBUG = True` for development

**Issue**: Cannot upload images/files
- **Solution**: Check that the `media/` directory exists and has write permissions

---

## Tech Stack

- **Framework**: Django 4.2.11
- **Language**: Python 3.12
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **Image Processing**: Pillow
- **Frontend**: HTML, CSS, JavaScript

---

## License

MIT License
