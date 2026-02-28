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

        if (hour >= 5 && hour < 12) {
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
        
        // Always default to dashboard section on page load
        // (localStorage is only used when clicking sidebar, not on initial load)
        showDashboardSection('dashboard');
        
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
