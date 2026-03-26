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
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', views.profile_view, name='profile_detail'),
    path('profile/block/', views.block_user, name='block_user'),
    path('profile/report/', views.report_user, name='report_user'),
    path('profile/ban/', views.ban_user, name='ban_user'),
    
    # API endpoints
    path('api/notifications/', views.api_notifications, name='api_notifications'),
    path('api/activities/', views.api_activities, name='api_activities'),
    path('api/completion-details/<int:request_id>/', views.get_completion_details, name='completion_details'),
    path('api/reference-files/<int:request_id>/', views.get_reference_files, name='reference_files'),
    path('api/finished-files/<int:request_id>/', views.get_finished_files, name='finished_files'),
    
    # Admin user management
    path('manage/user/<int:user_id>/view/', views.view_user, name='view_user'),
    path('manage/user/<int:user_id>/edit/', views.edit_user, name='edit_user'),
    path('manage/user/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('manage/user/create/', views.create_user, name='create_user'),
    
    # Admin approval management (superuser only)
    path('manage/admin/<int:user_id>/approve/', views.approve_admin, name='approve_admin'),
    path('manage/admin/<int:user_id>/reject/', views.reject_admin, name='reject_admin'),
    
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
    
    # Sample management (admin) - for direct URL access if needed
    path('settings/samples/category/add/', views.add_sample_category, name='add_sample_category'),
    path('settings/samples/category/<int:category_id>/edit/', views.edit_sample_category, name='edit_sample_category'),
    path('settings/samples/category/<int:category_id>/delete/', views.delete_sample_category, name='delete_sample_category'),
    path('settings/samples/item/add/', views.add_sample_item, name='add_sample_item'),
    path('settings/samples/item/<int:item_id>/edit/', views.edit_sample_item, name='edit_sample_item'),
    path('settings/samples/item/<int:item_id>/delete/', views.delete_sample_item, name='delete_sample_item'),
    
    # Sample management API (AJAX for modal)
    path('api/samples/categories/', views.api_sample_categories, name='api_sample_categories'),
    path('api/samples/category/create/', views.api_sample_category_create, name='api_sample_category_create'),
    path('api/samples/category/<int:category_id>/', views.api_sample_category_detail, name='api_sample_category_detail'),
    path('api/samples/item/create/', views.api_sample_item_create, name='api_sample_item_create'),
    path('api/samples/item/<int:item_id>/', views.api_sample_item_detail, name='api_sample_item_detail'),
    path('api/samples/reorder/', views.api_sample_items_reorder, name='api_sample_items_reorder'),
]
