from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import User, Profile, DesignRequest, SampleCategory, SampleItem


class UserAdmin(admin.ModelAdmin):
    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
    list_display = ('username', 'full_name', 'email', 'get_user_role', 'get_admin_approval_status', 'get_joined_date', 'get_auth_user_link')
    list_filter = ('user_role', 'admin_approval_status', 'created_at')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    readonly_fields = ('created_at', 'updated_at')
    
    def full_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip() or obj.username or "N/A"
    full_name.short_description = 'Name'
    
    def get_user_role(self, obj):
        from django.contrib.auth import get_user_model
        AuthUser = get_user_model()
        
        if obj.auth_user and obj.auth_user.is_superuser:
            return format_html(
                '<span class="badge" style="background-color: #6f42c1; color: white; font-weight: bold; padding: 0.375rem 0.75rem;">Owners</span>'
            )
        elif hasattr(obj, 'get_user_role_display'):
            role_display = obj.get_user_role_display()
        else:
            role_display = dict(obj.USER_ROLE_CHOICES).get(obj.user_role, obj.user_role.title() if obj.user_role else 'N/A')
        
        return format_html(
            '<span class="badge" style="background-color: #6c757d; color: white; font-weight: bold; padding: 0.375rem 0.75rem;">{}</span>',
            role_display
        )
    get_user_role.short_description = 'Role'
    get_user_role.admin_order_field = 'user_role'
    get_user_role.allow_tags = True
    
    def get_admin_approval_status(self, obj):
        return obj.get_admin_approval_status_display() or "N/A"
    get_admin_approval_status.short_description = 'Admin Status'
    get_admin_approval_status.admin_order_field = 'admin_approval_status'
    
    def get_joined_date(self, obj):
        if obj.created_at:
            return obj.created_at.date().strftime('%Y-%m-%d')
        return "N/A"
    get_joined_date.short_description = 'Joined'
    get_joined_date.admin_order_field = 'created_at'
    
    def get_auth_user_link(self, obj):
        if hasattr(obj, 'auth_user') and obj.auth_user:
            url = f"/admin/auth/user/{obj.auth_user.id}/change/"
            return format_html('<a href="{}">Yes</a>', mark_safe(url))
        return "No"
    get_auth_user_link.short_description = 'Django User'
    
    def approve_admins(self, request, queryset):
        updated = 0
        for user in queryset.filter(user_role='admin', admin_approval_status='pending'):
            user.admin_approval_status = 'approved'
            user.save()
            try:
                if hasattr(user, 'auth_user') and user.auth_user:
                    user.auth_user.is_staff = True
                    user.auth_user.is_active = True
                    user.auth_user.save()
            except:
                pass  # auth_user may be null
            updated += 1
        self.message_user(request, f'{updated} admin accounts approved.')
    
    def reject_admins(self, request, queryset):
        updated = 0
        for user in queryset.filter(user_role='admin'):
            user.admin_approval_status = 'rejected'
            user.save()
            try:
                if hasattr(user, 'auth_user') and user.auth_user:
                    user.auth_user.is_staff = False
                    user.auth_user.is_active = False
                    user.auth_user.save()
            except:
                pass  # auth_user may be null
            updated += 1
        self.message_user(request, f'{updated} admin accounts rejected.')
    
    actions = ['approve_admins', 'reject_admins']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'email', 'password')
        }),
        ('Admin Approval', {
            'fields': ('admin_approval_status',),
            'classes': ('collapse',)
        }),
        ('Django User Permissions', {
            'fields': ('auth_user',),
            'classes': ('collapse',)
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'gender', 'date_of_birth', 'phone_number')
        }),
        ('Professional Info', {
            'fields': ('user_role', 'company', 'location', 'bio')
        }),
        ('Media', {
            'fields': ('profile_picture',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'presenta_user', 'account_type')
    search_fields = ('user__username', 'presenta_user__username')
    readonly_fields = ('created_at', 'updated_at')


class DesignRequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'requester', 'designer', 'status', 'budget', 'currency', 'deadline', 'created_at')
    list_filter = ('status', 'created_at', 'deadline')
    search_fields = ('title', 'description', 'requester__username', 'designer__username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'status')
        }),
        ('Parties', {
            'fields': ('requester', 'designer')
        }),
        ('Details', {
            'fields': ('budget', 'currency', 'deadline', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(DesignRequest, DesignRequestAdmin)


class SampleItemInline(admin.TabularInline):
    model = SampleItem
    extra = 1
    fields = ('title', 'image', 'order', 'is_active')
    prepopulated_fields = {}


@admin.register(SampleCategory)
class SampleCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')
    inlines = [SampleItemInline]


@admin.register(SampleItem)
class SampleItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'client_name', 'order', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'project_date')
    search_fields = ('title', 'description', 'client_name', 'tags')
    ordering = ('category', 'order', '-created_at')
    fieldsets = (
        ('Content', {
            'fields': ('category', 'title', 'description', 'image')
        }),
        ('Metadata', {
            'fields': ('client_name', 'project_date', 'tags', 'link')
        }),
        ('Display', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
