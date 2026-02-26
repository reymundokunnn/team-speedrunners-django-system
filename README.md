# Presenta - Design Request Management Platform

A Django-based web application for managing design requests including presentations, infographics, and posters. The platform connects clients with designers and provides administrators with oversight capabilities.

## Features

### User Roles
- **Clients**: Submit design requests, track progress, and receive finished designs
- **Designers**: Accept requests, upload finished work, and manage their assigned projects
- **Administrators**: Manage users, oversee all requests, and monitor platform activity

### Core Functionality
- **Design Request Management**: Create, edit, and track design requests through various statuses (Pending, In Progress, For Payment, Completed, Rejected, Cancelled)
- **File Management**: Upload reference files for requests and finished designs
- **Activity Tracking**: Comprehensive logging of all user activities across the platform
- **User Profiles**: Customizable profiles with image upload and cropping support
- **Role-based Dashboards**: Tailored dashboards for each user type
- **Admin User Management**: Create, edit, and delete users with AJAX-powered interfaces

## Technology Stack

- **Framework**: Django 4.2.11
- **Language**: Python 3.12
- **Database**: SQLite (default), easily configurable for PostgreSQL/MySQL
- **Frontend**: HTML, CSS, JavaScript
- **Image Processing**: Pillow (PIL)
- **Authentication**: Custom authentication backend with Django's auth system

## Project Structure

```
main_site/
├── main_site/              # Project configuration
│   ├── settings.py         # Django settings
│   ├── urls.py            # Root URL configuration
│   ├── wsgi.py            # WSGI application
│   └── asgi.py            # ASGI application
├── presenta/              # Main application
│   ├── models.py          # Data models (User, DesignRequest, Activity, etc.)
│   ├── views.py           # View logic and business rules
│   ├── urls.py            # Application URL routing
│   ├── forms.py           # Form definitions
│   ├── admin.py           # Admin interface configuration
│   ├── auth_backend.py    # Custom authentication backend
│   ├── context_processors.py  # Template context processors
│   └── templatetags/      # Custom template filters
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   ├── index.html         # Homepage
│   ├── dashboard/         # Dashboard templates
│   └── partials/          # Reusable template components
├── static/                # Static assets (CSS, JS, images, fonts)
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── img/              # Images and logos
│   └── fonts/            # Inter font family
├── media/                 # User-uploaded files
│   ├── design_requests/   # Design request files
│   └── profile_pics/      # Profile pictures
└── manage.py              # Django management script
```

## Installation

### Prerequisites
- Python 3.12 or higher
- pip (Python package installer)
- Virtual environment (recommended)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd main_site
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install django pillow
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - Open browser and navigate to `http://127.0.0.1:8000/`
   - Admin panel: `http://127.0.0.1:8000/admin/`

## Configuration

### Environment Variables
Create a `.env` file in the project root for production settings:

```env
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Database Configuration
Edit `main_site/settings.py` to configure your database:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'presenta_db',
        'USER': 'db_user',
        'PASSWORD': 'db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Media Files
For production, configure a web server (Nginx/Apache) to serve media files or use a cloud storage service (AWS S3, etc.).

## Usage

### For Clients
1. Register an account or sign in
2. Submit a new design request with details and reference files
3. Track request status through the dashboard
4. Receive notifications when designs are completed
5. Download finished files

### For Designers
1. Log in to the designer dashboard
2. View available requests and accept projects
3. Upload finished designs and update status
4. Manage assigned projects

### For Administrators
1. Access the admin dashboard
2. Manage all users (create, edit, delete)
3. Monitor all design requests
4. View platform-wide activity logs
5. Assign designers to requests

## API Endpoints

The application provides several AJAX endpoints:

- `GET /api/completion-details/<request_id>/` - Get completion details
- `GET /api/reference-files/<request_id>/` - Get reference files
- `GET /api/finished-files/<request_id>/` - Get finished files
- `POST /manage/user/create/` - Create new user (admin only)
- `GET/POST /manage/user/<user_id>/view/` - View user details
- `GET/POST /manage/user/<user_id>/edit/` - Edit user
- `POST /manage/user/<user_id>/delete/` - Delete user
- `POST /password-reset/lookup/` - Lookup user for password reset
- `POST /password-reset/form/<user_id>/` - Reset password form

## Security Features

- CSRF protection on all forms
- Password hashing with Django's secure algorithms
- Session management with configurable expiration
- Role-based access control
- File upload validation and secure storage

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Management Commands
Custom management commands can be added in `presenta/management/commands/`.

## Deployment

### Production Checklist
- [ ] Set `DEBUG = False` in settings
- [ ] Configure proper `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS`
- [ ] Configure production database
- [ ] Set up static files serving (WhiteNoise or CDN)
- [ ] Configure media files storage
- [ ] Enable HTTPS
- [ ] Set up error logging (Sentry recommended)

### Recommended Deployment Stack
- **Web Server**: Nginx
- **Application Server**: Gunicorn / uWSGI
- **Database**: PostgreSQL
- **Cache**: Redis (optional)
- **Static/Media**: AWS S3 or similar

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@presenta.com or open an issue in the repository.

## Acknowledgments

- Django Framework
- Inter Font Family
- Pillow (PIL) for image processing
- Cropper.js for image cropping functionality
