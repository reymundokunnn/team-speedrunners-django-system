// Admin dashboard JavaScript - Complete users management table functionality

// Existing functions (approve/reject)
function confirmAdminAction(userId, action) {
    if (!confirm(`Are you sure you want to ${action} this admin account? This action cannot be undone.`)) {
        return;
    }
    
    const url = `/manage/admin/${userId}/${action}/`;
    
    fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: new FormData(),
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 403) {
                return response.json().then(data => Promise.reject({message: 'Superuser access required', error: data.error}));
            }
            return response.json().then(data => Promise.reject(data));
        }
        return response.json();
    })
    .then(data => {
        showAdminActionModal(data.message, 'success');
        setTimeout(() => location.reload(), 1000);
    })
    .catch(error => {
        const msg = error.message || error.error || 'An error occurred';
        showAdminActionModal(msg, 'error');
        console.error('Admin action error:', error);
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showAdminActionModal(message, type = 'success') {
    const modal = document.createElement('div');
    modal.className = 'add-new-design-modal admin-action-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="this.closest('.add-new-design-modal').remove()" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="modal-icon modal-${type}">
                ${type === 'success' ? '✓' : '✗'}
            </div>
            <h2>${type === 'success' ? 'Success' : 'Error'}</h2>
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="this.closest('.add-new-design-modal').remove(); location.reload();">
                    OK
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('button').focus();
}

// NEW: View user details
function viewUser(userId) {
    fetch(`/manage/user/${userId}/view/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access denied. Admin required.');
            }
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        // Populate modal
        document.getElementById('viewUserName').textContent = (data.first_name + ' ' + data.last_name).trim() || data.username || 'Unknown';
        document.getElementById('viewUserUsername').textContent = '@' + (data.username || 'N/A');
        document.getElementById('viewUserEmail').textContent = data.email || 'N/A';
        const roleBadge = document.getElementById('viewUserRole');
        roleBadge.textContent = data.user_role_display || data.user_role || 'User';
        roleBadge.className = `role-badge role-${data.user_role || 'user'}`;
        document.getElementById('viewUserCompany').textContent = data.company || 'N/A';
        document.getElementById('viewUserLocation').textContent = data.location || 'N/A';
        document.getElementById('viewUserJoined').textContent = data.joined_date || 'N/A';
        document.getElementById('viewUserRequests').textContent = data.design_requests_count || 0;

        // Profile picture
        const profilePic = document.getElementById('viewUserProfilePic');
        const placeholder = document.getElementById('viewUserAvatarPlaceholder');
        if (data.profile_picture) {
            profilePic.src = data.profile_picture;
            profilePic.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            profilePic.style.display = 'none';
            placeholder.textContent = ((data.first_name || '')[0] || (data.username || '?')[0]).toUpperCase();
            placeholder.style.display = 'flex';
        }

        openModal('viewUserModal');
    })
    .catch(error => {
        console.error('Error:', error);
        showAdminActionModal('Error loading user data. Please try again. Error: ' + error.message, 'error');
    });
}

// NEW: Load edit form
function editUser(userId) {
    fetch(`/manage/user/${userId}/edit/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        document.getElementById('editUserId').value = data.id;
        document.getElementById('editUsername').value = data.username || '';
        document.getElementById('editEmail').value = data.email || '';
        document.getElementById('editFirstName').value = data.first_name || '';
        document.getElementById('editLastName').value = data.last_name || '';
        document.getElementById('editUserRole').value = data.user_role || 'user';
        document.getElementById('editGender').value = data.gender || '';
        document.getElementById('editPhone').value = data.phone_number || '';
        document.getElementById('editDOB').value = data.date_of_birth || '';
        document.getElementById('editCompany').value = data.company || '';
        document.getElementById('editLocation').value = data.location || '';
        document.getElementById('editBio').value = data.bio || '';
        openModal('editUserModal');
    })
    .catch(error => {
        console.error('Error:', error);
        showAdminActionModal('Error loading user data. Please try again. Error: ' + error.message, 'error');
    });
}

// NEW: Save edited user
function saveUser() {
    const userId = document.getElementById('editUserId').value;
    const formData = new FormData();
    formData.append('first_name', document.getElementById('editFirstName').value);
    formData.append('last_name', document.getElementById('editLastName').value);
    formData.append('email', document.getElementById('editEmail').value);
    formData.append('user_role', document.getElementById('editUserRole').value);
    formData.append('gender', document.getElementById('editGender').value);
    formData.append('phone_number', document.getElementById('editPhone').value);
    formData.append('date_of_birth', document.getElementById('editDOB').value);
    formData.append('company', document.getElementById('editCompany').value);
    formData.append('location', document.getElementById('editLocation').value);
    formData.append('bio', document.getElementById('editBio').value);

    fetch(`/manage/user/${userId}/edit/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('editUserModal');
            showAdminActionModal('User updated successfully!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showAdminActionModal(data.message || data.error || 'Update failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAdminActionModal('Error saving user. Please try again.', 'error');
    });
}

// NEW: Delete user confirmation
function deleteUser(userId) {
    fetch(`/manage/user/${userId}/view/`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('deleteUserId').value = userId;
        document.getElementById('deleteUserName').textContent = (data.first_name + ' ' + data.last_name).trim() || data.username || 'Unknown';
        openModal('deleteUserModal');
    })
    .catch(error => {
        console.error('Error:', error);
        showAdminActionModal('Error loading user data for deletion.', 'error');
    });
}

function confirmDeleteUser() {
    const userId = document.getElementById('deleteUserId').value;
    fetch(`/manage/user/${userId}/delete/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('deleteUserModal');
            showAdminActionModal('User deleted successfully!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showAdminActionModal(data.message || data.error || 'Deletion failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAdminActionModal('Error deleting user.', 'error');
    });
}

// NEW: Bulk actions
function toggleSelectAllUsers() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    userCheckboxes.forEach(function(checkbox) {
        checkbox.checked = selectAllCheckbox.checked;
    });
    updateBulkActions();
}

function updateBulkActions() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const bulkActionsBar = document.querySelector('.bulk-actions-bar');
    const selectedCount = document.getElementById('selectedCount');
    
    if (checkedBoxes.length > 0) {
        bulkActionsBar.classList.add('show');
        selectedCount.textContent = checkedBoxes.length + ' user' + (checkedBoxes.length > 1 ? 's' : '') + ' selected';
    } else {
        bulkActionsBar.classList.remove('show');
    }
    
    // Update select all checkbox
    const allCheckboxes = document.querySelectorAll('.user-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    if (checkedBoxes.length === allCheckboxes.length && allCheckboxes.length > 0) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedBoxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.indeterminate = true;
    }
}

function bulkDeleteUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const userIds = Array.from(checkedBoxes).map(cb => cb.value);
    
    if (userIds.length === 0) {
        showAdminActionModal('No users selected.', 'error');
        return;
    }
    
    document.getElementById('bulkDeleteUserIds').value = userIds.join(',');
    document.getElementById('bulkDeleteCount').textContent = userIds.length;
    openModal('bulkDeleteUserModal');
}

function confirmBulkDeleteUsers() {
    const userIds = document.getElementById('bulkDeleteUserIds').value.split(',');
    const promises = userIds.map(userId => 
        fetch(`/manage/user/${userId}/delete/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            }
        }).then(r => r.json())
    );
    
    Promise.all(promises)
    .then(results => {
        const successCount = results.filter(r => r.success).length;
        closeModal('bulkDeleteUserModal');
        showAdminActionModal(`${successCount} users deleted successfully!`, 'success');
        setTimeout(() => location.reload(), 1000);
    })
    .catch(error => {
        console.error('Bulk delete error:', error);
        showAdminActionModal('Error during bulk delete.', 'error');
    });
}

// NEW: Add user modal
function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserId').value = '';
    openModal('addUserModal');
}

function saveNewUser() {
    const formData = new FormData();
    formData.append('username', document.getElementById('addUsername').value);
    formData.append('email', document.getElementById('addEmail').value);
    formData.append('password', document.getElementById('addPassword').value);
    formData.append('first_name', document.getElementById('addFirstName').value);
    formData.append('last_name', document.getElementById('addLastName').value);
    formData.append('user_role', document.getElementById('addUserRole').value);
    formData.append('gender', document.getElementById('addGender').value);
    formData.append('phone_number', document.getElementById('addPhone').value);
    formData.append('company', document.getElementById('addCompany').value);
    formData.append('location', document.getElementById('addLocation').value);

    fetch('/manage/user/create/', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('addUserModal');
            showAdminActionModal('User created successfully!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showAdminActionModal(data.error || 'Creation failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAdminActionModal('Error creating user.', 'error');
    });
}

// NEW: Table filters
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filterDropdown');
    dropdown.classList.toggle('show');
}

function applyFilters() {
    const roleCheckboxes = document.querySelectorAll('#filterDropdown .filter-section:first-child input:checked');
    const selectedRoles = Array.from(roleCheckboxes).map(cb => cb.value);
    const statusCheckboxes = document.querySelectorAll('#filterDropdown .filter-section:nth-child(2) input:checked');
    const selectedStatuses = Array.from(statusCheckboxes).map(cb => cb.value);
    
    const tableBody = document.querySelector('.users-table tbody');
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.id === 'emptyStateRow') {
            row.style.display = 'none';
            return;
        }
        
        const roleBadge = row.querySelector('.role-badge');
        const roleClass = roleBadge ? roleBadge.className.match(/role-(\w+)/)?.[1] : '';
        
        const showByRole = selectedRoles.length === 0 || selectedRoles.includes(roleClass);
        const showByStatus = selectedStatuses.length === 0; // Status filter placeholder
        
        if (showByRole && showByStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show empty state
    const emptyRow = document.getElementById('emptyStateRow');
    if (emptyRow) {
        if (visibleCount === 0) {
            emptyRow.style.display = '';
            const span = emptyRow.querySelector('.empty-state span');
            span.textContent = selectedRoles.length ? 'No users match filters' : 'No users found';
        } else {
            emptyRow.style.display = 'none';
        }
    }
    
    toggleFilterDropdown(); // Close dropdown
}

function clearFilters() {
    document.querySelectorAll('#filterDropdown input[type="checkbox"]').forEach(cb => cb.checked = false);
    applyFilters();
}

// NEW: Generic modal helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    showAdminActionModal(message, type);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // User action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.dataset.userId;
            const action = this.dataset.action;
            if (action === 'view') viewUser(userId);
            else if (action === 'edit') editUser(userId);
            else if (action === 'delete') deleteUser(userId);
        });
    });
    
    // Checkbox listeners for bulk actions
    document.querySelectorAll('.user-checkbox').forEach(cb => {
        cb.addEventListener('change', updateBulkActions);
    });
    
    // Filter dropdown close on outside click
    document.addEventListener('click', e => {
        const container = document.querySelector('.filter-dropdown-container');
        if (container && !container.contains(e.target)) {
            document.getElementById('filterDropdown')?.classList.remove('show');
        }
    });
    
    updateBulkActions(); // Initial state
});

