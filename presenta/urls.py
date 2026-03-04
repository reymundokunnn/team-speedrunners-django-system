from django.urls import path
from . import views

urlpatterns = [
    path('services/', views.services, name='services'),
    path('', views.index, name='index'),
    path('signin/', views.login_view, name='signin'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='presenta_logout'),
    path('contact/', views.contact, name='contact'),
    path('pricing/', views.pricing, name='pricing'),
    path('samples/', views.samples, name='samples'),
    
    # Dashboard routes
    path('dashboard/user/', views.user_dashboard, name='user_dashboard'),
    path('dashboard/designer/', views.designer_dashboard, name='designer_dashboard'),
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    
    # Design request actions
    path('design-request/create/', views.request_design, name='request_design'),
    path('design-request/<int:request_id>/accept/', views.accept_design_request, name='accept_design_request'),
    path('design-request/<int:request_id>/complete/', views.complete_design_request, name='complete_design_request'),
    path('design-request/<int:request_id>/reject/', views.reject_design_request, name='reject_design_request'),
    path('design-request/<int:request_id>/cancel/', views.cancel_design_request, name='cancel_design_request'),
    path('design-request/<int:request_id>/update-status/', views.update_design_status, name='update_design_status'),
    path('design-request/<int:request_id>/delete/', views.delete_design_request, name='delete_design_request'),
    path('design-request/<int:request_id>/edit/', views.edit_design_request, name='edit_design_request'),
    
    # Profile
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    
    # API endpoints
    path('api/completion-details/<int:request_id>/', views.get_completion_details, name='completion_details'),
    path('api/reference-files/<int:request_id>/', views.get_reference_files, name='reference_files'),
    path('api/finished-files/<int:request_id>/', views.get_finished_files, name='finished_files'),
    
    # Admin user management
    path('manage/user/<int:user_id>/view/', views.view_user, name='view_user'),
    path('manage/user/<int:user_id>/edit/', views.edit_user, name='edit_user'),
    path('manage/user/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('manage/user/create/', views.create_user, name='create_user'),
    
    # Activity management
    path('activities/clear/', views.clear_activities, name='clear_activities'),
    
    # Password reset
    path('password-reset/lookup/', views.password_reset_lookup, name='password_reset_lookup'),
    path('password-reset/form/<int:user_id>/', views.password_reset_form, name='password_reset_form'),
    path('password-reset/confirm/<int:user_id>/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # Settings
    path('settings/', views.settings_page, name='settings'),
    path('settings/unified/', views.unified_settings, name='unified_settings'),
    path('settings/account/', views.account_settings, name='account_settings'),
    path('settings/designer/', views.designer_settings, name='designer_settings'),
    path('settings/admin/', views.admin_settings, name='admin_settings'),
    path('settings/edit-profile/', views.edit_profile_settings, name='edit_profile_settings'),
    path('settings/change-password/', views.change_password_ajax, name='change_password_ajax'),
    
    # User status
    path('api/update-status/', views.update_user_status, name='update_user_status'),
]
