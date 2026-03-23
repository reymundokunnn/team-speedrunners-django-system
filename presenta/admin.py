from django.contrib import admin
from .models import User, Profile, DesignRequest, RevisionRequest


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'user_role', 'joined_date')
    list_filter = ('user_role', 'joined_date')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    readonly_fields = ('joined_date', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'email', 'password')
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
            'fields': ('joined_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'account_type')
    search_fields = ('user__username', 'user__email')
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

@admin.register(RevisionRequest)
class RevisionRequestAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'user', 'is_completed', 'requested_at')
    list_filter = ('is_completed', 'requested_at')
    search_fields = ('file_name', 'description', 'user__username')
    date_hierarchy = 'requested_at'
    readonly_fields = ('requested_at',)
