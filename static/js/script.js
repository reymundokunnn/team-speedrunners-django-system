const darkModeCheckbox = document.querySelector('.dark-toggle-switcher input[type="checkbox"]');
const body = document.body;

const darkModePreference = localStorage.getItem('darkMode');
if (darkModePreference === 'enabled') {
    body.classList.add('dark-mode');
    if (darkModeCheckbox) {
        darkModeCheckbox.checked = true;
    }
} else {
    body.classList.remove('dark-mode');
    if (darkModeCheckbox) {
        darkModeCheckbox.checked = false;
    }
}

if (darkModeCheckbox) {
    darkModeCheckbox.addEventListener('change', function () {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

const menuBtn = document.querySelector('.menu-btn');
const mobileDropdown = document.querySelector('.mobile-dropdown-hidden');

if (menuBtn) {
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        if (mobileDropdown.classList.contains('show')) {
            mobileDropdown.classList.remove('show');
            mobileDropdown.classList.add('hide');

            setTimeout(() => {
                mobileDropdown.classList.remove('hide');
                mobileDropdown.style.display = 'none';
            }, 300);
        } else {
            mobileDropdown.style.display = 'flex';
            mobileDropdown.classList.add('show');
        }
    });
}

document.addEventListener('click', function (e) {
    if (mobileDropdown && mobileDropdown.classList.contains('show')) {
        if (!mobileDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileDropdown.classList.remove('show');
            mobileDropdown.classList.add('hide');

            setTimeout(() => {
                mobileDropdown.classList.remove('hide');
                mobileDropdown.style.display = 'none';
            }, 300);
        }
    }
});

if (mobileDropdown) {
    const dropdownLinks = mobileDropdown.querySelectorAll('a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileDropdown.classList.remove('show');
            mobileDropdown.classList.add('hide');

            setTimeout(() => {
                mobileDropdown.classList.remove('hide');
                mobileDropdown.style.display = 'none';
            }, 300);
        });
    });
}

// User Profile Dropdown
const userProfileToggle = document.getElementById('user-profile-toggle');
const userDropdownMenu = document.getElementById('user-dropdown-menu');

if (userProfileToggle && userDropdownMenu) {
    userProfileToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!userProfileToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
            userDropdownMenu.classList.remove('active');
        }
    });

    // Close dropdown when a link is clicked
    const dropdownItems = userDropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function () {
            userDropdownMenu.classList.remove('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const sideMenuIcon = document.querySelector('.side-menu-icon');
    if (sideMenuIcon) {
        sideMenuIcon.addEventListener('click', toggleSidebar);
    } else {
        console.error('Side menu icon not found');
    }
});

function toggleSidebar() {
    const sidebar = document.querySelector('.side-panel');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    } else {
        console.error('Sidebar element not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.side-panel');
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed');
    
    if (sidebar && sidebarCollapsed === 'true') {
        sidebar.classList.add('collapsed');
    }
});

function toggleForms(event) {
    event.preventDefault();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (!loginForm || !registerForm) return;

    if (loginForm.classList.contains('form-hidden')) {
        loginForm.style.display = 'flex';
        loginForm.classList.remove('form-hidden');
        loginForm.style.animation = 'fadeIn 0.4s ease-out';

        registerForm.classList.add('form-hidden');
        setTimeout(() => {
            registerForm.style.display = 'none';
        }, 300);
    } else {
        registerForm.style.display = 'flex';
        registerForm.classList.remove('form-hidden');
        registerForm.style.animation = 'fadeIn 0.4s ease-out';

        loginForm.classList.add('form-hidden');
        setTimeout(() => {
            loginForm.style.display = 'none';
        }, 300);
    }
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        button.querySelector('.eye-icon').textContent = '🙈';
    } else {
        input.type = 'password';
        button.querySelector('.eye-icon').textContent = '👁️';
    }
}

function initPasswordStrengthMeter() {
    const password1Input = document.getElementById('id_password1');
    const password2Input = document.getElementById('id_password2');
    const strengthFill = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');

    if (password1Input && strengthFill && strengthText) {
        // remove existing listener to prevent duplicates
        password1Input.removeEventListener('input', updatePasswordStrength);
        password1Input.addEventListener('input', updatePasswordStrength);
    }

    if (password1Input && password2Input) {
        // remove existing listener to prevent duplicates
        password2Input.removeEventListener('input', checkPasswordMatch);
        password1Input.removeEventListener('input', checkPasswordMatch);
        password2Input.addEventListener('input', checkPasswordMatch);
        password1Input.addEventListener('input', checkPasswordMatch);
    }
}

function updatePasswordStrength() {
    const password = this.value;
    const strengthFill = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    strengthFill.classList.remove('weak', 'medium', 'strong');

    if (password.length === 0) {
        strengthFill.style.width = '0';
        strengthText.textContent = '';
    } else if (strength <= 2) {
        strengthFill.style.width = '33%';
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 3) {
        strengthFill.style.width = '66%';
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium password';
    } else {
        strengthFill.style.width = '100%';
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

function checkPasswordMatch() {
    const password1 = document.getElementById('id_password1').value;
    const password2 = document.getElementById('id_password2').value;
    const password2Input = document.getElementById('id_password2');
    let matchMessage = document.getElementById('password-match-message');

    // Create match message element if it doesn't exist
    if (!matchMessage) {
        matchMessage = document.createElement('div');
        matchMessage.id = 'password-match-message';
        matchMessage.className = 'password-match-message';
        password2Input.parentElement.parentElement.appendChild(matchMessage);
    }

    if (password2.length === 0) {
        matchMessage.textContent = '';
        matchMessage.className = 'password-match-message';
    } else if (password1 === password2) {
        matchMessage.textContent = 'Passwords match';
        matchMessage.className = 'password-match-message match-success';
    } else {
        matchMessage.textContent = 'Passwords do not match';
        matchMessage.className = 'password-match-message match-error';
    }
}


document.addEventListener('DOMContentLoaded', function () {
    initPasswordStrengthMeter();
});

const originalToggleForms = toggleForms;
toggleForms = function(event) {
    originalToggleForms(event);
    // Small delay to ensure DOM is updated
    setTimeout(initPasswordStrengthMeter, 100);
};

/* Form Loading State */
document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
        });
    });
});

// Auto-show registration form if viewing registration page with errors
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');

    if (!registerForm) return;

    const hasRegisterErrors = registerForm.querySelector('.form-errors') !== null;
    const hasFilledFields = registerForm.querySelector('input[type="text"][value!=""]') !== null;

    if (hasRegisterErrors || hasFilledFields) {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.classList.add('form-hidden');
            loginForm.style.display = 'none';
        }
        registerForm.classList.remove('form-hidden');
        registerForm.style.display = 'flex';
    }
});

/* Modal Functions */
function openModal(modalType) {
    const modal = document.getElementById(modalType);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalType) {
    const modal = document.getElementById(modalType);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function openForgotPasswordModal() {
    openModal('forgotPasswordModal');
    // Clear any previous messages
    const messageEl = document.getElementById('forgotPasswordMessage');
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = 'form-message';
    }
}

function closeForgotPasswordModal() {
    closeModal('forgotPasswordModal');
    // Reset form
    const form = document.getElementById('forgotPasswordForm');
    if (form) form.reset();
    const messageEl = document.getElementById('forgotPasswordMessage');
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = 'form-message';
    }
}

function submitForgotPassword(event) {
    event.preventDefault();
    const identifier = document.getElementById('forgotPasswordIdentifier').value.trim();
    const messageEl = document.getElementById('forgotPasswordMessage');
    const submitBtn = document.getElementById('forgotPasswordSubmit');
    
    if (!identifier) {
        messageEl.textContent = 'Please enter your email or username';
        messageEl.className = 'form-error-text';
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Call the lookup endpoint
    fetch('/password-reset/lookup/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        body: new URLSearchParams({ identifier: identifier })
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        if (data.found) {
            // Store user ID and show reset form
            document.getElementById('resetUserId').value = data.user_id;
            document.getElementById('resetPasswordUserInfo').textContent = 
                'Create a new password for ' + (data.email || data.username);
            closeForgotPasswordModal();
            openResetPasswordFormModal();
        } else {
            messageEl.textContent = data.error || 'No account found with that email or username.';
            messageEl.className = 'form-error-text';
        }
    })
    .catch(error => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        messageEl.textContent = 'An error occurred. Please try again.';
        messageEl.className = 'form-error-text';
        console.error('Forgot password error:', error);
    });
}

/* Reset Password Form Modal */
function openResetPasswordFormModal() {
    openModal('resetPasswordFormModal');
    // Initialize password strength meter for reset form
    initResetPasswordStrengthMeter();
}

function closeResetPasswordFormModal() {
    closeModal('resetPasswordFormModal');
    // Reset form
    const form = document.getElementById('resetPasswordForm');
    if (form) form.reset();
    const messageEl = document.getElementById('resetPasswordFormMessage');
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = 'form-message';
    }
    // Clear match message
    const matchMessage = document.getElementById('resetPasswordMatchMessage');
    if (matchMessage) {
        matchMessage.textContent = '';
        matchMessage.className = 'password-match-message';
    }
    // Clear strength indicator
    const strengthFill = document.getElementById('resetPasswordStrengthFill');
    const strengthText = document.getElementById('resetPasswordStrengthText');
    if (strengthFill) {
        strengthFill.style.width = '0';
        strengthFill.className = 'strength-fill';
    }
    if (strengthText) strengthText.textContent = '';
}

function initResetPasswordStrengthMeter() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    const strengthFill = document.getElementById('resetPasswordStrengthFill');
    const strengthText = document.getElementById('resetPasswordStrengthText');

    if (newPasswordInput && strengthFill && strengthText) {
        // Remove existing listener to prevent duplicates
        newPasswordInput.removeEventListener('input', updateResetPasswordStrength);
        newPasswordInput.addEventListener('input', updateResetPasswordStrength);
    }

    if (newPasswordInput && confirmPasswordInput) {
        // Remove existing listener to prevent duplicates
        confirmPasswordInput.removeEventListener('input', checkResetPasswordMatch);
        newPasswordInput.removeEventListener('input', checkResetPasswordMatch);
        confirmPasswordInput.addEventListener('input', checkResetPasswordMatch);
        newPasswordInput.addEventListener('input', checkResetPasswordMatch);
    }
}

function updateResetPasswordStrength() {
    const password = this.value;
    const strengthFill = document.getElementById('resetPasswordStrengthFill');
    const strengthText = document.getElementById('resetPasswordStrengthText');
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    strengthFill.classList.remove('weak', 'medium', 'strong');

    if (password.length === 0) {
        strengthFill.style.width = '0';
        strengthText.textContent = '';
    } else if (strength <= 2) {
        strengthFill.style.width = '33%';
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 3) {
        strengthFill.style.width = '66%';
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium password';
    } else {
        strengthFill.style.width = '100%';
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

function checkResetPasswordMatch() {
    const password1 = document.getElementById('newPassword').value;
    const password2 = document.getElementById('confirmNewPassword').value;
    const matchMessage = document.getElementById('resetPasswordMatchMessage');

    if (password2.length === 0) {
        matchMessage.textContent = '';
        matchMessage.className = 'password-match-message';
    } else if (password1 === password2) {
        matchMessage.textContent = 'Passwords match';
        matchMessage.className = 'password-match-message match-success';
    } else {
        matchMessage.textContent = 'Passwords do not match';
        matchMessage.className = 'password-match-message match-error';
    }
}

function submitResetPassword(event) {
    event.preventDefault();
    const userId = document.getElementById('resetUserId').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const messageEl = document.getElementById('resetPasswordFormMessage');
    const submitBtn = document.getElementById('resetPasswordSubmit');
    
    // Validation
    if (!newPassword || !confirmPassword) {
        messageEl.textContent = 'Please fill in both password fields';
        messageEl.className = 'form-error-text';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        messageEl.textContent = 'Passwords do not match';
        messageEl.className = 'form-error-text';
        return;
    }
    
    if (newPassword.length < 8) {
        messageEl.textContent = 'Password must be at least 8 characters long';
        messageEl.className = 'form-error-text';
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Submit the new password
    fetch('/password-reset/confirm/' + userId + '/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        body: new URLSearchParams({
            new_password: newPassword,
            confirm_password: confirmPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        if (data.success) {
            messageEl.textContent = 'Password reset successfully! Redirecting to login...';
            messageEl.className = 'form-success-text';
            setTimeout(() => {
                closeResetPasswordFormModal();
                // Show success message on login form
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    // Create or update success message
                    let successDiv = loginForm.querySelector('.form-success');
                    if (!successDiv) {
                        successDiv = document.createElement('div');
                        successDiv.className = 'form-success';
                        loginForm.insertBefore(successDiv, loginForm.firstChild);
                    }
                    successDiv.textContent = 'Password reset successfully! Please sign in with your new password.';
                }
            }, 2000);
        } else {
            messageEl.textContent = data.error || 'An error occurred. Please try again.';
            messageEl.className = 'form-error-text';
        }
    })
    .catch(error => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        messageEl.textContent = 'An error occurred. Please try again.';
        messageEl.className = 'form-error-text';
        console.error('Reset password error:', error);
    });
}

// Close modal when clicking outside of modal content
document.addEventListener('DOMContentLoaded', function () {
    const modals = document.querySelectorAll('[id$="modal"]');
    modals.forEach(modal => {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});

// Attach open modal to button
document.addEventListener('DOMContentLoaded', function () {
    const reqNewBtn = document.querySelector('.req-new');
    if (reqNewBtn) {
        reqNewBtn.addEventListener('click', function () {
            openModal('modal');
        });
    }
});

// Update greeting based on time of day
document.addEventListener('DOMContentLoaded', function () {
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        const hour = new Date().getHours();
        let greeting = 'Good day';

        if (hour >= 0 && hour < 12) {
            greeting = 'Good morning';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }

        // Get the first name span
        const firstNameSpan = greetingElement.querySelector('.orange');
        const firstName = firstNameSpan ? firstNameSpan.textContent : '';

        // Update the greeting text
        if (firstName) {
            greetingElement.innerHTML = greeting + ', <span class="orange">' + firstName + '</span>!';
        } else {
            greetingElement.textContent = greeting + '!';
        }
    }
});

// File upload drag and drop functionality
document.addEventListener('DOMContentLoaded', function () {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('reference_files');
    const fileList = document.getElementById('fileList');
    const fileUploadLink = document.querySelector('.file-upload-link');

    if (!fileUploadArea || !fileInput) return;

    // Helper function to merge existing files with new files
    function mergeFiles(existingFiles, newFiles) {
        const dt = new DataTransfer();

        // Add existing files first
        for (let i = 0; i < existingFiles.length; i++) {
            dt.items.add(existingFiles[i]);
        }

        // Add new files - but only those that aren't already in existingFiles
        for (let i = 0; i < newFiles.length; i++) {
            const newFile = newFiles[i];
            let isDuplicate = false;

            // Check if this file already exists in existingFiles
            for (let j = 0; j < existingFiles.length; j++) {
                // Compare by name and size to detect duplicates
                if (existingFiles[j].name === newFile.name && existingFiles[j].size === newFile.size) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                dt.items.add(newFile);
            }
        }

        return dt.files;
    }

    // Click to browse - trigger file input click
    if (fileUploadLink) {
        fileUploadLink.addEventListener('click', function (e) {
            e.preventDefault();
            fileInput.click();
        });
    }

    // File input change - accumulate files (only new files, not duplicates)
    fileInput.addEventListener('change', function () {
        const mergedFiles = mergeFiles(fileInput.files, this.files);
        fileInput.files = mergedFiles;
        displayFiles(fileInput.files);
        // Note: Don't reset input value here as it clears the files
        // The input value will be reset when the form is submitted or modal is closed
    });

    // Drag and drop events
    fileUploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileUploadArea.classList.remove('dragover');

        const droppedFiles = e.dataTransfer.files;
        const mergedFiles = mergeFiles(fileInput.files, droppedFiles);
        fileInput.files = mergedFiles;
        displayFiles(fileInput.files);
    });

    function displayFiles(files) {
        if (!fileList) return;

        fileList.innerHTML = '';
        const fileArray = Array.from(files);

        // Toggle upload text visibility
        const uploadText = fileUploadArea.querySelector('p');
        if (uploadText) {
            uploadText.style.display = fileArray.length > 0 ? 'none' : 'block';
        }

        if (fileArray.length === 0) {
            return;
        }

        const ul = document.createElement('ul');

        fileArray.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-item-info';

            const fileIcon = document.createElement('span');
            fileIcon.className = 'file-item-icon';
            fileIcon.textContent = '📄';

            const fileName = document.createElement('span');
            fileName.className = 'file-item-name';
            fileName.textContent = file.name;

            const fileSize = document.createElement('span');
            fileSize.className = 'file-item-size';
            fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';

            fileInfo.appendChild(fileIcon);
            fileInfo.appendChild(fileName);
            fileInfo.appendChild(fileSize);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-item-remove';
            removeBtn.textContent = '✕';
            removeBtn.type = 'button';
            removeBtn.setAttribute('aria-label', 'Remove file');
            removeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                removeFile(index);
            });

            li.appendChild(fileInfo);
            li.appendChild(removeBtn);
            ul.appendChild(li);
        });

        fileList.appendChild(ul);
    }

    function removeFile(index) {
        const dt = new DataTransfer();
        const files = fileInput.files;

        for (let i = 0; i < files.length; i++) {
            if (i !== index) {
                dt.items.add(files[i]);
            }
        }

        fileInput.files = dt.files;
        displayFiles(fileInput.files);
    }
});

/* Designer Dashboard - Project Modal Functions */
var currentDesignId = null;

document.addEventListener('DOMContentLoaded', function () {
    // Project link click handlers
    var projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var link = e.currentTarget;
            openProjectModal(
                link.dataset.id,
                link.dataset.title,
                link.dataset.description,
                link.dataset.status,
                link.dataset.requester,
                link.dataset.deadline,
                link.dataset.budget,
                link.dataset.completedAt
            );
        });
    });

    // Status update form submission
    var statusForm = document.getElementById('statusUpdateForm');
    if (statusForm) {
        statusForm.addEventListener('submit', function (e) {
            var status = document.getElementById('status_select').value;
            if (status === 'completed') {
                e.preventDefault();
                openModal('confirmModal');
            }
        });
    }

    // Finished file input change - accumulate files
    var finishedFileInput = document.getElementById('finished_file');
    var modalFileUploadArea = document.getElementById('modalFileUploadArea');
    var modalFileList = document.getElementById('modalFileList');

    if (finishedFileInput && modalFileUploadArea) {
        // Helper function to merge files for modal
        function mergeModalFiles(existingFiles, newFiles) {
            var dt = new DataTransfer();

            // Add existing files first
            for (var i = 0; i < existingFiles.length; i++) {
                dt.items.add(existingFiles[i]);
            }

            // Add new files - but only those that aren't already in existingFiles
            for (var i = 0; i < newFiles.length; i++) {
                var newFile = newFiles[i];
                var isDuplicate = false;

                // Check if this file already exists in existingFiles
                for (var j = 0; j < existingFiles.length; j++) {
                    // Compare by name and size to detect duplicates
                    if (existingFiles[j].name === newFile.name && existingFiles[j].size === newFile.size) {
                        isDuplicate = true;
                        break;
                    }
                }

                if (!isDuplicate) {
                    dt.items.add(newFile);
                }
            }

            return dt.files;
        }

        // Click to browse - only trigger when clicking on the text or upload area, not on file list
        modalFileUploadArea.addEventListener('click', function (e) {
            // Don't trigger if clicking on file list items or remove buttons
            if (e.target.closest('.file-list') || e.target.closest('.file-item-remove')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            finishedFileInput.click();
        });

        // Also handle click on the file-upload-link specifically
        var fileUploadLink = modalFileUploadArea.querySelector('.file-upload-link');
        if (fileUploadLink) {
            fileUploadLink.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                finishedFileInput.click();
            });
        }

        // Drag and drop events
        modalFileUploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            modalFileUploadArea.classList.add('dragover');
        });

        modalFileUploadArea.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            modalFileUploadArea.classList.remove('dragover');
        });

        modalFileUploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            modalFileUploadArea.classList.remove('dragover');

            var droppedFiles = e.dataTransfer.files;
            var mergedFiles = mergeModalFiles(finishedFileInput.files, droppedFiles);
            finishedFileInput.files = mergedFiles;
            displayModalFiles(finishedFileInput.files);
        });

        // File input change - accumulate files (only new files, not duplicates)
        finishedFileInput.addEventListener('change', function (e) {
            var mergedFiles = mergeModalFiles(finishedFileInput.files, this.files);
            finishedFileInput.files = mergedFiles;
            displayModalFiles(finishedFileInput.files);
            // Note: Don't reset input value here as it clears the files
            // The input value will be reset when the form is submitted or modal is closed
        });

        // Display files function for modal
        function displayModalFiles(files) {
            if (!modalFileList) return;

            modalFileList.innerHTML = '';

            // Toggle upload text visibility
            var uploadText = modalFileUploadArea.querySelector('p');
            if (uploadText) {
                uploadText.style.display = files.length > 0 ? 'none' : 'block';
            }

            if (files.length === 0) {
                return;
            }

            var ul = document.createElement('ul');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var li = document.createElement('li');
                li.className = 'file-item';

                var fileInfo = document.createElement('div');
                fileInfo.className = 'file-item-info';

                var fileIcon = document.createElement('span');
                fileIcon.className = 'file-item-icon';
                fileIcon.textContent = '📄';

                var fileName = document.createElement('span');
                fileName.className = 'file-item-name';
                fileName.textContent = file.name;

                var fileSize = document.createElement('span');
                fileSize.className = 'file-item-size';
                fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';

                fileInfo.appendChild(fileIcon);
                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileSize);

                // Add remove button
                var removeBtn = document.createElement('button');
                removeBtn.className = 'file-item-remove';
                removeBtn.textContent = '✕';
                removeBtn.type = 'button';
                removeBtn.setAttribute('aria-label', 'Remove file');
                removeBtn.addEventListener('click', (function (index) {
                    return function (e) {
                        e.preventDefault();
                        removeModalFile(index);
                    };
                })(i));

                li.appendChild(fileInfo);
                li.appendChild(removeBtn);
                ul.appendChild(li);
            }
            modalFileList.appendChild(ul);
        }

        // Remove file function for modal
        function removeModalFile(index) {
            var dt = new DataTransfer();
            var files = finishedFileInput.files;

            for (var i = 0; i < files.length; i++) {
                if (i !== index) {
                    dt.items.add(files[i]);
                }
            }

            finishedFileInput.files = dt.files;
            displayModalFiles(finishedFileInput.files);
        }
    }
});

function openProjectModal(id, title, description, status, requester, deadline, budget, completedAt) {
    currentDesignId = id;
    document.getElementById('modalDesignId').value = id;
    document.getElementById('modalProjectTitle').textContent = title;
    document.getElementById('modalDescription').textContent = description || 'No description provided.';
    document.getElementById('modalRequester').textContent = requester;
    document.getElementById('modalDeadline').textContent = deadline;
    document.getElementById('modalBudget').textContent = budget;

    var statusBadge = document.getElementById('modalProjectStatus');
    statusBadge.className = 'status-badge status-' + status;
    statusBadge.textContent = status.replace('_', ' ');

    var statusSelect = document.getElementById('status_select');
    statusSelect.value = status;

    // Set form action dynamically
    var form = document.getElementById('statusUpdateForm');
    form.action = '/design-request/' + id + '/update-status/';

    // Handle completed status - show read-only view
    var isCompleted = status === 'completed';
    var statusUpdateForm = document.getElementById('statusUpdateForm');
    var completedMessage = document.getElementById('completedMessage');
    var completionInfoSection = document.getElementById('completionInfoSection');
    var modalFinishedFilesSection = document.getElementById('modalFinishedFilesSection');
    var modalCompletedDate = document.getElementById('modalCompletedDate');

    if (isCompleted) {
        // Hide status update form and show completed message
        if (statusUpdateForm) statusUpdateForm.style.display = 'none';
        if (completedMessage) completedMessage.style.display = 'block';
        if (completionInfoSection) {
            completionInfoSection.style.display = 'block';
            modalCompletedDate.textContent = completedAt || 'Not available';
        }
        if (modalFinishedFilesSection) {
            modalFinishedFilesSection.style.display = 'block';
            // Fetch and display finished files
            var modalFinishedFilesList = document.getElementById('modalFinishedFilesList');
            if (modalFinishedFilesList) {
                modalFinishedFilesList.innerHTML = '<li class="loading-files">Loading finished files...</li>';
                fetch('/api/finished-files/' + id + '/')
                    .then(function (response) {
                        if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
                        return response.json();
                    })
                    .then(function (data) {
                        modalFinishedFilesList.innerHTML = '';
                        if (data.files && data.files.length > 0) {
                            data.files.forEach(function (file) {
                                var li = document.createElement('li');
                                li.innerHTML = '<a href="' + file.url + '" download class="file-link"><span class="file-icon">📄</span> ' + file.filename + '</a> <span class="file-date">' + file.uploaded_at + '</span>';
                                modalFinishedFilesList.appendChild(li);
                            });
                        } else {
                            modalFinishedFilesList.innerHTML = '<li class="no-files">No finished files uploaded</li>';
                        }
                    })
                    .catch(function (error) {
                        console.error('Error fetching finished files:', error);
                        modalFinishedFilesList.innerHTML = '<li class="no-files">Unable to load finished files</li>';
                    });
            }
        }
    } else {
        // Show status update form for non-completed projects
        if (statusUpdateForm) statusUpdateForm.style.display = 'block';
        if (completedMessage) completedMessage.style.display = 'none';
        if (completionInfoSection) completionInfoSection.style.display = 'none';
        if (modalFinishedFilesSection) modalFinishedFilesSection.style.display = 'none';
        handleStatusChange(status);
    }

    // Fetch and display reference files
    var modalFilesSection = document.getElementById('modalFilesSection');
    var modalReferenceFilesList = document.getElementById('modalReferenceFilesList');

    if (modalFilesSection && modalReferenceFilesList) {
        // Reset to loading state
        modalReferenceFilesList.innerHTML = '<li class="loading-files">Loading reference files...</li>';

        fetch('/api/reference-files/' + id + '/')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                modalReferenceFilesList.innerHTML = '';

                if (data.error) {
                    modalReferenceFilesList.innerHTML = '<li class="no-files">Error: ' + data.error + '</li>';
                    return;
                }

                if (data.files && data.files.length > 0) {
                    data.files.forEach(function (file) {
                        var li = document.createElement('li');
                        li.innerHTML = '<a href="' + file.url + '" download class="file-link"><span class="file-icon">📄</span> ' + file.filename + '</a> <span class="file-date">' + file.uploaded_at + '</span>';
                        modalReferenceFilesList.appendChild(li);
                    });
                } else {
                    modalReferenceFilesList.innerHTML = '<li class="no-files">No reference files uploaded</li>';
                }
            })
            .catch(function (error) {
                console.error('Error fetching reference files:', error);
                modalReferenceFilesList.innerHTML = '<li class="no-files">Unable to load reference files</li>';
            });
    }

    openModal('projectModal');
}

function closeProjectModal() {
    closeModal('projectModal');
    currentDesignId = null;
}

function handleStatusChange(status) {
    var fileUploadGroup = document.getElementById('fileUploadGroup');
    if (fileUploadGroup) {
        if (status === 'completed') {
            fileUploadGroup.style.display = 'flex';
        } else {
            fileUploadGroup.style.display = 'none';
        }
    }
}

function closeConfirmModal() {
    closeModal('confirmModal');
}

function confirmCompletion() {
    closeModal('confirmModal');

    // Check if file is uploaded
    var fileInput = document.getElementById('finished_file');
    if (fileInput && !fileInput.files.length) {
        alert('Please upload a finished file before marking as completed.');
        return;
    }

    // Submit the form
    document.getElementById('statusUpdateForm').submit();
}

function openCancelConfirmModal() {
    openModal('cancelConfirmModal');
}

function closeCancelConfirmModal() {
    closeModal('cancelConfirmModal');
}

function confirmCancelProject() {
    // Use POST to reject the project
    var designId = document.getElementById('modalDesignId').value;

    // Create a form dynamically and submit it
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = '/design-request/' + designId + '/reject/';

    // Add CSRF token
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        var csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken.value;
        form.appendChild(csrfInput);
    }

    document.body.appendChild(form);
    form.submit();
}

/* User Dashboard - Edit Modal Functions */
function openEditModal(button) {
    var requestId = button.dataset.requestId;
    var title = button.dataset.title;
    var designType = button.dataset.designType;
    var description = button.dataset.description;
    var budget = button.dataset.budget;
    var currency = button.dataset.currency || 'USD';
    var deadline = button.dataset.deadline;

    // Set form action URL
    var editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.action = '/design-request/' + requestId + '/edit/';

        // Populate form fields
        document.getElementById('edit_title').value = title;
        document.getElementById('edit_design_type').value = designType;
        document.getElementById('edit_description').value = description;
        document.getElementById('edit_budget').value = budget;
        document.getElementById('edit_currency').value = currency;
        document.getElementById('edit_deadline').value = deadline;

        // Show modal using openModal
        openModal('editModal');
    }
}

function closeEditModal() {
    closeModal('editModal');
}

/* User Dashboard - Delete Modal Functions */
function openDeleteModal(button) {
    var requestId = button.dataset.requestId;
    var title = button.dataset.title;

    // Set form action URL
    var deleteForm = document.getElementById('deleteForm');
    if (deleteForm) {
        deleteForm.action = '/design-request/' + requestId + '/delete/';

        // Set title
        document.getElementById('deleteRequestTitle').textContent = title;

        // Show modal
        openModal('deleteModal');
    }
}

function closeDeleteModal() {
    closeModal('deleteModal');
}

/* Designer Dashboard - Available Requests View Details */
function openAvailableRequestModal(button) {
    console.log('openAvailableRequestModal called', button);

    // Get the request ID from the button
    var requestId = button.getAttribute('data-id');
    console.log('Request ID:', requestId);

    // Get the parent request-card data
    var card = button.closest('.request-card');
    console.log('Card found:', card);

    if (card) {
        var title = card.querySelector('h4').textContent;
        var description = card.querySelector('.description').textContent;
        var budget = card.querySelector('.budget').textContent;
        var requesterSpan = card.querySelector('.request-meta span:first-child');
        var requester = requesterSpan ? requesterSpan.textContent.replace('👤 ', '') : 'User';
        var deadlineEl = card.querySelector('.request-meta span:last-child');
        var deadline = deadlineEl ? deadlineEl.textContent.replace('📅 ', '') : 'No deadline';

        // Set modal content
        document.getElementById('modalProjectTitle').textContent = title;
        document.getElementById('modalDescription').textContent = description;
        document.getElementById('modalRequester').textContent = requester;
        document.getElementById('modalDeadline').textContent = deadline;
        document.getElementById('modalBudget').textContent = budget;

        var statusBadge = document.getElementById('modalProjectStatus');
        statusBadge.className = 'status-badge status-pending';
        statusBadge.textContent = 'Available';

        // Hide status update form for available requests
        var statusForm = document.getElementById('statusUpdateForm');
        if (statusForm) {
            statusForm.style.display = 'none';
        }

        // Show modal first so elements are visible
        openModal('projectModal');

        // Fetch and display reference files for available requests
        var modalFilesSection = document.getElementById('modalFilesSection');
        var modalReferenceFilesList = document.getElementById('modalReferenceFilesList');

        console.log('modalFilesSection:', modalFilesSection);
        console.log('modalReferenceFilesList:', modalReferenceFilesList);
        console.log('requestId:', requestId);

        if (modalFilesSection && modalReferenceFilesList && requestId) {
            console.log('Fetching reference files for request:', requestId);

            // Show loading state
            modalFilesSection.style.display = 'block';
            modalReferenceFilesList.innerHTML = '<li>Loading files...</li>';

            fetch('/api/reference-files/' + requestId + '/')
                .then(function (response) {
                    console.log('Response status:', response.status);
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.status);
                    }
                    return response.json();
                })
                .then(function (data) {
                    console.log('Files data:', data);
                    modalReferenceFilesList.innerHTML = '';

                    if (data.error) {
                        console.error('API error:', data.error);
                        modalFilesSection.style.display = 'none';
                        return;
                    }

                    if (data.files && data.files.length > 0) {
                        console.log('Found', data.files.length, 'files');
                        modalFilesSection.style.display = 'block';
                        data.files.forEach(function (file) {
                            var li = document.createElement('li');
                            li.innerHTML = '<a href="' + file.url + '" download>' + file.filename + '</a>';
                            modalReferenceFilesList.appendChild(li);
                        });
                    } else {
                        console.log('No files found');
                        modalFilesSection.style.display = 'none';
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching reference files:', error);
                    modalFilesSection.style.display = 'none';
                });
        } else {
            console.log('Missing required elements or requestId');
            if (modalFilesSection) {
                modalFilesSection.style.display = 'none';
            }
        }
    }
}

// Initialize dashboard-specific handlers
document.addEventListener('DOMContentLoaded', function () {
    var editFileUploadArea = document.getElementById('editFileUploadArea');
    var editFileInput = document.getElementById('edit_reference_files');
    var editFileList = document.getElementById('editFileList');

    if (editFileUploadArea && editFileInput) {
        // Helper function to merge files for edit modal
        function mergeEditFiles(existingFiles, newFiles) {
            var dt = new DataTransfer();

            // Add existing files first
            for (var i = 0; i < existingFiles.length; i++) {
                dt.items.add(existingFiles[i]);
            }

            // Add new files - but only those that aren't already in existingFiles
            for (var i = 0; i < newFiles.length; i++) {
                var newFile = newFiles[i];
                var isDuplicate = false;

                // Check if this file already exists in existingFiles
                for (var j = 0; j < existingFiles.length; j++) {
                    // Compare by name and size to detect duplicates
                    if (existingFiles[j].name === newFile.name && existingFiles[j].size === newFile.size) {
                        isDuplicate = true;
                        break;
                    }
                }

                if (!isDuplicate) {
                    dt.items.add(newFile);
                }
            }

            return dt.files;
        }

        // Drag and drop events
        editFileUploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            editFileUploadArea.classList.add('dragover');
        });

        editFileUploadArea.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            editFileUploadArea.classList.remove('dragover');
        });

        editFileUploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            editFileUploadArea.classList.remove('dragover');

            var droppedFiles = e.dataTransfer.files;
            var mergedFiles = mergeEditFiles(editFileInput.files, droppedFiles);
            editFileInput.files = mergedFiles;
            displayEditFiles(editFileInput.files);
        });

        // File input change - accumulate files (only new files, not duplicates)
        editFileInput.addEventListener('change', function () {
            var mergedFiles = mergeEditFiles(editFileInput.files, this.files);
            editFileInput.files = mergedFiles;
            displayEditFiles(editFileInput.files);
            // Note: Don't reset input value here as it clears the files
            // The input value will be reset when the form is submitted or modal is closed
        });

        // Display files function for edit modal
        function displayEditFiles(files) {
            if (!editFileList) return;

            editFileList.innerHTML = '';

            // Toggle upload text visibility
            var uploadText = editFileUploadArea.querySelector('p');
            if (uploadText) {
                uploadText.style.display = files.length > 0 ? 'none' : 'block';
            }

            if (files.length === 0) {
                return;
            }

            var ul = document.createElement('ul');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var li = document.createElement('li');
                li.className = 'file-item';

                var fileInfo = document.createElement('div');
                fileInfo.className = 'file-item-info';

                var fileIcon = document.createElement('span');
                fileIcon.className = 'file-item-icon';
                fileIcon.textContent = '📄';

                var fileName = document.createElement('span');
                fileName.className = 'file-item-name';
                fileName.textContent = file.name;

                var fileSize = document.createElement('span');
                fileSize.className = 'file-item-size';
                fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';

                fileInfo.appendChild(fileIcon);
                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileSize);

                // Add remove button
                var removeBtn = document.createElement('button');
                removeBtn.className = 'file-item-remove';
                removeBtn.textContent = '✕';
                removeBtn.type = 'button';
                removeBtn.setAttribute('aria-label', 'Remove file');
                removeBtn.addEventListener('click', (function (index) {
                    return function (e) {
                        e.preventDefault();
                        removeEditFile(index);
                    };
                })(i));

                li.appendChild(fileInfo);
                li.appendChild(removeBtn);
                ul.appendChild(li);
            }
            editFileList.appendChild(ul);
        }

        // Remove file function for edit modal
        function removeEditFile(index) {
            var dt = new DataTransfer();
            var files = editFileInput.files;

            for (var i = 0; i < files.length; i++) {
                if (i !== index) {
                    dt.items.add(files[i]);
                }
            }

            editFileInput.files = dt.files;
            displayEditFiles(editFileInput.files);
        }
    }

    // Designer Dashboard - View Details buttons for available requests
    var viewDetailsButtons = document.querySelectorAll('.btn-details');
    viewDetailsButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            openAvailableRequestModal(this);
        });
    });
});

/* Edit Profile - Image Cropping Functionality */
var cropper = null;

document.addEventListener('DOMContentLoaded', function () {
    // Profile picture change button
    var changePictureBtn = document.getElementById('changePictureBtn');
    var profilePictureInput = document.getElementById('profile_picture');
    var cropperModal = document.getElementById('cropperModal');
    var cropperImage = document.getElementById('cropperImage');
    var closeCropperBtn = document.getElementById('closeCropperBtn');
    var cancelCropBtn = document.getElementById('cancelCropBtn');
    var applyCropBtn = document.getElementById('applyCropBtn');
    var croppedImageDataInput = document.getElementById('cropped_image_data');
    var currentProfilePicture = document.getElementById('currentProfilePicture');
    var picturePreview = document.getElementById('picturePreview');
    var removePictureBtn = document.getElementById('removePictureBtn');

    if (changePictureBtn && profilePictureInput) {
        // Click on change picture button
        changePictureBtn.addEventListener('click', function () {
            profilePictureInput.click();
        });

        // File input change
        profilePictureInput.addEventListener('change', function (e) {
            if (this.files && this.files[0]) {
                var file = this.files[0];

                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file (JPEG, PNG, etc.)');
                    return;
                }

                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    return;
                }

                // Show cropper modal first, then load image
                var reader = new FileReader();
                reader.onload = function (event) {
                    if (cropperImage && cropperModal) {
                        // Show modal immediately
                        cropperModal.classList.add('show');
                        document.documentElement.classList.add('cropper-modal-open');
                        document.body.classList.add('cropper-modal-open');

                        // Destroy existing cropper
                        if (cropper) {
                            cropper.destroy();
                            cropper = null;
                        }

                        // Clear src first to ensure fresh load
                        cropperImage.src = '';

                        // Set new src and init cropper after image loads
                        cropperImage.onload = function () {
                            // Small delay to ensure modal is rendered
                            setTimeout(function () {
                                initCropper();
                            }, 50);
                        };

                        cropperImage.src = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Initialize cropper function
    function initCropper() {
        if (!cropperImage) return;

        cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            minContainerWidth: 200,
            minContainerHeight: 200,
            ready: function () {
                // Cropper is ready
                console.log('Cropper ready');
            }
        });
    }

    // Close cropper modal
    if (closeCropperBtn) {
        closeCropperBtn.addEventListener('click', function () {
            closeCropperModal();
        });
    }

    // Cancel crop
    if (cancelCropBtn) {
        cancelCropBtn.addEventListener('click', function () {
            closeCropperModal();
        });
    }

    // Zoom In
    var zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function () {
            if (cropper) {
                cropper.zoom(0.1);
            }
        });
    }

    // Zoom Out
    var zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function () {
            if (cropper) {
                cropper.zoom(-0.1);
            }
        });
    }

    // Rotate Left
    var rotateLeftBtn = document.getElementById('rotateLeftBtn');
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', function () {
            if (cropper) {
                cropper.rotate(-45);
            }
        });
    }

    // Rotate Right
    var rotateRightBtn = document.getElementById('rotateRightBtn');
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', function () {
            if (cropper) {
                cropper.rotate(45);
            }
        });
    }

    // Flip Horizontal
    var flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
    if (flipHorizontalBtn) {
        flipHorizontalBtn.addEventListener('click', function () {
            if (cropper) {
                var scaleX = cropper.getData().scaleX || 1;
                cropper.scaleX(-scaleX);
            }
        });
    }

    // Flip Vertical
    var flipVerticalBtn = document.getElementById('flipVerticalBtn');
    if (flipVerticalBtn) {
        flipVerticalBtn.addEventListener('click', function () {
            if (cropper) {
                var scaleY = cropper.getData().scaleY || 1;
                cropper.scaleY(-scaleY);
            }
        });
    }

    // Reset Crop
    var resetCropBtn = document.getElementById('resetCropBtn');
    if (resetCropBtn) {
        resetCropBtn.addEventListener('click', function () {
            if (cropper) {
                cropper.reset();
            }
        });
    }

    // Apply crop
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', function () {
            if (cropper) {
                // Get cropped canvas
                var canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high'
                });

                if (canvas) {
                    // Convert to base64
                    var croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

                    // Update hidden input
                    if (croppedImageDataInput) {
                        croppedImageDataInput.value = croppedDataUrl;
                    }

                    // Update preview
                    if (picturePreview) {
                        picturePreview.src = croppedDataUrl;
                        picturePreview.style.display = 'block';
                    }

                    // Hide current profile picture if shown
                    if (currentProfilePicture) {
                        currentProfilePicture.style.display = 'none';
                    }
                }

                closeCropperModal();
            }
        });
    }

    // Close modal when clicking outside
    if (cropperModal) {
        cropperModal.addEventListener('click', function (e) {
            if (e.target === cropperModal) {
                closeCropperModal();
            }
        });
    }

    // Remove picture button
    if (removePictureBtn) {
        removePictureBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to remove your profile picture?')) {
                // Set a flag to remove the picture
                if (croppedImageDataInput) {
                    croppedImageDataInput.value = 'remove';
                }

                // Hide preview
                if (picturePreview) {
                    picturePreview.style.display = 'none';
                }

                // Show default avatar
                if (currentProfilePicture) {
                    currentProfilePicture.src = '/static/img/default-avatar.png';
                    currentProfilePicture.style.display = 'block';
                }
            }
        });
    }

    function closeCropperModal() {
        if (cropperModal) {
            cropperModal.classList.remove('show');
        }

        document.documentElement.classList.remove('cropper-modal-open');
        document.body.classList.remove('cropper-modal-open');

        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        // Reset file input
        if (profilePictureInput) {
            profilePictureInput.value = '';
        }
    }

    // Form submission loading state
    var editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function (e) {
            var submitBtn = document.getElementById('submitProfileBtn');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
        });
    }
});

// Completion Modal Functions
function openCompletionModal(requestId) {
    console.log('Opening completion modal for request ID:', requestId);
    openModal('completionModal');

    // Fetch completion details from API
    fetch('/api/completion-details/' + requestId + '/')
        .then(response => {
            console.log('API response status:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            
            // Set project title
            var titleEl = document.getElementById('completionTitle');
            if (titleEl) {
                titleEl.textContent = data.title || 'Unknown Project';
            }
            
            // Set completion date
            var dateEl = document.getElementById('completionDate');
            if (dateEl) {
                dateEl.textContent = data.completed_at || 'Not available';
            }

            // Populate designer information
            var designerSection = document.getElementById('designerSection');
            var designerAvatar = document.getElementById('designerAvatar');
            var designerName = document.getElementById('designerName');
            
            console.log('Designer data:', data.designer);
            console.log('Elements:', { designerSection, designerAvatar, designerName });
            
            if (data.designer && designerSection && designerAvatar && designerName) {
                designerSection.style.display = 'block';
                designerName.textContent = data.designer.name;
                
                // Set avatar - either profile picture or initials
                if (data.designer.profile_picture) {
                    designerAvatar.innerHTML = '<img src="' + data.designer.profile_picture + '" alt="' + data.designer.name + '">';
                } else {
                    designerAvatar.innerHTML = '<span class="avatar-initials">' + (data.designer.initials || '?') + '</span>';
                }
            } else if (designerSection) {
                designerSection.style.display = 'none';
            }

            // Populate files list
            var filesList = document.getElementById('finishedFilesList');
            if (filesList) {
                filesList.innerHTML = '';

                if (data.files && data.files.length > 0) {
                    data.files.forEach(function (file) {
                        var li = document.createElement('li');
                        li.innerHTML = '<a href="' + file.url + '" download class="file-download-link"><span class="file-icon">📄</span> ' + file.filename + '</a>';
                        filesList.appendChild(li);
                    });
                } else {
                    filesList.innerHTML = '<li class="no-files">No files available</li>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching completion details:', error);
            var filesList = document.getElementById('finishedFilesList');
            if (filesList) {
                filesList.innerHTML = '<li class="error-message">Error loading files. Please try again.</li>';
            }
        });
    return false;
}

function closeCompletionModal() {
    closeModal('completionModal');
}

/* Designer Dashboard - Dynamic Section Switching */
function showDashboardSection(sectionId) {
    console.log('=== showDashboardSection called ===');
    console.log('Target section ID:', sectionId);
    
    // Hide all sections - use both class and direct style
    var allSections = document.querySelectorAll('.dashboard-section-content');
    console.log('Found sections:', allSections.length);
    allSections.forEach(function(section, index) {
        console.log('Hiding section', index, ':', section.id);
        section.classList.remove('active');
        // Direct style manipulation as fallback
        section.style.display = 'none';
    });
    
    // Show the selected section - use both class and direct style
    var targetSection = document.getElementById(sectionId + '-section');
    console.log('Target element found:', targetSection);
    if (targetSection) {
        targetSection.classList.add('active');
        // Direct style manipulation as fallback
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
        console.log('Activated section:', sectionId + '-section');
        console.log('Final computed display:', getComputedStyle(targetSection).display);
        console.log('Final computed visibility:', getComputedStyle(targetSection).visibility);
        console.log('Parent element:', targetSection.parentElement);
        console.log('Parent display:', targetSection.parentElement ? getComputedStyle(targetSection.parentElement).display : 'no parent');
    } else {
        console.error('Section not found:', sectionId + '-section');
    }
    
    // Update sidebar active state
    var sidebarItems = document.querySelectorAll('.side-item[data-section]');
    sidebarItems.forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Save current section to localStorage based on which dashboard we're on
    var isDesignerDashboard = document.getElementById('available-requests-section') !== null;
    var isUserDashboard = document.getElementById('requests-section') !== null && !isDesignerDashboard;
    var isAdminDashboard = document.getElementById('users-section') !== null && document.getElementById('requests-section') !== null;
    
    if (isDesignerDashboard) {
        localStorage.setItem('designerDashboardSection', sectionId);
    } else if (isUserDashboard) {
        localStorage.setItem('userDashboardSection', sectionId);
    } else if (isAdminDashboard) {
        localStorage.setItem('adminDashboardSection', sectionId);
    }
}

// Initialize dashboard section on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a dashboard with section content
    var dashboardSections = document.querySelectorAll('.dashboard-section-content');
    if (dashboardSections.length > 0) {
        // Determine which dashboard we're on
        var isDesignerDashboard = document.getElementById('available-requests-section') !== null;
        var isUserDashboard = document.getElementById('requests-section') !== null && !isDesignerDashboard;
        var isAdminDashboard = document.getElementById('users-section') !== null && document.getElementById('requests-section') !== null;
        
        // Check if there's a hash in the URL (from sidebar navigation)
        var hash = window.location.hash.replace('#', '');
        var initialSection = 'dashboard'; // Default section
        
        // If there's a hash, check if the section exists before using it
        if (hash) {
            var targetSection = document.getElementById(hash + '-section');
            if (targetSection) {
                initialSection = hash;
            }
        }
        
        // Show the initial section
        showDashboardSection(initialSection);
        
        // Add click handlers for sidebar navigation
        var sidebarItems = document.querySelectorAll('.side-item[data-section]');
        sidebarItems.forEach(function(item) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function(e) {
                e.preventDefault();
                var sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    showDashboardSection(sectionId);
                }
            });
        });
    }
});

function getCSRFToken() {
    var csrfInput = document.getElementById('csrfToken');
    if (csrfInput) {
        return csrfInput.value;
    }
    // Fallback: try to get from cookie
    var name = 'csrftoken';
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue || '';
}

function openAddUserModal() {
    // Clear the form
    var addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.reset();
    }
    var addUserId = document.getElementById('addUserId');
    if (addUserId) {
        addUserId.value = '';
    }
    openModal('addUserModal');
}

function saveNewUser() {
    var firstName = document.getElementById('addFirstName').value.trim();
    var lastName = document.getElementById('addLastName').value.trim();
    
    // Client-side validation
    if (!firstName || !lastName) {
        showMessageModal('Error', 'First name and last name are required.', 'error');
        return;
    }

    var formData = new FormData();
    formData.append('username', document.getElementById('addUsername').value);
    formData.append('email', document.getElementById('addEmail').value);
    formData.append('password', document.getElementById('addPassword').value);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('user_role', document.getElementById('addUserRole').value);
    formData.append('gender', document.getElementById('addGender').value);
    formData.append('phone_number', document.getElementById('addPhone').value);
    formData.append('company', document.getElementById('addCompany').value);
    formData.append('location', document.getElementById('addLocation').value);

    fetch('/manage/user/create/', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCSRFToken()
        },
        body: formData
    })
        .then(function (response) {
            return response.json().then(function(data) {
                return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                closeModal('addUserModal');
                showMessageModal('Success', 'User created successfully!', 'success');
                setTimeout(function() {
                    location.reload();
                }, 1500);
            } else {
                showMessageModal('Error', result.data.error || 'Unknown error occurred.', 'error');
            }
        })
        .catch(function (error) {
            console.error('Error creating user:', error);
            showMessageModal('Error', 'Error creating user. Please try again.', 'error');
        });
}

function viewUser(userId) {
    fetch('/manage/user/' + userId + '/view/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(function (response) {
            if (!response.ok) {
                if (response.status === 403) {
                    alert('Access denied. You must be an admin to view user details.');
                    return;
                }
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            // Populate view modal with user data
            document.getElementById('viewUserName').textContent = (data.first_name + ' ' + data.last_name).trim() || data.username || 'Unknown';
            document.getElementById('viewUserUsername').textContent = '@' + (data.username || 'N/A');
            document.getElementById('viewUserEmail').textContent = data.email || 'Not provided';
            document.getElementById('viewUserRole').textContent = data.user_role_display || data.user_role || 'User';
            document.getElementById('viewUserRole').className = 'role-badge role-' + (data.user_role || 'user');
            document.getElementById('viewUserCompany').textContent = data.company || 'Not provided';
            document.getElementById('viewUserLocation').textContent = data.location || 'Not provided';
            document.getElementById('viewUserJoined').textContent = data.joined_date || 'Not available';
            document.getElementById('viewUserRequests').textContent = data.design_requests_count || 0;

            // Profile picture
            var profilePic = document.getElementById('viewUserProfilePic');
            var placeholder = document.getElementById('viewUserAvatarPlaceholder');
            if (data.profile_picture) {
                profilePic.src = data.profile_picture;
                profilePic.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
            } else {
                profilePic.style.display = 'none';
                if (placeholder) {
                    placeholder.textContent = (data.first_name ? data.first_name[0] : (data.username ? data.username[0] : '?')).toUpperCase();
                    placeholder.style.display = 'flex';
                }
            }

            // Show modal
            openModal('viewUserModal');
        })
        .catch(function (error) {
            console.error('Error fetching user:', error);
            alert('Error loading user details. Please try again. Error: ' + error.message);
        });
}

function editUser(userId) {
    fetch('/manage/user/' + userId + '/edit/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(function (response) {
            if (!response.ok) {
                if (response.status === 403) {
                    alert('Access denied. You must be an admin to edit users.');
                    return;
                }
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            // Populate edit form
            document.getElementById('editUserId').value = data.id;
            document.getElementById('editFirstName').value = data.first_name || '';
            document.getElementById('editLastName').value = data.last_name || '';
            document.getElementById('editEmail').value = data.email || '';
            document.getElementById('editUsername').value = data.username || '';
            document.getElementById('editUserRole').value = data.user_role || 'user';
            document.getElementById('editGender').value = data.gender || '';
            document.getElementById('editPhone').value = data.phone_number || '';
            document.getElementById('editDOB').value = data.date_of_birth || '';
            document.getElementById('editCompany').value = data.company || '';
            document.getElementById('editLocation').value = data.location || '';
            document.getElementById('editBio').value = data.bio || '';

            // Show modal
            openModal('editUserModal');
        })
        .catch(function (error) {
            console.error('Error fetching user:', error);
            alert('Error loading user data. Please try again. Error: ' + error.message);
        });
}

function saveUser() {
    var userId = document.getElementById('editUserId').value;
    var formData = new FormData();

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

    fetch('/manage/user/' + userId + '/edit/', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCSRFToken()
        },
        body: formData
    })
        .then(function (response) {
            return response.json().then(function(data) {
                return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                closeModal('editUserModal');
                showMessageModal('Success', 'User updated successfully!', 'success');
                setTimeout(function() {
                    location.reload();
                }, 1500);
            } else {
                showMessageModal('Error', result.data.message || result.data.error || 'Unknown error occurred.', 'error');
            }
        })
        .catch(function (error) {
            console.error('Error saving user:', error);
            showMessageModal('Error', 'Error saving user. Please try again.', 'error');
        });
}

function deleteUser(userId) {
    fetch('/manage/user/' + userId + '/view/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(function (response) {
            if (!response.ok) {
                if (response.status === 403) {
                    alert('Access denied. You must be an admin to delete users.');
                    return;
                }
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            // Set user info in delete modal
            document.getElementById('deleteUserId').value = userId;
            document.getElementById('deleteUserName').textContent = (data.first_name + ' ' + data.last_name).trim() || data.username || 'Unknown';

            // Show confirmation modal
            openModal('deleteUserModal');
        })
        .catch(function (error) {
            console.error('Error fetching user:', error);
            alert('Error loading user data. Please try again. Error: ' + error.message);
        });
}

function confirmDeleteUser() {
    var userId = document.getElementById('deleteUserId').value;

    fetch('/manage/user/' + userId + '/delete/', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCSRFToken()
        }
    })
        .then(function (response) {
            return response.json().then(function(data) {
                return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                closeModal('deleteUserModal');
                showMessageModal('Success', 'User deleted successfully!', 'success');
                setTimeout(function() {
                    location.reload();
                }, 1500);
            } else {
                showMessageModal('Error', result.data.message || result.data.error || 'Unknown error occurred.', 'error');
            }
        })
        .catch(function (error) {
            console.error('Error deleting user:', error);
            showMessageModal('Error', 'Error deleting user. Please try again.', 'error');
        });
}

function showMessageModal(title, message, type, callback) {
    var modalId = 'messageModal';
    var modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'add-new-design-modal';
        modal.innerHTML = '<div class="modal-content message-modal-content"><button class="close-btn" onclick="closeMessageModal()" aria-label="Close modal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><div class="message-modal-icon" id="messageModalIcon"></div><h2 id="messageModalTitle"></h2><p id="messageModalText" class="message-modal-text"></p><div class="modal-actions"><button type="button" class="btn btn-primary" onclick="closeMessageModal(true)">OK</button></div></div>';
        document.body.appendChild(modal);
    }
    
    // Set content
    document.getElementById('messageModalTitle').textContent = title;
    document.getElementById('messageModalText').textContent = message;
    
    // Set icon based on type
    var iconContainer = document.getElementById('messageModalIcon');
    if (type === 'success') {
        iconContainer.innerHTML = '✓';
        iconContainer.className = 'message-modal-icon success';
    } else if (type === 'error') {
        iconContainer.innerHTML = '✕';
        iconContainer.className = 'message-modal-icon error';
    } else {
        iconContainer.innerHTML = 'ℹ';
        iconContainer.className = 'message-modal-icon info';
    }
    
    // Store callback
    modal.callback = callback;
    
    // Show modal
    modal.classList.add('show');
}

function closeMessageModal(triggerCallback) {
    var modal = document.getElementById('messageModal');
    if (modal) {
        modal.classList.remove('show');
        if (triggerCallback && modal.callback) {
            modal.callback();
        }
    }
}

function toggleSelectAllUsers() {
    var selectAllCheckbox = document.getElementById('selectAllUsers');
    var userCheckboxes = document.querySelectorAll('.user-checkbox');
    userCheckboxes.forEach(function(checkbox) {
        checkbox.checked = selectAllCheckbox.checked;
    });
    updateBulkActions();
}

function updateBulkActions() {
    var checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    var bulkActionsBar = document.querySelector('.bulk-actions-bar');
    var selectedCount = document.getElementById('selectedCount');
    
    if (checkedBoxes.length > 0) {
        bulkActionsBar.classList.add('show');
        selectedCount.textContent = checkedBoxes.length + ' user' + (checkedBoxes.length > 1 ? 's' : '') + ' selected';
    } else {
        bulkActionsBar.classList.remove('show');
    }
    
    // Update select all checkbox state
    var allCheckboxes = document.querySelectorAll('.user-checkbox');
    var selectAllCheckbox = document.getElementById('selectAllUsers');
    if (checkedBoxes.length === allCheckboxes.length && allCheckboxes.length > 0) {
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.checked = false;
    }
}

function bulkDeleteUsers() {
    var checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    var userIds = Array.from(checkedBoxes).map(function(cb) { return cb.value; });
    
    if (userIds.length === 0) {
        showMessageModal('Error', 'No users selected.', 'error');
        return;
    }
    
    // Show confirmation modal
    document.getElementById('bulkDeleteUserIds').value = userIds.join(',');
    document.getElementById('bulkDeleteCount').textContent = userIds.length;
    openModal('bulkDeleteUserModal');
}

function confirmBulkDeleteUsers() {
    var userIds = document.getElementById('bulkDeleteUserIds').value.split(',');
    var csrfToken = getCSRFToken();
    var deletePromises = userIds.map(function(userId) {
        return fetch('/manage/user/' + userId + '/delete/', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            }
        });
    });
    
    Promise.all(deletePromises)
        .then(function() {
            closeModal('bulkDeleteUserModal');
            showMessageModal('Success', userIds.length + ' users deleted successfully!', 'success');
            setTimeout(function() {
                location.reload();
            }, 1500);
        })
        .catch(function(error) {
            console.error('Error deleting users:', error);
            showMessageModal('Error', 'Error deleting some users. Please try again.', 'error');
        });
}

function toggleFilterDropdown() {
    var dropdown = document.getElementById('filterDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function applyFilters() {
    // Get selected roles
    var roleCheckboxes = document.querySelectorAll('#filterDropdown .filter-section:first-child input:checked');
    var selectedRoles = Array.from(roleCheckboxes).map(function(cb) { return cb.value; });
    
    // Get selected statuses
    var statusCheckboxes = document.querySelectorAll('#filterDropdown .filter-section:nth-child(2) input:checked');
    var selectedStatuses = Array.from(statusCheckboxes).map(function(cb) { return cb.value; });
    
    console.log('Selected roles:', selectedRoles);
    console.log('Selected statuses:', selectedStatuses);
    
    // Filter table rows
    var tableBody = document.querySelector('.users-table tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    var rows = tableBody.querySelectorAll('tr');
    console.log('Total rows found:', rows.length);
    
    var visibleRowCount = 0;
    var emptyStateRow = document.getElementById('emptyStateRow');
    
    rows.forEach(function(row, index) {
        // Skip empty state row
        if (row.id === 'emptyStateRow') {
            row.style.display = 'none';
            return;
        }
        
        var roleBadge = row.querySelector('.role-badge');
        var roleClass = roleBadge ? roleBadge.className : '';
        var roleMatch = roleClass.match(/role-(user|designer|admin)\b/);
        var roleValue = roleMatch ? roleMatch[1] : '';
        
        console.log('Row', index, 'role class:', roleClass, 'extracted role:', roleValue);
        
        // Show row if no filters selected OR if role matches
        var showByRole = selectedRoles.length === 0 || selectedRoles.indexOf(roleValue) !== -1;
        var showByStatus = true;
        
        if (showByRole && showByStatus) {
            row.style.display = '';
            visibleRowCount++;
            console.log('Row', index, 'VISIBLE');
        } else {
            row.style.display = 'none';
            console.log('Row', index, 'HIDDEN');
        }
    });
    
    console.log('Visible rows:', visibleRowCount);
    
    // Show empty state if needed
    if (emptyStateRow) {
        if (visibleRowCount === 0 && selectedRoles.length > 0) {
            emptyStateRow.style.display = '';
            var emptyStateSpan = emptyStateRow.querySelector('td.empty-state span');
            if (emptyStateSpan) {
                emptyStateSpan.textContent = 'No users match the selected filters';
            }
        } else if (visibleRowCount === 0 && selectedRoles.length === 0) {
            emptyStateRow.style.display = '';
            var emptyStateSpan = emptyStateRow.querySelector('td.empty-state span');
            if (emptyStateSpan) {
                emptyStateSpan.textContent = 'No users found';
            }
        }
    }
}

function clearFilters() {
    var checkboxes = document.querySelectorAll('#filterDropdown input[type="checkbox"]');
    checkboxes.forEach(function(cb) { cb.checked = false; });
    applyFilters();
}

document.addEventListener('DOMContentLoaded', function() {
    // Close filter dropdown when clicking outside
    document.addEventListener('click', function(event) {
        var container = document.querySelector('.filter-dropdown-container');
        var dropdown = document.getElementById('filterDropdown');
        if (container && !container.contains(event.target)) {
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    });

    // Handle user action buttons (view/edit/delete)
    document.querySelectorAll('.action-buttons button').forEach(function (button) {
        button.addEventListener('click', function () {
            var userId = this.getAttribute('data-user-id');
            var action = this.getAttribute('data-action');

            if (action === 'view') {
                viewUser(userId);
            } else if (action === 'edit') {
                editUser(userId);
            } else if (action === 'delete') {
                deleteUser(userId);
            }
        });
    });
});

var currentCancelDesignId = null;

function openCancelConfirmModal() {
    var modal = document.getElementById('cancelConfirmModal');
    if (modal) {
        modal.classList.add('active');
    }
    // Get the current design ID from the modal
    var designIdInput = document.getElementById('modalDesignId');
    if (designIdInput) {
        currentCancelDesignId = designIdInput.value;
        // Update the form action URL
        var cancelForm = document.getElementById('cancelProjectForm');
        if (cancelForm && currentCancelDesignId) {
            cancelForm.action = '/design-request/' + currentCancelDesignId + '/cancel/';
        }
    }
}

function closeCancelConfirmModal() {
    var modal = document.getElementById('cancelConfirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentCancelDesignId = null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for view and edit buttons in project modal
    document.querySelectorAll('.btn-view, .btn-edit').forEach(function(button) {
        button.addEventListener('click', function() {
            var designId = this.getAttribute('data-design-id');
            if (designId && typeof openProjectModal === 'function') {
                openProjectModal(parseInt(designId));
            }
        });
    });
});

function closeCropperModal() {
    const modal = document.getElementById('cropperModal');
    if (modal) {
        modal.classList.remove('show');
    }
    document.body.classList.remove('cropper-modal-open');
    document.documentElement.classList.remove('cropper-modal-open');
    
    // Destroy cropper if it exists (global variable from script.js)
    if (typeof cropper !== 'undefined' && cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Reset file input
    const profilePictureInput = document.getElementById('profile_picture');
    if (profilePictureInput) {
        profilePictureInput.value = '';
    }
}

// Settings page initialization - runs on unified_settings.html page load
document.addEventListener('DOMContentLoaded', function() {
    // Only run this on the settings page
    if (!document.querySelector('.settings-unified-nav-item')) {
        return;
    }
    
    // ========== Section Navigation ==========
    const navItems = document.querySelectorAll('.settings-unified-nav-item');
    const sections = document.querySelectorAll('.settings-unified-section');
    
    if (navItems.length === 0 || sections.length === 0) {
        return;
    }
    
    // Get initial section from URL hash or default to account
    const hash = window.location.hash.replace('#', '');
    let activeSection = hash || 'account';
    
    // Validate activeSection exists
    const validSections = Array.from(navItems).map(item => item.dataset.section);
    if (!validSections.includes(activeSection)) {
        activeSection = 'account';
    }
    
    // Set initial active state
    navItems.forEach(item => {
        if (item.dataset.section === activeSection) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    sections.forEach(section => {
        if (section.id === 'section-' + activeSection) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Handle navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.dataset.section;
            
            // Update nav active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById('section-' + section).classList.add('active');
            
            // Update URL hash
            window.location.hash = section;
        });
    });
    
    // ========== Account Settings - Notification Toggle ==========
    const emailNotificationsCheckbox = document.getElementById('id_email_notifications_enabled');
    const notificationOptions = document.getElementById('notification-options');
    
    function toggleNotificationOptions() {
        if (emailNotificationsCheckbox && notificationOptions) {
            if (emailNotificationsCheckbox.checked) {
                notificationOptions.style.display = 'block';
            } else {
                notificationOptions.style.display = 'none';
            }
        }
    }
    
    if (emailNotificationsCheckbox) {
        emailNotificationsCheckbox.addEventListener('change', toggleNotificationOptions);
        toggleNotificationOptions();
    }
    
    // ========== Close Alert Messages ==========
    const closeButtons = document.querySelectorAll('.settings-unified-alert-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
    
    // ========== Change Password Modal ==========
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('modal_current_password').value;
            const newPassword = document.getElementById('modal_new_password').value;
            const confirmPassword = document.getElementById('modal_confirm_password').value;
            const messageEl = document.getElementById('password_change_message');
            const submitBtn = document.getElementById('changePasswordSubmit');
            
            // Clear previous errors
            document.getElementById('current_password_error').textContent = '';
            document.getElementById('new_password_error').textContent = '';
            document.getElementById('confirm_password_error').textContent = '';
            messageEl.textContent = '';
            messageEl.className = 'change-password-form-message';
            
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Submit via AJAX
            fetch('/settings/change-password/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                if (data.success) {
                    messageEl.textContent = data.message || 'Password changed successfully!';
                    messageEl.className = 'change-password-form-message change-password-form-success-text';
                    
                    // Close modal and reset form after success
                    setTimeout(() => {
                        closeModal('changePasswordModal');
                        changePasswordForm.reset();
                    }, 1500);
                } else {
                    if (data.errors) {
                        if (data.errors.current_password) {
                            document.getElementById('current_password_error').textContent = data.errors.current_password;
                        }
                        if (data.errors.new_password) {
                            document.getElementById('new_password_error').textContent = data.errors.new_password;
                        }
                        if (data.errors.confirm_password) {
                            document.getElementById('confirm_password_error').textContent = data.errors.confirm_password;
                        }
                    }
                    messageEl.textContent = data.error || 'An error occurred. Please try again.';
                    messageEl.className = 'change-password-form-message change-password-form-error-text';
                }
            })
            .catch(error => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                messageEl.textContent = 'An error occurred. Please try again.';
                messageEl.className = 'change-password-form-message change-password-form-error-text';
                console.error('Password change error:', error);
            });
        });
    }
});

// Close modals when clicking outside (window-level handler)
window.onclick = function(event) {
    if (event.target.classList.contains('change-password-modal')) {
        closeModal('changePasswordModal');
    }
    if (event.target.classList.contains('cropper-modal')) {
        closeCropperModal();
    }
};