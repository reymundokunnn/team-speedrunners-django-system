// Admin dashboard JavaScript for approval actions
// Add this to static/js/script.js or load separately

function confirmAdminAction(userId, action) {
    if (!confirm(`Are you sure you want to ${action} this admin account? This action cannot be undone.`)) {
        return;
    }
    
const url = `/manage/admin/${userId}/${action}/`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
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
        // Reload users section or update table row
        setTimeout(() => location.reload(), 1000);
    })
    .catch(error => {
        const msg = error.message || error.error || 'An error occurred';
        showAdminActionModal(msg, 'error');
        console.error('Admin action error:', error);
    })
    .catch(error => {
        showAdminActionModal('Network error. Please try again.', 'error');
        console.error('Error:', error);
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
    // Create modal for admin action feedback
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
    
    // Focus first element for accessibility
    modal.querySelector('button').focus();
}

function showNotification(message, type = 'info') {
    showAdminActionModal(message, type);
}
