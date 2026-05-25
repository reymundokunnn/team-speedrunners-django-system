const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

const darkModePreference = localStorage.getItem('darkMode');
if (darkModePreference === 'enabled') {
    body.classList.add('dark-mode');
} else {
    body.classList.remove('dark-mode');
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function () {
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

document.addEventListener('DOMContentLoaded', function () {
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
toggleForms = function (event) {
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
    const hasFilledFields = Array.from(registerForm.querySelectorAll('input[type="text"]')).some(input => input.value !== '');

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
    console.log('openModal called with:', modalType);
    const modal = document.getElementById(modalType);
    console.log('Found modal:', modal);
    if (modal) {
        console.log('Modal display before:', modal.style.display);
        modal.classList.add('show');
        modal.style.display = 'flex';
        console.log('Modal display after:', modal.style.display);
    } else {
        console.error('Modal not found:', modalType);
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

// update greeting based on time of day.
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

        const firstNameSpan = greetingElement.querySelector('.orange');
        const firstName = firstNameSpan ? firstNameSpan.textContent : '';

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
    fileUploadArea.addEventListener('click', function (e) {
        // Don't trigger if clicking on file list items or remove buttons
        if (e.target.closest('.file-list') || e.target.closest('.file-item-remove')) {
            return;
        }
        e.stopPropagation();
        fileInput.click();
    });

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

        // Toggle upload content visibility
        const uploadContent = fileUploadArea.querySelector('.file-upload-area-content');
        if (uploadContent) {
            uploadContent.style.display = fileArray.length > 0 ? 'none' : 'flex';
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
                link.dataset.completedAt,
                link.dataset.revisionNotes
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

            // Toggle upload content visibility
            var uploadContent = modalFileUploadArea.querySelector('.file-upload-area-content');
            if (uploadContent) {
                uploadContent.style.display = files.length > 0 ? 'none' : 'flex';
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

function openProjectModal(id, title, description, status, requester, deadline, budget, completedAt, revisionNotes) {
    currentDesignId = id;
    document.getElementById('modalDesignId').value = id;
    document.getElementById('modalProjectTitle').textContent = title;
    document.getElementById('modalDescription').textContent = description || 'No description provided.';
    document.getElementById('modalRequester').textContent = requester;
    document.getElementById('modalDeadline').textContent = deadline;
    document.getElementById('modalBudget').textContent = budget;
    
    // Handle revision notes
    var revisionNotesSection = document.getElementById('revisionNotesSection');
    var modalRevisionNotes = document.getElementById('modalRevisionNotes');
    if (revisionNotes && revisionNotes.trim() !== '') {
        if (revisionNotesSection) revisionNotesSection.style.display = 'block';
        if (modalRevisionNotes) modalRevisionNotes.innerHTML = '<p class="revision-notes-text">' + revisionNotes + '</p>';
    } else {
        if (revisionNotesSection) revisionNotesSection.style.display = 'none';
    }

    var statusBadge = document.getElementById('modalProjectStatus');
    var paymentWarningMessage = document.getElementById('paymentWarningMessage');

    if (status === 'payment_required') {
        statusBadge.className = 'status-badge status-completed';
        statusBadge.textContent = 'Completed (Payment Required)';
        status = 'completed';

        if (paymentWarningMessage) {
            paymentWarningMessage.style.display = 'block';
            paymentWarningMessage.textContent = 'Finished files are locked until the client completes payment.';
        }
    } else {
        statusBadge.className = 'status-badge status-' + status;
        statusBadge.textContent = status.replace('_', ' ');
        if (paymentWarningMessage) {
            paymentWarningMessage.style.display = 'none';
        }
    }

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

// Global click handler for debugging
document.addEventListener('click', function(e) {
    var target = e.target;
    var closestButton = target.closest('.btn-icon');
    if (closestButton) {
        console.log('Button clicked:', closestButton);
        console.log('Has onclick:', closestButton.onclick);
        console.log('dataset:', closestButton.dataset);
    }
}, true); // Use capture to catch all clicks

// User Dashboard - Edit and Delete button global handler
document.addEventListener('DOMContentLoaded', function() {
    // Use event delegation for action buttons
    document.addEventListener('click', function(e) {
        // First check for admin dashboard action buttons using closest
        var adminBtn = e.target.closest('button[data-user-id][data-action]');
        if (adminBtn) {
            console.log('Admin action button clicked, action:', adminBtn.getAttribute('data-action'));
            var userId = adminBtn.getAttribute('data-user-id');
            var action = adminBtn.getAttribute('data-action');

            if (action === 'view') {
                console.log('Calling viewUser with ID:', userId);
                viewUser(userId);
            } else if (action === 'edit') {
                console.log('Calling editUser with ID:', userId);
                editUser(userId);
            } else if (action === 'delete') {
                console.log('Calling deleteUser with ID:', userId);
                deleteUser(userId);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Check for design request edit button
        var editBtn = e.target.closest('button[data-request-id][data-action="edit"]');
        if (editBtn) {
            console.log('Edit request button clicked');
            openEditModal(editBtn);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Check for design request delete button
        var deleteBtn = e.target.closest('button[data-request-id][data-action="delete"]');
        if (deleteBtn) {
            console.log('Delete request button clicked');
            openDeleteModal(deleteBtn);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
});

// User Dashboard - Edit Modal Functions */
function openEditModal(button) {
    console.log('openEditModal called', button);
    var requestId = button.dataset.requestId;
    console.log('requestId:', requestId);
    var title = button.dataset.title;
    var designType = button.dataset.designType;
    var description = button.dataset.description;
    var budget = button.dataset.budget;
    var currency = button.dataset.currency || 'USD';
    var deadline = button.dataset.deadline;

    // Set form action URL
    var editForm = document.getElementById('editForm');
    console.log('editForm:', editForm);
    if (editForm) {
        editForm.action = '/design-request/' + requestId + '/edit/';

        // Populate form fields
        var editTitle = document.getElementById('edit_title');
        var editDesignType = document.getElementById('edit_design_type');
        var editDescription = document.getElementById('edit_description');
        var editBudget = document.getElementById('edit_budget');
        var editCurrency = document.getElementById('edit_currency');
        var editDeadline = document.getElementById('edit_deadline');
        
        console.log('Form fields:', { editTitle, editDesignType, editDescription, editBudget, editCurrency, editDeadline });
        
        if (editTitle) editTitle.value = title;
        if (editDesignType) editDesignType.value = designType;
        if (editDescription) editDescription.value = description;
        if (editBudget) editBudget.value = budget;
        if (editCurrency) editCurrency.value = currency;
        if (editDeadline) editDeadline.value = deadline;

        // Show modal using openModal
        console.log('Calling openModal for editModal');
        openModal('editModal');
    } else {
        console.error('editForm not found in the DOM');
    }
}

function closeEditModal() {
    closeModal('editModal');
}

/* User Dashboard - Delete Design Request Modal */
function openDeleteModal(button) {
    console.log('openDeleteModal called', button);
    var requestId = button.dataset.requestId;
    console.log('requestId:', requestId);
    var title = button.dataset.title;
    
    // Get the modal
    var modal = document.getElementById('deleteModal');
    console.log('Delete modal:', modal);
    var form = document.getElementById('deleteForm');
    var titleEl = document.getElementById('deleteRequestTitle');
    
    if (modal && form && titleEl) {
        // Set the form action
        form.action = '/design-request/' + requestId + '/delete/';
        
        // Set the title
        titleEl.textContent = title;
        
        // Show the modal using openModal for consistency
        openModal('deleteModal');
    } else {
        console.error('Delete modal elements not found:', { modal: modal, form: form, titleEl: titleEl });
    }
}

function closeDeleteModal() {
    var modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function confirmDelete(btn) {
    var form = document.getElementById('deleteForm');
    if (form) {
        // Extract request ID from form action
        var action = form.action;
        var match = action.match(/\/design-request\/(\d+)\/delete\//);
        var requestId = match ? match[1] : null;
        
        if (!requestId) {
            alert('Error: Could not get request ID');
            return false;
        }
        
        // Get CSRF token
        var csrftoken = getCookie('csrftoken');
        
        fetch(action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        .then(function(response) {
            if (response.ok) {
                // Close modal
                closeDeleteModal();
                // Find and remove the row in the table
                var tableRow = document.querySelector('tr[data-request-id="' + requestId + '"]');
                if (tableRow) {
                    tableRow.remove();
                }
                
                // Check if there are any remaining rows
                var tbody = document.querySelector('.design-requests-table tbody');
                if (tbody) {
                    var remainingRows = tbody.querySelectorAll('tr');
                    if (remainingRows.length === 0) {
                        // Hide the table and show empty state
                        var table = document.querySelector('.design-requests-table');
                        var emptyState = document.getElementById('emptyState');
                        if (table) table.style.display = 'none';
                        if (emptyState) emptyState.style.display = 'flex';
                    }
                }
            } else {
                alert('Error deleting design request. Please try again.');
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('Error deleting design request. Please try again.');
        });
    }
    return false;
}

/* User Dashboard - Revision Request Modal */
function openRevisionModal(button) {
    console.log('openRevisionModal called', button);
    var requestId = button.dataset.requestId;
    console.log('requestId:', requestId);
    var title = button.dataset.title;
    
    // Get the modal
    var modal = document.getElementById('revisionModal');
    console.log('Revision modal:', modal);
    var form = document.getElementById('revisionForm');
    var titleEl = document.getElementById('revisionRequestTitle');
    var notesField = document.getElementById('revision_notes');
    
    if (modal && form && titleEl) {
        // Set the form action
        form.action = '/design-request/' + requestId + '/request-revision/';
        
        // Set the title
        titleEl.textContent = title;
        
        // Clear the notes field
        if (notesField) notesField.value = '';
        
        // Show the modal using openModal for consistency
        openModal('revisionModal');
    } else {
        console.error('Revision modal elements not found:', { modal: modal, form: form, titleEl: titleEl });
    }
}

function closeRevisionModal() {
    var modal = document.getElementById('revisionModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function confirmRevision(btn) {
    var form = document.getElementById('revisionForm');
    if (form) {
        // Extract request ID from form action
        var action = form.action;
        var match = action.match(/\/design-request\/(\d+)\/request-revision\//);
        var requestId = match ? match[1] : null;
        
        if (!requestId) {
            alert('Error: Could not get request ID');
            return false;
        }
        
        // Get revision notes
        var revisionNotes = document.getElementById('revision_notes').value.trim();
        
        if (!revisionNotes) {
            alert('Please enter revision notes.');
            return false;
        }
        
        // Get CSRF token
        var csrftoken = getCookie('csrftoken');
        
        fetch(action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'revision_notes=' + encodeURIComponent(revisionNotes)
        })
        .then(function(response) {
            if (response.ok) {
                // Close modal
                closeRevisionModal();
                // Reload the page to show updated status
                window.location.reload();
            } else {
                response.json().then(function(data) {
                    alert(data.error || 'Error requesting revision. Please try again.');
                }).catch(function() {
                    alert('Error requesting revision. Please try again.');
                });
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('Error requesting revision. Please try again.');
        });
    }
    return false;
}

// Helper function to get CSRF token
function getCookie(name) {
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
    return cookieValue;
}

/* Toggle Favorite Designer from User Dashboard Request Table */
function toggleFavoriteFromRequest(button) {
    var designerId = button.dataset.designerId;
    var csrftoken = getCookie('csrftoken');
    
    fetch('/api/favorite-designer/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ designer_id: designerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            var isFavorited = data.is_favorited;
            var starIcon = button.querySelector('.favorite-star');
            
            // Toggle the button's favorited class
            button.classList.toggle('favorited', isFavorited);
            button.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
            
            // Update the star icon
            if (starIcon) {
                starIcon.setAttribute('fill', isFavorited ? 'currentColor' : 'none');
                starIcon.classList.toggle('favorited', isFavorited);
            }
            
            // Update the preferred designer dropdown if it exists
            var optionToUpdate = document.querySelector(
                '.preferred-designer-select option[value="' + designerId + '"]'
            );
            if (optionToUpdate && isFavorited) {
                // Designer was favorited, ensure star is in the dropdown
                if (!optionToUpdate.textContent.includes('★')) {
                    var name = optionToUpdate.textContent.trim();
                    optionToUpdate.textContent = name + ' ★';
                }
            } else if (optionToUpdate && !isFavorited) {
                // Designer was unfavorited, remove star from dropdown
                optionToUpdate.textContent = optionToUpdate.textContent.replace(' ★', '').trim();
            }
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
    });
}

/* User Dashboard - Bulk Delete Design Requests */
function toggleSelectAllDesignRequests() {
    var selectAllCheckbox = document.getElementById('selectAllDesignRequests');
    var checkboxes = document.querySelectorAll('.design-request-checkbox');
    
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateDesignRequestBulkActions();
}

function updateDesignRequestBulkActions() {
    var checkedBoxes = document.querySelectorAll('.design-request-checkbox:checked');
    var bulkActionsBar = document.getElementById('designRequestsBulkActions');
    var selectedCount = document.getElementById('selectedDesignCount');

    if (checkedBoxes.length > 0) {
        bulkActionsBar.classList.add('show');
        selectedCount.textContent = checkedBoxes.length + ' design request' + (checkedBoxes.length > 1 ? 's' : '') + ' selected';
    } else {
        bulkActionsBar.classList.remove('show');
    }

    // Update select all checkbox state
    var allCheckboxes = document.querySelectorAll('.design-request-checkbox');
    var selectAllCheckbox = document.getElementById('selectAllDesignRequests');
    if (checkedBoxes.length === allCheckboxes.length && allCheckboxes.length > 0) {
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.checked = false;
    }
}

function bulkDeleteDesignRequests() {
    var checkedBoxes = document.querySelectorAll('.design-request-checkbox:checked');
    var requestIds = Array.from(checkedBoxes).map(function(cb) { return cb.value; });

    if (requestIds.length === 0) {
        alert('No design requests selected.');
        return;
    }

    // Show bulk delete confirmation modal
    var bulkDeleteCount = document.getElementById('bulkDeleteCount');
    if (bulkDeleteCount) {
        bulkDeleteCount.textContent = requestIds.length;
    }
    openModal('bulkDeleteModal');
}

// Bulk Delete Modal Functions
function closeBulkDeleteModal() {
    closeModal('bulkDeleteModal');
}

function confirmBulkDelete(btn) {
    var checkedBoxes = document.querySelectorAll('.design-request-checkbox:checked');
    var requestIds = Array.from(checkedBoxes).map(function(cb) { return cb.value; });

    if (requestIds.length === 0) {
        closeBulkDeleteModal();
        return false;
    }

    var csrftoken = getCookie('csrftoken');
    var deletePromises = requestIds.map(function(requestId) {
        return fetch('/design-request/' + requestId + '/delete/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });
    });

    Promise.all(deletePromises)
        .then(function() {
            // Remove deleted rows
            checkedBoxes.forEach(function(checkbox) {
                var row = checkbox.closest('tr');
                if (row) {
                    row.remove();
                }
            });

            // Hide bulk actions bar
            var bulkActionsBar = document.getElementById('designRequestsBulkActions');
            bulkActionsBar.classList.remove('show');

            // Close the bulk delete modal
            closeBulkDeleteModal();

            // Check if table is now empty
            var tbody = document.querySelector('.design-requests-table tbody');
            if (tbody) {
                var remainingRows = tbody.querySelectorAll('tr');
                if (remainingRows.length === 0) {
                    var table = document.querySelector('.design-requests-table');
                    var emptyState = document.getElementById('emptyState');
                    if (table) table.style.display = 'none';
                    if (emptyState) emptyState.style.display = 'flex';
                }
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('Error deleting design requests. Please try again.');
            closeBulkDeleteModal();
        });
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

        // Click to browse - trigger file input click
        editFileUploadArea.addEventListener('click', function (e) {
            // Don't trigger if clicking on file list items or remove buttons
            if (e.target.closest('.file-list') || e.target.closest('.file-item-remove')) {
                return;
            }
            e.stopPropagation();
            editFileInput.click();
        });

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

            // Toggle upload content visibility
            var uploadContent = editFileUploadArea.querySelector('.file-upload-area-content');
            if (uploadContent) {
                uploadContent.style.display = files.length > 0 ? 'none' : 'flex';
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

    // Cover Photo Cropping Functionality
    var coverCropper = null;
    var coverEditBtn = document.getElementById('coverEditBtn');
    var coverPhotoInput = document.getElementById('cover_photo_input');
    var coverCropperModal = document.getElementById('coverCropperModal');
    var coverCropperImage = document.getElementById('coverCropperImage');
    var closeCoverCropperBtn = document.getElementById('closeCoverCropperBtn');
    var cancelCoverCropBtn = document.getElementById('cancelCoverCropBtn');
    var applyCoverCropBtn = document.getElementById('applyCoverCropBtn');
    var profileCover = document.getElementById('profileCover');

    if (coverEditBtn && coverPhotoInput) {
        // Click on cover edit button
        coverEditBtn.addEventListener('click', function () {
            coverPhotoInput.click();
        });

        // Click on cover clear button
        var coverClearBtn = document.getElementById('coverClearBtn');
        if (coverClearBtn) {
            coverClearBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to clear your cover photo?')) {
                    // Submit AJAX request to clear cover photo
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
                    var csrfToken = getCookie('csrftoken');
                    
                    fetch('/api/clear-cover-photo/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Reload the page to show the cleared cover photo
                            window.location.reload();
                        } else {
                            alert('Error clearing cover photo: ' + (data.error || 'Unknown error'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error clearing cover photo. Please try again.');
                    });
                }
            });
        }

        // File input change
        coverPhotoInput.addEventListener('change', function (e) {
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
                    if (coverCropperImage && coverCropperModal) {
                        // Show modal immediately
                        coverCropperModal.classList.add('show');
                        document.documentElement.classList.add('cropper-modal-open');
                        document.body.classList.add('cropper-modal-open');

                        // Destroy existing cropper
                        if (coverCropper) {
                            coverCropper.destroy();
                            coverCropper = null;
                        }

                        // Clear src first to ensure fresh load
                        coverCropperImage.src = '';

                        // Set new src and init cropper after image loads
                        coverCropperImage.onload = function () {
                            // Small delay to ensure modal is rendered
                            setTimeout(function () {
                                initCoverCropper();
                            }, 50);
                        };

                        coverCropperImage.src = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Initialize cover cropper function
    function initCoverCropper() {
        if (!coverCropperImage) return;

        coverCropper = new Cropper(coverCropperImage, {
            aspectRatio: 1200 / 400, // Match profile-cover dimensions (height 280px, approximate width)
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
            minContainerHeight: 100,
            ready: function () {
                // Cropper is ready
                console.log('Cover Cropper ready');
            }
        });
    }

    // Close cover cropper modal
    if (closeCoverCropperBtn) {
        closeCoverCropperBtn.addEventListener('click', function () {
            closeCoverCropperModal();
        });
    }

    // Cancel cover crop
    if (cancelCoverCropBtn) {
        cancelCoverCropBtn.addEventListener('click', function () {
            closeCoverCropperModal();
        });
    }

    // Zoom in cover
    var coverZoomInBtn = document.getElementById('coverZoomInBtn');
    if (coverZoomInBtn) {
        coverZoomInBtn.addEventListener('click', function () {
            if (coverCropper) {
                coverCropper.zoom(0.1);
            }
        });
    }

    // Zoom out cover
    var coverZoomOutBtn = document.getElementById('coverZoomOutBtn');
    if (coverZoomOutBtn) {
        coverZoomOutBtn.addEventListener('click', function () {
            if (coverCropper) {
                coverCropper.zoom(-0.1);
            }
        });
    }

    // Rotate left cover
    var coverRotateLeftBtn = document.getElementById('coverRotateLeftBtn');
    if (coverRotateLeftBtn) {
        coverRotateLeftBtn.addEventListener('click', function () {
            if (coverCropper) {
                coverCropper.rotate(-45);
            }
        });
    }

    // Rotate right cover
    var coverRotateRightBtn = document.getElementById('coverRotateRightBtn');
    if (coverRotateRightBtn) {
        coverRotateRightBtn.addEventListener('click', function () {
            if (coverCropper) {
                coverCropper.rotate(45);
            }
        });
    }

    // Flip horizontal cover
    var coverFlipHorizontalBtn = document.getElementById('coverFlipHorizontalBtn');
    if (coverFlipHorizontalBtn) {
        coverFlipHorizontalBtn.addEventListener('click', function () {
            if (coverCropper) {
                var scaleX = coverCropper.getData().scaleX || 1;
                coverCropper.scaleX(-scaleX);
            }
        });
    }

    // Flip vertical cover
    var coverFlipVerticalBtn = document.getElementById('coverFlipVerticalBtn');
    if (coverFlipVerticalBtn) {
        coverFlipVerticalBtn.addEventListener('click', function () {
            if (coverCropper) {
                var scaleY = coverCropper.getData().scaleY || 1;
                coverCropper.scaleY(-scaleY);
            }
        });
    }

    // Reset cover crop
    var coverResetCropBtn = document.getElementById('coverResetCropBtn');
    if (coverResetCropBtn) {
        coverResetCropBtn.addEventListener('click', function () {
            if (coverCropper) {
                coverCropper.reset();
            }
        });
    }

    // Apply cover crop
    if (applyCoverCropBtn) {
        applyCoverCropBtn.addEventListener('click', function () {
            if (coverCropper) {
                // Get cropped canvas (use original dimensions to preserve quality)
                var canvas = coverCropper.getCroppedCanvas({
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high'
                });

                // Convert to base64 (use JPEG with high quality to balance quality and size)
                var croppedImageData = canvas.toDataURL('image/jpeg', 0.98);

                // Update cover photo display
                if (profileCover) {
                    var existingImg = profileCover.querySelector('.cover-photo-image');
                    if (existingImg) {
                        existingImg.src = croppedImageData;
                    } else {
                        var img = document.createElement('img');
                        img.src = croppedImageData;
                        img.alt = 'Cover Photo';
                        img.className = 'cover-photo-image';
                        profileCover.insertBefore(img, profileCover.firstChild);
                    }
                }

                closeCoverCropperModal();

                // Submit the cover photo via AJAX
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
                var csrfToken = getCookie('csrftoken');
                
                fetch('/api/upload-cover-photo/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        cover_cropped_image_data: croppedImageData
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Reload the page to show the new cover photo
                        window.location.reload();
                    } else {
                        alert('Error uploading cover photo: ' + (data.error || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error uploading cover photo. Please try again.');
                });
            }
        });
    }

    // Close modal when clicking outside
    if (coverCropperModal) {
        coverCropperModal.addEventListener('click', function (e) {
            if (e.target === coverCropperModal) {
                closeCoverCropperModal();
            }
        });
    }

    // Close cover cropper modal function
    function closeCoverCropperModal() {
        if (coverCropperModal) {
            coverCropperModal.classList.remove('show');
        }

        document.documentElement.classList.remove('cropper-modal-open');
        document.body.classList.remove('cropper-modal-open');

        if (coverCropper) {
            coverCropper.destroy();
            coverCropper = null;
        }

        // Reset file input
        if (coverPhotoInput) {
            coverPhotoInput.value = '';
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
    
    // Store request ID in the modal for revision button
    var completionModal = document.getElementById('completionModal');
    if (completionModal) {
        completionModal.setAttribute('data-request-id', requestId);
    }

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
            var designerProfileLink = document.getElementById('designerProfileLink');

            console.log('Designer data:', data.designer);
            console.log('Elements:', { designerSection, designerAvatar, designerName, designerProfileLink });

            if (data.designer && designerSection && designerAvatar && designerName) {
                designerSection.style.display = 'block';
                designerName.textContent = data.designer.name;

                // Set avatar - either profile picture or initials
                if (data.designer.profile_picture) {
                    designerAvatar.innerHTML = '<img src="' + data.designer.profile_picture + '" alt="' + data.designer.name + '">';
                } else {
                    designerAvatar.innerHTML = '<span class="avatar-initials">' + (data.designer.initials || '?') + '</span>';
                }

                // Set profile link
                if (designerProfileLink && data.designer.username) {
                    designerProfileLink.href = '/profile/' + data.designer.username + '/';
                }

                // Load and setup rating functionality
                setupRatingSystem(requestId);
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

function requestRevisionFromModal() {
    // Get request ID from the completion modal
    var completionModal = document.getElementById('completionModal');
    if (!completionModal) {
        console.error('Completion modal not found');
        return;
    }
    
    var requestId = completionModal.getAttribute('data-request-id');
    if (!requestId) {
        console.error('Request ID not found in completion modal');
        alert('Error: Could not get request ID');
        return;
    }
    
    // Get the title from the completion modal
    var titleEl = document.getElementById('completionTitle');
    var title = titleEl ? titleEl.textContent : 'Unknown Project';
    
    // Close the completion modal
    closeCompletionModal();
    
    // Open the revision modal
    var revisionModal = document.getElementById('revisionModal');
    var form = document.getElementById('revisionForm');
    var titleElRevision = document.getElementById('revisionRequestTitle');
    var notesField = document.getElementById('revision_notes');
    
    if (revisionModal && form && titleElRevision) {
        // Set the form action
        form.action = '/design-request/' + requestId + '/request-revision/';
        
        // Set the title
        titleElRevision.textContent = title;
        
        // Clear the notes field
        if (notesField) notesField.value = '';
        
        // Show the revision modal
        openModal('revisionModal');
    } else {
        console.error('Revision modal elements not found');
    }
}

// Rating System Functions
let currentRequestId = null;
let selectedRating = 0;

function setupRatingSystem(requestId) {
    currentRequestId = requestId;
    const rateBtnText = document.getElementById('rateBtnText');

    // Fetch current rating
    fetch('/api/get-designer-rating/' + requestId + '/')
        .then(response => response.json())
        .then(data => {
            if (data.user_rating) {
                rateBtnText.textContent = 'Rated ' + data.user_rating + '/5';
            } else if (data.average_rating > 0) {
                rateBtnText.textContent = 'Avg: ' + data.average_rating + '/5';
            } else {
                rateBtnText.textContent = 'Rate';
            }
        })
        .catch(error => {
            console.error('Error fetching rating:', error);
            rateBtnText.textContent = 'Rate';
        });
}

function openRatingModal() {
    if (!currentRequestId) return;
    
    const modal = document.getElementById('ratingModal');
    const ratingDesignerAvatar = document.getElementById('ratingDesignerAvatar');
    const ratingDesignerName = document.getElementById('ratingDesignerName');
    const ratingTextLarge = document.getElementById('ratingTextLarge');
    const starsLarge = document.querySelectorAll('#ratingStarsLarge .star-large');
    
    // Get designer info from completion modal
    const designerAvatar = document.getElementById('designerAvatar');
    const designerName = document.getElementById('designerName');
    
    // Copy designer info to rating modal
    ratingDesignerAvatar.innerHTML = designerAvatar.innerHTML;
    ratingDesignerName.textContent = designerName.textContent;
    
    // Fetch current rating
    fetch('/api/get-designer-rating/' + currentRequestId + '/')
        .then(response => response.json())
        .then(data => {
            if (data.user_rating) {
                selectedRating = data.user_rating;
                updateStarsLarge(starsLarge, selectedRating);
                ratingTextLarge.textContent = 'Your rating: ' + selectedRating + '/5';
            } else {
                selectedRating = 0;
                updateStarsLarge(starsLarge, 0);
                ratingTextLarge.textContent = 'Click on a star to rate';
            }
        })
        .catch(error => {
            console.error('Error fetching rating:', error);
            selectedRating = 0;
            updateStarsLarge(starsLarge, 0);
            ratingTextLarge.textContent = 'Click on a star to rate';
        });
    
    // Add hover effects
    starsLarge.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateStarsLarge(starsLarge, rating);
            ratingTextLarge.textContent = getRatingText(rating);
        });

        star.addEventListener('mouseleave', function() {
            updateStarsLarge(starsLarge, selectedRating);
            ratingTextLarge.textContent = selectedRating > 0 ? 'Your rating: ' + selectedRating + '/5' : 'Click on a star to rate';
        });

        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStarsLarge(starsLarge, selectedRating);
            ratingTextLarge.textContent = 'Your rating: ' + selectedRating + '/5';
        });
    });
    
    openModal('ratingModal');
}

function closeRatingModal() {
    closeModal('ratingModal');
    selectedRating = 0;
}

function updateStarsLarge(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function getRatingText(rating) {
    const texts = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };
    return texts[rating] || '';
}

function submitRating() {
    if (selectedRating === 0) {
        showNotification('Please select a rating', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitRatingBtn');
    const ratingComment = document.getElementById('ratingComment').value.trim();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    fetch('/api/save-designer-rating/' + currentRequestId + '/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ rating: selectedRating, comment: ratingComment })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save rating value before closing modal
            const savedRating = selectedRating;
            
            showNotification('Rating saved successfully!', 'success');
            closeRatingModal();
            
            // Update button text with saved rating
            const rateBtnText = document.getElementById('rateBtnText');
            rateBtnText.textContent = 'Rated ' + savedRating + '/5';
        } else {
            showNotification('Error saving rating: ' + data.error, 'error');
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Rating';
    })
    .catch(error => {
        console.error('Error saving rating:', error);
        showNotification('Error saving rating. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Rating';
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

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#10b981';
    } else {
        notification.style.background = '#ef4444';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/* Designer Dashboard - Dynamic Section Switching */
function showDashboardSection(sectionId) {
    console.log('=== showDashboardSection called ===');
    console.log('Target section ID:', sectionId);

    // Hide all sections - use both class and direct style
    var allSections = document.querySelectorAll('.dashboard-section-content');
    console.log('Found sections:', allSections.length);
    allSections.forEach(function (section, index) {
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
    sidebarItems.forEach(function (item) {
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
document.addEventListener('DOMContentLoaded', function () {
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
        sidebarItems.forEach(function (item) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function (e) {
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
            return response.json().then(function (data) {
                return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                closeModal('addUserModal');
                showMessageModal('Success', 'User created successfully!', 'success');
                // Dynamically add new user row to table
                if (result.data.user) {
                    addUserRowToTable(result.data.user);
                }
            } else {
                showMessageModal('Error', result.data.error || 'Unknown error occurred.', 'error');
            }
        })
        .catch(function (error) {
            console.error('Error creating user:', error);
            showMessageModal('Error', 'Error creating user. Please try again.', 'error');
        });
}

function addUserRowToTable(user) {
    var tbody = document.querySelector('.users-table tbody');
    if (!tbody) return;
    
    // Create new row
    var tr = document.createElement('tr');
    tr.setAttribute('data-user-id', user.id);
    
    // Build role badge
    var roleBadge = '';
    if (user.is_superuser) {
        roleBadge = '<span class="role-badge role-owner">Owner</span>';
    } else if (user.user_role === 'admin' && user.admin_approval_status === 'pending') {
        roleBadge = '<span class="status-badge status-pending">Pending Approval</span>';
    } else {
        roleBadge = '<span class="role-badge role-' + user.user_role + '">' + user.user_role_display + '</span>';
    }
    
    // Build profile picture
    var avatarHtml = '';
    if (user.profile_picture) {
        avatarHtml = '<img src="' + user.profile_picture + '" alt="' + user.first_name + '">';
    } else {
        avatarHtml = '<img src="/static/img/default-avatar.png" alt="' + user.first_name + '">';
    }
    
    // Build contact info
    var contactHtml = '<span class="email">' + user.email + '</span>';
    if (user.phone_number) {
        contactHtml += '<span class="phone">' + user.phone_number + '</span>';
    }
    
    // Build action buttons
    var actionButtons = '<div class="action-buttons">';
    actionButtons += '<button class="btn-icon btn-view" title="View User" data-user-id="' + user.id + '" data-action="view">';
    actionButtons += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    actionButtons += '</button>';
    actionButtons += '<button class="btn-icon btn-edit" title="Edit User" data-user-id="' + user.id + '" data-action="edit">';
    actionButtons += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    actionButtons += '</button>';
    // Only show delete button if not a superuser (unless current user is superuser)
    if (!user.is_superuser) {
        actionButtons += '<button class="btn-icon btn-delete" title="Delete User" data-user-id="' + user.id + '" data-action="delete">';
        actionButtons += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        actionButtons += '</button>';
    }
    actionButtons += '</div>';
    
    // Set row HTML
    tr.innerHTML = '<td style="text-align: center;"><input type="checkbox" class="user-checkbox" value="' + user.id + '" onchange="updateBulkActions()"></td>' +
        '<td class="user-cell"><div class="user-info"><div class="user-avatar">' + avatarHtml + '</div><div class="user-details"><span class="user-name">' + user.first_name + ' ' + user.last_name + '</span><span class="user-username">@' + user.username + '</span></div></div></td>' +
        '<td class="contact-cell"><div class="contact-info">' + contactHtml + '</div></td>' +
        '<td>' + roleBadge + '</td>' +
        '<td class="date-cell">' + user.joined_date + '</td>' +
        '<td class="actions-cell">' + actionButtons + '</td>';
    
    // Add row to table
    tbody.insertBefore(tr, tbody.firstChild);
    
    // Update user count
    var countBadge = document.querySelector('.count-badge');
    if (countBadge) {
        var currentCount = parseInt(countBadge.textContent) || 0;
        countBadge.textContent = (currentCount + 1) + ' total users in this site';
    }
}

function removeUserRowFromTable(userId) {
    var row = document.querySelector('tr[data-user-id="' + userId + '"]');
    if (row) {
        row.remove();
        // Update user count
        var countBadge = document.querySelector('.count-badge');
        if (countBadge) {
            var currentCount = parseInt(countBadge.textContent) || 0;
            if (currentCount > 0) {
                countBadge.textContent = (currentCount - 1) + ' total users in this site';
            }
        }
    }
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
            return response.json().then(function (data) {
                return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                closeModal('editUserModal');
                showMessageModal('Success', 'User updated successfully!', 'success');
                setTimeout(function () {
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
    console.log('deleteUser called with userId:', userId);
    fetch('/manage/user/' + userId + '/view/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(function (response) {
            console.log('View response status:', response.status);
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
            console.log('User data received:', data);
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            // Set user info in delete modal
            document.getElementById('deleteUserId').value = userId;
            document.getElementById('deleteUserName').textContent = (data.first_name + ' ' + data.last_name).trim() || data.username || 'Unknown';

            console.log('Opening deleteUserModal');
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
            return response.json().then(function (data) {
                return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok && result.data.success) {
                closeModal('deleteUserModal');
                showMessageModal('Success', 'User deleted successfully!', 'success');
                // Dynamically remove user row from table
                removeUserRowFromTable(userId);
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
    userCheckboxes.forEach(function (checkbox) {
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
    var userIds = Array.from(checkedBoxes).map(function (cb) { return cb.value; });

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
    var deletePromises = userIds.map(function (userId) {
        return fetch('/manage/user/' + userId + '/delete/', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            }
        });
    });

    Promise.all(deletePromises)
        .then(function () {
            closeModal('bulkDeleteUserModal');
            showMessageModal('Success', userIds.length + ' users deleted successfully!', 'success');
            setTimeout(function () {
                location.reload();
            }, 1500);
        })
        .catch(function (error) {
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
    var selectedRoles = Array.from(roleCheckboxes).map(function (cb) { return cb.value; });

    // Get selected statuses
    var statusCheckboxes = document.querySelectorAll('#filterDropdown .filter-section:nth-child(2) input:checked');
    var selectedStatuses = Array.from(statusCheckboxes).map(function (cb) { return cb.value; });

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

    rows.forEach(function (row, index) {
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
    checkboxes.forEach(function (cb) { cb.checked = false; });
    applyFilters();
}

function sortUsersTable() {
    var sortBy = document.getElementById('sortBy').value;
    var invertSort = document.getElementById('invertSort').checked;
    
    if (!sortBy) {
        return; // No sort option selected
    }
    
    var tableBody = document.querySelector('.users-table tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    var rows = Array.from(tableBody.querySelectorAll('tr'));
    
    // Filter out the empty state row
    var dataRows = rows.filter(function(row) {
        return row.id !== 'emptyStateRow';
    });
    
    var emptyStateRow = rows.find(function(row) {
        return row.id === 'emptyStateRow';
    });
    
    // Sort the rows
    dataRows.sort(function(a, b) {
        var valueA, valueB;
        
        switch(sortBy) {
            case 'first_name':
                valueA = getFirstName(a);
                valueB = getFirstName(b);
                break;
            case 'last_name':
                valueA = getLastName(a);
                valueB = getLastName(b);
                break;
            case 'contact_info':
                valueA = getContactInfo(a);
                valueB = getContactInfo(b);
                break;
            case 'join_date':
                valueA = getJoinDate(a);
                valueB = getJoinDate(b);
                break;
            default:
                return 0;
        }
        
        // Compare values
        var comparison = 0;
        if (sortBy === 'join_date') {
            // For dates, compare as Date objects
            var dateA = parseDate(valueA);
            var dateB = parseDate(valueB);
            comparison = dateA - dateB;
        } else {
            // For strings, compare case-insensitive
            comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }
        
        // Apply invert if checked
        return invertSort ? -comparison : comparison;
    });
    
    // Re-append rows in sorted order
    dataRows.forEach(function(row) {
        tableBody.appendChild(row);
    });
    
    // Re-append empty state row at the end if it exists
    if (emptyStateRow) {
        tableBody.appendChild(emptyStateRow);
    }
}

function getFirstName(row) {
    var nameElement = row.querySelector('.user-name');
    if (nameElement) {
        var fullName = nameElement.textContent.trim();
        var parts = fullName.split(' ');
        return parts[0] || '';
    }
    return '';
}

function getLastName(row) {
    var nameElement = row.querySelector('.user-name');
    if (nameElement) {
        var fullName = nameElement.textContent.trim();
        var parts = fullName.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    }
    return '';
}

function getContactInfo(row) {
    var emailElement = row.querySelector('.email');
    return emailElement ? emailElement.textContent.trim().toLowerCase() : '';
}

function getJoinDate(row) {
    var dateCell = row.querySelector('.date-cell');
    return dateCell ? dateCell.textContent.trim() : '';
}

function parseDate(dateString) {
    // Parse date in format "M d, Y" (e.g., "Mar 24, 2026")
    var months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    var parts = dateString.split(' ');
    if (parts.length === 3) {
        var month = months[parts[0]];
        var day = parseInt(parts[1].replace(',', ''));
        var year = parseInt(parts[2]);
        return new Date(year, month, day);
    }
    return new Date(0); // Return epoch if parsing fails
}

document.addEventListener('DOMContentLoaded', function () {
    // Close filter dropdown when clicking outside
    document.addEventListener('click', function (event) {
        var container = document.querySelector('.filter-dropdown-container');
        var dropdown = document.getElementById('filterDropdown');
        if (container && !container.contains(event.target)) {
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
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

document.addEventListener('DOMContentLoaded', function () {
    // Add click handlers for view and edit buttons in project modal
    document.querySelectorAll('.btn-view, .btn-edit').forEach(function (button) {
        button.addEventListener('click', function () {
            var designId = this.getAttribute('data-design-id');
            if (designId && typeof openProjectModal === 'function') {
                openProjectModal(parseInt(designId), null, null, null, null, null, null, null, null);
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
document.addEventListener('DOMContentLoaded', function () {
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
        item.addEventListener('click', function (e) {
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
        button.addEventListener('click', function () {
            this.parentElement.style.display = 'none';
        });
    });

    // ========== Change Password Modal ==========
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function (e) {
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
window.onclick = function (event) {
    if (event.target.classList.contains('change-password-modal')) {
        closeModal('changePasswordModal');
    }
    if (event.target.classList.contains('cropper-modal')) {
        closeCropperModal();
    }
    if (event.target.classList.contains('modal-overlay') && event.target.id === 'status-modal-overlay') {
        closeStatusModal();
    }
};

// ============ USER STATUS SYSTEM ============

// Initialize status badge styling
function initializeStatusBadge() {
    const statusBadge = document.getElementById('user-status-badge');
    if (!statusBadge) return;

    const status = statusBadge.getAttribute('data-status') || 'online';
    updateStatusBadgeAppearance(status, statusBadge);
}

// Update the appearance of the status badge
function updateStatusBadgeAppearance(status, badge = null) {
    if (!badge) {
        badge = document.getElementById('user-status-badge');
    }
    if (!badge) return;

    // Remove all status classes
    badge.classList.remove('online', 'idle', 'do_not_disturb');

    // Add the appropriate class
    badge.classList.add(status);
}

// Open status modal
function openStatusModal() {
    const modal = document.getElementById('status-modal');
    const overlay = document.getElementById('status-modal-overlay');
    const statusBadge = document.getElementById('user-status-badge');
    const currentStatus = statusBadge ? statusBadge.getAttribute('data-status') : 'online';

    if (!modal || !overlay) return;

    // Show modal and overlay
    modal.classList.add('active');
    overlay.classList.add('active');

    // Mark the current status as selected
    const statusOptions = modal.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-status') === currentStatus) {
            option.classList.add('selected');
        }
    });
}

// Close status modal
function closeStatusModal() {
    const modal = document.getElementById('status-modal');
    const overlay = document.getElementById('status-modal-overlay');

    if (modal) {
        modal.classList.remove('active');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Update user status via API
function updateUserStatus(status) {
    fetch('/api/update-status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]') ? document.querySelector('[name=csrfmiddlewaretoken]').value : getCookie('csrftoken')
        },
        body: JSON.stringify({ status: status })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the badge
                const badge = document.getElementById('user-status-badge');
                if (badge) {
                    badge.setAttribute('data-status', status);
                    updateStatusBadgeAppearance(status, badge);
                }

                // Close the modal
                closeStatusModal();

                // Close the dropdown menu
                const dropdown = document.getElementById('user-dropdown-menu');
                if (dropdown) {
                    dropdown.classList.remove('active');
                }

                // Show success message (optional)
                console.log('Status updated successfully');
            } else {
                console.error('Failed to update status:', data.error);
                alert('Failed to update status. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error updating status:', error);
            alert('An error occurred while updating status.');
        });
}

// Get CSRF token from cookie
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
    } return cookieValue;
}

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
                return response.json().then(data => Promise.reject({
                    message: 'Superuser access required', error: data.error
                }));
            }
            return response.json().then(data => Promise.reject(data));
        } return response.json();
    })
    .then(data => {
        showAdminActionModal(data.message, 'success');
    })
    .catch(error => {
        const msg = error.message || error.error || 'An error occurred';
        showAdminActionModal(msg, 'error');
        console.error('Admin action error:', error);
    });
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
            <button class="btn btn-primary" onclick="this.closest('.add-new-design-modal').remove(); location.reload();">OK</button>            
        </div>        
    </div>`; 
    document.body.appendChild(modal); modal.querySelector('button').focus(); 
}

// Status modal event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Initialize status badge on page load
    initializeStatusBadge();

    // Set Status button in dropdown
    const setStatusBtn = document.getElementById('set-status-btn');
    if (setStatusBtn) {
        setStatusBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openStatusModal();
        });
    }

    // Status modal close button
    const statusModalClose = document.getElementById('status-modal-close');
    if (statusModalClose) {
        statusModalClose.addEventListener('click', closeStatusModal);
    }

    // Status options click handlers
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', function () {
            const status = this.getAttribute('data-status');

            // Update UI to show this is selected
            statusOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // Update status via API
            updateUserStatus(status);
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {

    // Get user timezone from Django template or browser
    let userTimezone = window.userTimezone;
    if (!userTimezone || userTimezone === '') {
        try {
            userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            userTimezone = 'UTC';
        }
    }
    
    // Get 12/24 format preference (default to 24-hour)
    let is24HourFormat = localStorage.getItem('clock24HourFormat') !== 'false';

    function clock() {
        // Get current local time
        const now = new Date();
        
        // Convert to user's selected timezone
        let userDate;
        try {
            // Get time string in target timezone
            const tzTimeStr = now.toLocaleString('en-US', { timeZone: userTimezone });
            userDate = new Date(tzTimeStr);
        } catch (e) {
            userDate = now;
        }
        
        const hours = userDate.getHours();
        const minutes = userDate.getMinutes();
        const seconds = userDate.getSeconds();
        const ms = userDate.getMilliseconds();

        const smoothSeconds = seconds + ms / 1000;
        const smoothMinutes = minutes + smoothSeconds / 60;
        const smoothHours = (hours % 12) + smoothMinutes / 60;

        const secDeg = smoothSeconds * 6;
        const minDeg = smoothMinutes * 6;
        const hourDeg = smoothHours * 30;

        const secondHand = document.getElementById('second-hand');
        const minuteHand = document.getElementById('minute-hand');
        const hourHand = document.getElementById('hour-hand');
        
        if (secondHand) secondHand.setAttribute("transform", "rotate(" + secDeg + " 12 12)");
        if (minuteHand) minuteHand.setAttribute("transform", "rotate(" + minDeg + " 12 12)");
        if (hourHand) hourHand.setAttribute("transform", "rotate(" + hourDeg + " 12 12)");

        const displayMinutes = minutes < 10 ? "0" + minutes : minutes;
        const displaySeconds = seconds < 10 ? "0" + seconds : seconds;

        // Format time based on 12/24 preference
        let timeStr;
        if (!is24HourFormat) {
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            timeStr = displayHours + ":" + displayMinutes + ":" + displaySeconds + " " + period;
        } else {
            timeStr = hours + ":" + displayMinutes + ":" + displaySeconds;
        }

        // Format date
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        
        // Get timezone offset for the target timezone
        let tzOffsetStr = '';
        try {
            // Get a reference date formatted in the target timezone to extract offset
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: userTimezone,
                timeZoneName: 'shortOffset'
            });
            const parts = formatter.formatToParts(userDate);
            const tzPart = parts.find(p => p.type === 'timeZoneName');
            if (tzPart) {
                tzOffsetStr = ' ' + tzPart.value;
            } else {
                // Fallback: calculate offset from UTC time in target timezone
                const utcDate = new Date(userDate.toLocaleString('en-US', { timeZone: 'UTC' }));
                const targetDate = new Date(userDate.toLocaleString('en-US', { timeZone: userTimezone }));
                const tzOffset = Math.round((targetDate - utcDate) / 60000);
                const tzHours = Math.floor(Math.abs(tzOffset) / 60);
                const tzMins = Math.abs(tzOffset) % 60;
                const tzSign = tzOffset >= 0 ? '+' : '-';
                tzOffsetStr = ' UTC' + tzSign + tzHours + (tzMins ? ':' + tzMins.toString().padStart(2, '0') : '');
            }
        } catch (e) {
            // Use userTimezone name as fallback
            tzOffsetStr = ' (' + userTimezone + ')';
        }

        const clockElements = document.getElementsByClassName('clock');
        const dateElements = document.getElementsByClassName('date');
        
        if (clockElements.length > 0) {
            clockElements[0].innerHTML = timeStr;
        }
        if (dateElements.length > 0) {
            dateElements[0].innerHTML = '<b>' + months[userDate.getMonth()] + '. ' + userDate.getDate() + ', ' + userDate.getFullYear() + '</b> (' + weekday[userDate.getDay()] + ')' + tzOffsetStr;
        }
        
        // Update toggle button text
        const toggleBtn = document.querySelector('.clock-format-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = is24HourFormat ? '12h' : '24h';
        }
        
        requestAnimationFrame(clock);
    }

    // Add toggle button handler
    const toggleBtn = document.querySelector('.clock-format-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            is24HourFormat = !is24HourFormat;
            localStorage.setItem('clock24HourFormat', is24HourFormat);
        });
    }

    clock(); // start
});

// Dynamic notifications and activities polling
(function() {
    'use strict';
    
    let notificationsPollingInterval = null;
    let activitiesPollingInterval = null;
    let lastNotificationsHash = '';
    let lastActivitiesHash = '';
    let previousNotificationCount = 0;
    
    // Get CSRF token from cookie
    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // Fetch notifications from API
    function fetchNotifications() {
        fetch('/api/notifications/', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCSRFToken(),
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const notifications = data.notifications || [];
            const notificationsHash = JSON.stringify(notifications);
            
            // Only update if notifications changed
            if (notificationsHash !== lastNotificationsHash) {
                lastNotificationsHash = notificationsHash;
                updateNotificationsUI(notifications);
            }
        })
        .catch(error => {
            console.error('Error fetching notifications:', error);
        });
    }
    
    // Fetch activities from API
    function fetchActivities() {
        fetch('/api/activities/', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCSRFToken(),
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const activities = data.activities || [];
            const activitiesHash = JSON.stringify(activities);
            
            // Only update if activities changed
            if (activitiesHash !== lastActivitiesHash) {
                lastActivitiesHash = activitiesHash;
                updateActivitiesUI(activities);
            }
        })
        .catch(error => {
            console.error('Error fetching activities:', error);
        });
    }
    
    // Update notifications UI
    function updateNotificationsUI(notifications) {
        const notificationList = document.querySelector('.notification-popup .notification-list');
        const notificationBadge = document.getElementById('notification-badge');
        const notificationToggle = document.getElementById('notification-toggle');
        
        if (!notificationList) return;
        
        // Get notification IDs from the API response
        const notificationIds = notifications.map(n => n.id);
        
        // Get previously read notification IDs from localStorage
        const readNotificationIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        
        // Check if there are NEW (unread) notifications
        const hasNewNotifications = notificationIds.some(id => !readNotificationIds.includes(id));
        
        // Check if new notifications arrived (more than before)
        const hasMoreNotifications = notifications.length > previousNotificationCount;
        previousNotificationCount = notifications.length;
        
        // If new notifications arrived and user had read previous ones, re-enable animation
        if (hasMoreNotifications && window.notificationsRead) {
            window.notificationsRead = false;
            if (notificationToggle && notificationBadge) {
                notificationToggle.classList.add('has-notifications');
                notificationBadge.style.display = 'block';
                notificationBadge.classList.add('animate');
            }
        }
        
        // Update badge
        if (notificationBadge) {
            if (notifications.length > 0) {
                notificationBadge.textContent = notifications.length;
                // Only show badge if there are unread notifications
                if (hasNewNotifications) {
                    notificationBadge.style.display = 'block';
                    notificationBadge.classList.add('animate');
                } else {
                    notificationBadge.style.display = 'none';
                    notificationBadge.classList.remove('animate');
                }
            } else {
                notificationBadge.style.display = 'none';
                notificationBadge.classList.remove('animate');
            }
        }
        
        // Update notification list
        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p>No notifications yet</p>
                </div>
            `;
        } else {
            let html = '';
            notifications.forEach(notification => {
                let icon = '';
                if (notification.type === 'assigned' || notification.type === 'designer_assigned') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>`;
                } else if (notification.type === 'status_changed') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>`;
                } else if (notification.type === 'completed') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>`;
                } else if (notification.type === 'request_submitted') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>`;
                } else {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>`;
                }
                
                html += `
                    <div class="notification-item" data-notification-id="${notification.id}">
                        <div class="notification-icon">
                            ${icon}
                        </div>
                        <div class="notification-content">
                            <p class="notification-message">${notification.message}</p>
                            <span class="notification-time">${notification.time_ago}</span>
                        </div>
                        <button class="notification-delete-btn" data-notification-id="${notification.id}" title="Delete notification">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `;
            });
            notificationList.innerHTML = html;
            
            // Add click handlers for delete buttons
            document.querySelectorAll('.notification-delete-btn').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    
                    const notificationId = this.getAttribute('data-notification-id');
                    const notificationItem = this.closest('.notification-item');
                    
                    // Delete notification on the server
                    fetch(`/api/notifications/${notificationId}/delete/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCSRFToken(),
                            'Content-Type': 'application/json'
                        }
                    }).then(response => response.json()).then(data => {
                        if (data.success) {
                            // Add fade out animation
                            notificationItem.style.transition = 'opacity 0.3s ease, height 0.3s ease';
                            notificationItem.style.opacity = '0';
                            notificationItem.style.height = notificationItem.offsetHeight + 'px';
                            
                            setTimeout(() => {
                                notificationItem.style.height = '0';
                                notificationItem.style.padding = '0';
                                notificationItem.style.margin = '0';
                                notificationItem.style.overflow = 'hidden';
                                
                                setTimeout(() => {
                                    notificationItem.remove();
                                    
                                    // Check if there are any notifications left
                                    const remainingNotifications = document.querySelectorAll('.notification-item');
                                    if (remainingNotifications.length === 0) {
                                        document.querySelector('.notification-list').innerHTML = `
                                            <div class="notification-empty">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                                </svg>
                                                <p>No notifications yet</p>
                                            </div>
                                        `;
                                        
                                        // Remove notification badge
                                        const notificationToggle = document.getElementById('notification-toggle');
                                        const notificationBadge = document.getElementById('notification-badge');
                                        if (notificationToggle) notificationToggle.classList.remove('has-notifications');
                                        if (notificationBadge) notificationBadge.style.display = 'none';
                                    }
                                }, 300);
                            }, 300);
                        }
                    }).catch(error => {
                        console.error('Error deleting notification:', error);
                    });
                });
            });
        }
    }
    
    // Update activities UI
    function updateActivitiesUI(activities) {
        const activityList = document.querySelector('.activity-list');
        const activityContent = document.querySelector('.activity-content');
        
        if (!activityList || !activityContent) return;
        
        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div class="empty-activity">
                    <span>No recent activity</span>
                </div>
            `;
        } else {
            let html = '<ul class="activity-list compact">';
            activities.slice(0, 5).forEach(activity => {
                let icon = '';
                if (activity.type === 'request_submitted') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
                } else if (activity.type === 'status_changed') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>`;
                } else if (activity.type === 'completed') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                } else if (activity.type === 'payment_received' || activity.type === 'payment_confirmed') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
                } else if (activity.type === 'revision_requested') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
                } else if (activity.type === 'request_rejected' || activity.type === 'request_cancelled') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
                } else if (activity.type === 'login') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`;
                } else if (activity.type === 'logout') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
                } else if (activity.type === 'profile_updated') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                } else if (activity.type === 'file_uploaded') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`;
                } else if (activity.type === 'password_changed') {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
                } else {
                    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
                }
                
                html += `
                    <li class="activity-item">
                        <div class="activity-icon status-${activity.type}">
                            ${icon}
                        </div>
                        <div class="activity-details">
                            <p class="activity-text">${activity.message}</p>
                            <span class="activity-time">${activity.time_ago}</span>
                        </div>
                    </li>
                `;
            });
            html += '</ul>';
            
            if (activities.length > 5) {
                html += `
                    <div class="view-more">
                        <button class="btn-view-more" onclick="showDashboardSection('activity')">View all activity →</button>
                    </div>
                `;
            }
            
            activityContent.innerHTML = html;
        }
    }
    
    // Start polling when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initial fetch
        fetchNotifications();
        fetchActivities();
        
        // Poll every 10 seconds
        notificationsPollingInterval = setInterval(fetchNotifications, 10000);
        activitiesPollingInterval = setInterval(fetchActivities, 10000);
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (notificationsPollingInterval) {
            clearInterval(notificationsPollingInterval);
        }
        if (activitiesPollingInterval) {
            clearInterval(activitiesPollingInterval);
        }
    });
})();

// --- Dynamic Currency Conversion System ---
// Uses public CDN API for live rates. Converts displayed prices in dashboards
// to the user's preferred currency (from settings) using data attrs on .currency-convert elements.
(function() {
    const CURRENCY_API = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/';
    const ratesCache = {};
    let conversionInProgress = false;

    window.USER_CURRENCY = window.USER_CURRENCY || 'USD';

    const JS_CURRENCY_SYMBOLS = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'PHP': '₱', 'JPY': '¥',
        'AUD': 'A$', 'CAD': 'C$', 'INR': '₹', 'CNY': '¥', 'KRW': '₩',
        'RUB': '₽', 'BRL': 'R$', 'TRY': '₺', 'ZAR': 'R', 'MXN': 'MX$',
        'SGD': 'S$', 'HKD': 'HK$', 'CHF': 'CHF', 'SEK': 'kr', 'NOK': 'kr',
        'DKK': 'kr', 'PLN': 'zł', 'THB': '฿', 'MYR': 'RM', 'IDR': 'Rp',
        'VND': '₫', 'AED': 'د.إ', 'SAR': '﷼', 'QAR': '﷼', 'EGP': 'E£',
        'NGN': '₦', 'GHS': '₵', 'KES': 'KSh', 'TZS': 'TSh', 'UGX': 'USh',
        'NZD': 'NZ$', 'TWD': 'NT$', 'ILS': '₪', 'HUF': 'Ft', 'CZK': 'Kč',
        'RON': 'lei', 'UAH': '₴', 'ARS': 'AR$', 'CLP': 'CLP$', 'COP': 'COL$',
        'PEN': 'S/', 'CRC': '₡', 'DOP': 'RD$', 'GTQ': 'Q', 'HNL': 'L',
        'NIO': 'C$', 'PAB': 'B/.', 'PYG': '₲', 'UYU': 'UY$', 'BOB': 'Bs',
        'XOF': 'CFA', 'XAF': 'FCFA', 'MAD': 'MAD', 'TND': 'DT', 'JOD': 'JD',
        'LBP': 'ل.ل', 'IQD': 'ع.د', 'IRR': '﷼', 'PKR': '₨', 'BDT': '৳',
        'LKR': 'Rs', 'NPR': 'रू', 'MMK': 'K', 'KHR': '៛', 'LAK': '₭',
        'MNT': '₮', 'KZT': '₸', 'KGS': 'с', 'TJS': 'ЅМ', 'AFN': '؋',
        'AMD': '֏', 'AZN': '₼', 'GEL': '₾', 'MDL': 'L', 'BYN': 'Br',
        'ALL': 'L', 'MKD': 'ден', 'RSD': 'дин', 'BAM': 'KM', 'HRK': 'kn',
        'BGN': 'лв', 'ISK': 'kr', 'FJD': 'FJ$', 'PGK': 'K', 'SBD': 'SI$',
        'TOP': 'T$', 'WST': 'WS$', 'VUV': 'VT', 'XPF': '₣', 'XCD': 'EC$',
        'BBD': 'Bds$', 'BMD': 'BD$', 'BSD': 'BS$', 'BZD': 'BZ$', 'GYD': 'GY$',
        'JMD': 'J$', 'TTD': 'TT$'
    };

    function getJSSymbol(code) {
        if (!code) code = 'USD';
        code = code.toUpperCase();
        return JS_CURRENCY_SYMBOLS[code] || code;
    }

    async function fetchRates(base) {
        const key = base.toLowerCase();
        if (ratesCache[key]) return ratesCache[key];
        try {
            const res = await fetch(`${CURRENCY_API}${key}.json`, { cache: 'force-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            const rates = json[key] || {};
            ratesCache[key] = rates;
            return rates;
        } catch (err) {
            console.warn('[currency] rate fetch failed for', base, err.message);
            return null;
        }
    }

    async function convertCurrency(amount, from, to) {
        amount = parseFloat(amount);
        if (!amount || isNaN(amount)) return amount;
        from = (from || 'USD').toUpperCase();
        to = (to || 'USD').toUpperCase();
        if (from === to) return amount;

        // Try direct: fetch from-base, multiplier = rates[toLower]
        let rates = await fetchRates(from);
        let rateKey = to.toLowerCase();
        if (rates && typeof rates[rateKey] === 'number') {
            return amount * rates[rateKey];
        }

        // Inverse: fetch to-base
        rates = await fetchRates(to);
        rateKey = from.toLowerCase();
        if (rates && typeof rates[rateKey] === 'number' && rates[rateKey] !== 0) {
            return amount / rates[rateKey];
        }

        // no rate found
        return amount;
    }

    async function updateCurrencyDisplays() {
        if (conversionInProgress) return;
        conversionInProgress = true;
        const els = document.querySelectorAll('.currency-convert');
        if (!els.length) {
            conversionInProgress = false;
            return;
        }
        const target = (window.USER_CURRENCY || 'USD').toUpperCase();
        const promises = [];
        els.forEach(el => {
            const amt = el.dataset.amount;
            const from = el.dataset.from || 'USD';
            if (!amt) return;
            const p = convertCurrency(amt, from, target).then(converted => {
                const sym = getJSSymbol(target);
                const val = (typeof converted === 'number' && isFinite(converted))
                    ? converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : amt;
                el.textContent = sym + val;
                el.title = `Converted from ${getJSSymbol(from)}${amt} (${from})`;
            }).catch(() => {
                // leave as-is on error
            });
            promises.push(p);
        });
        await Promise.all(promises);
        conversionInProgress = false;
    }

    // Auto-run on load (and allow re-run if needed)
    function initCurrencyConversion() {
        // ensure global
        if (!window.USER_CURRENCY) {
            const meta = document.querySelector('meta[name="user-currency"]');
            if (meta) window.USER_CURRENCY = meta.content;
        }
        // run after short delay to let other scripts settle
        setTimeout(() => {
            updateCurrencyDisplays();
        }, 150);

        // Also expose for manual trigger e.g. after dynamic content
        window.refreshCurrencyDisplays = updateCurrencyDisplays;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCurrencyConversion);
    } else {
        initCurrencyConversion();
    }

    // Optional: refresh if user currency changes at runtime (advanced)
    // window.setUserCurrency = (c) => { window.USER_CURRENCY = c; updateCurrencyDisplays(); };
})();
