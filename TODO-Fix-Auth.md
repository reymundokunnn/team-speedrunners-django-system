# TODO: Fix Authentication & Custom User Model Issues

**Status:** [ ] Not Started | [ ] In Progress | [x] Pending User Approval

## Steps (Sequential):

1. ✅ Add CustomUserManager to models.py
2. ✅ Assign User.objects = CustomUserManager() in models.py
3. **[PENDING]** Fix Profile.presenta_user property in models.py
4. ✅ Fix ProfileAdmin.list_display in admin.py
5. ✅ Run `python manage.py makemigrations presenta`
6. ✅ Run `python manage.py migrate`
7. **[PENDING]** Restart development server
8. **[PENDING]** Test login at http://127.0.0.1:8000/signin/
9. **[PENDING]** Mark complete & test admin interface

**Expected Result:** Login works without `'Manager' object has no attribute 'get_by_natural_key'` error. Admin list_display fixed.

**Next:** Update this file after each step ✅

