# Fix RelatedObjectDoesNotExist: User has no presenta_user for superusers in /settings/unified/

## Status: [IN PROGRESS]

### Step 1: [COMPLETE ✓] Create/update management command to ensure all users have PresentaUser and Profile
- Created `presenta/management/commands/ensure_user_profiles.py`
- Run: `python manage.py ensure_user_profiles --superuser-only`

### Step 2: [COMPLETE ✓] Robustify deprecated settings views in presenta/views.py
- Replaced direct `user.presenta_user` → `get_presenta_user_safe(user)` in account_settings, designer_settings, admin_settings

### Step 3: [COMPLETE ✓] Enhance auth_backend.py for auto-creation on login
- Added `get_presenta_user_safe(auth_user)` calls in both username/email auth paths

### Step 4: [PENDING] Add safeguards to remaining views
- Wrap `user.profile.user_role` in try/except get_profile_safe() helper in dashboards, etc.

### Step 5: [PENDING] Test fix
- Run `python manage.py ensure_user_profiles --superuser-only`
- Restart server, login as superuser, access `/settings/unified/`

**Next Action:** Add remaining safeguards (Step 4) then test


### Step 4: [PENDING] Add safeguards to remaining views
- Fix direct `user.profile.user_role` accesses that may fail pre-profile creation

### Step 5: [PENDING] Test as superuser
- Run `python manage.py ensure_user_profiles --superuser-only`
- Access http://localhost:8000/settings/unified/

**Next Action:** Enhance auth_backend.py (Step 3)


### Step 3: [PENDING] Enhance auth_backend.py for auto-creation on login

### Step 4: [PENDING] Add safeguards to remaining views

### Step 5: [PENDING] Test as superuser

### Step 6: [PENDING] Cleanup

**Next Action:** Fix deprecated settings views (Step 2)

- Create `presenta/management/commands/ensure_user_profiles.py`
- Command scans all DjangoUsers, creates missing PresentaUser (admin role for superusers) and Profile links

### Step 2: [PENDING] Robustify deprecated settings views in presenta/views.py
- Replace direct `user.presenta_user` with `get_presenta_user_safe(user)` in:
  - account_settings
  - designer_settings  
  - admin_settings
- Remove any unsafe direct accesses

### Step 3: [PENDING] Enhance auth_backend.py for auto-creation on login
- Ensure login always triggers profile creation via get_presenta_user_safe

### Step 4: [PENDING] Add safeguards to remaining views
- Scan and fix any other direct `user.presenta_user` accesses

### Step 5: [PENDING] Test as superuser
- Run command: python manage.py ensure_user_profiles
- Access http://localhost:8000/settings/unified/ as superuser
- Verify no exception, settings load correctly

### Step 6: [PENDING] Cleanup
- Update this TODO.md as steps complete
- Remove deprecated views if confirmed unused
- attempt_completion

**Next Action:** Implement Step 1 (management command)

