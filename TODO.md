# Fix Approve/Reject Buttons for Pending Admins

## Plan Steps:
- [x] 1. Create TODO.md with tracking
- [x] 2. Update static/js/admin_actions.js fetch for CSRF fix
- [x] 3. Fix presenta/views.py: get_object_or_404(User → PresentaUser) in approve/reject_admin
- [ ] 4. Test: Click approve/reject → check console/network (expect 200 OK + reload)
- [ ] 5. Verify DB: Pending admin status → 'approved'/'rejected'
- [ ] 6. Complete task

**Status**: Backend fixed. Test buttons now (expect success modal + reload).
