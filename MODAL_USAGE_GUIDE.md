# Unified Modal System - Usage Guide

## Quick Start

All modals now use a unified CSS framework. No matter which modal type you're using, they all follow the same design language and styling patterns.

## HTML Structure

### Basic Modal Template
```html
<!-- Backdrop/Overlay -->
<div class="modal-overlay"></div>

<!-- Modal Container -->
<div class="modal" id="exampleModal">
    <!-- Header -->
    <div class="modal-header">
        <h2>Modal Title</h2>
        <button class="modal-close">&times;</button>
    </div>
    
    <!-- Body Content -->
    <div class="modal-body">
        <p>Your content here</p>
    </div>
    
    <!-- Actions -->
    <div class="modal-actions">
        <button class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary">Save</button>
    </div>
</div>
```

### Alternative Structure (with modal-content wrapper)
```html
<div class="modal" id="exampleModal">
    <div class="modal-content">
        <button class="close-btn">&times;</button>
        
        <h2>Modal Title</h2>
        
        <div class="modal-body">
            <!-- Content here -->
        </div>
        
        <div class="modal-actions">
            <!-- Buttons here -->
        </div>
    </div>
</div>
```

## CSS Classes Reference

### Container Classes
| Class | Purpose | Max Width |
|-------|---------|-----------|
| `.modal` | Full-screen modal wrapper | N/A |
| `.modal-wrapper` | Alternative wrapper | N/A |
| `.modal-container` | Content container | 500px |
| `.modal-content` | Alternative content wrapper | 500px |

### Size Variants
| Class | Max Width | Use Case |
|-------|-----------|----------|
| `.modal-sm` | 400px | Small dialogs, confirmations |
| `.modal-md` | 500px | Default, most modals |
| `.modal-lg` | 700px | Forms, complex layouts |

Example:
```html
<div class="modal-content modal-lg">
    <!-- Large form modal -->
</div>
```

### Display States
| Class | Use Case |
|-------|----------|
| `.active` | For `.modal`, `.project-modal`, `.confirm-modal` |
| `.show` | For `.modal-wrapper`, `.edit-modal`, `.add-new-design-modal`, `.cropper-modal` |

### Component Classes
| Class | Purpose |
|-------|---------|
| `.modal-header` | Header with title and close button |
| `.modal-body` | Scrollable content area |
| `.modal-actions` | Footer with action buttons |
| `.modal-close` | Close button (×) |
| `.close-btn` | Alternative close button |
| `.modal-overlay` | Semi-transparent backdrop |

## JavaScript Integration

### Opening a Modal
```javascript
// Using .active class
document.getElementById('myModal').classList.add('active');

// Using .show class (alternative)
document.getElementById('myModal').classList.add('show');
```

### Closing a Modal
```javascript
// Remove active/show class
document.getElementById('myModal').classList.remove('active');
document.getElementById('myModal').classList.remove('show');
```

### Complete Modal Handler Example
```javascript
// Get elements
const modal = document.getElementById('myModal');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.querySelector('#myModal .modal-close');
const overlay = document.querySelector('#myModal .modal-overlay');

// Open modal
openBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

// Close modal (close button)
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal (overlay click)
overlay.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal (ESC key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.classList.remove('active');
    }
});
```

## Styling Examples

### Adding Custom Form Styles
```css
/* Your custom form inside a unified modal */
.my-modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.my-modal-form .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.my-modal-form input,
.my-modal-form select,
.my-modal-form textarea {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
}
```

### Custom Modal Title Color
```css
.my-custom-modal .modal-header h2 {
    color: #e87f14; /* Primary color */
}
```

### Responsive Adjustments
Modal responsiveness is automatic at 540px breakpoint. For custom breakpoints:

```css
@media (max-width: 600px) {
    .modal-content {
        width: 95%;
        max-height: 80vh;
    }
    
    .modal-actions {
        flex-direction: column;
    }
    
    .modal-actions .btn {
        width: 100%;
    }
}
```

## Dark Mode Support

Dark mode is automatically applied when `body.dark-mode` class is present. No additional styling needed!

### Dark Mode Colors
- Background: #2d2d2d
- Text: #e0e0e0
- Borders: #404040
- Accent: #e87f14 (on hover)

## Common Patterns

### Confirmation Modal
```html
<div class="modal" id="confirmModal">
    <div class="modal-content modal-sm">
        <button class="close-btn">&times;</button>
        <h2>Confirm Action</h2>
        <div class="modal-body">
            <p>Are you sure you want to proceed?</p>
        </div>
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeConfirm()">Cancel</button>
            <button class="btn btn-danger" onclick="confirmAction()">Delete</button>
        </div>
    </div>
</div>
```

### Form Modal
```html
<div class="modal" id="formModal">
    <div class="modal-content modal-lg">
        <button class="close-btn">&times;</button>
        <h2>Edit Profile</h2>
        <div class="modal-body">
            <form id="editForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
            </form>
        </div>
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeForm()">Cancel</button>
            <button class="btn btn-primary" onclick="submitForm()">Save</button>
        </div>
    </div>
</div>
```

### Success/Error Modal
```html
<div class="modal" id="messageModal">
    <div class="modal-content modal-sm">
        <button class="close-btn">&times;</button>
        <h2>Success!</h2>
        <div class="modal-body">
            <p>Your changes have been saved.</p>
        </div>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="closeMessage()">OK</button>
        </div>
    </div>
</div>
```

## Accessibility

The unified modal system includes:
- Semantic HTML (`<button>`, `<h2>`)
- Focus management
- ARIA-compliant close buttons
- Keyboard navigation (ESC to close)
- High contrast in both light/dark modes

## Performance Tips

1. **Reuse modals** - Don't create new modals, reuse existing ones
2. **Lazy load** - Load modal content only when needed
3. **Optimize images** - Images in modals should be compressed
4. **Event delegation** - Use event delegation for multiple similar modals
5. **Debounce** - Debounce fast modal opens/closes

## Migration from Old Modals

If updating old modal code:

### Old Approach (No longer needed)
```css
.custom-modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    display: none;
}

.custom-modal.open {
    display: flex;
}
```

### New Approach (Use unified classes)
```html
<div class="modal" id="customModal">
    <!-- Uses unified system automatically -->
</div>
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Modal not showing?
- Check that `.active` or `.show` class is applied
- Verify z-index isn't being overridden
- Check browser console for JavaScript errors

### Styling looks wrong?
- Verify dark mode: check if `body.dark-mode` is applied
- Check for CSS specificity conflicts
- Ensure viewport meta tag is present

### Animation janky?
- Reduce backdrop-filter on low-end devices
- Use `will-change: transform` on content
- Check for layout thrashing in JavaScript

## Best Practices

1. **Keep modals accessible** - Always include proper labels and ARIA attributes
2. **Keep modals focused** - One primary action per modal
3. **Avoid nested modals** - Use a single modal hierarchy
4. **Mobile first** - Design for mobile, then enhance for desktop
5. **Test in dark mode** - Verify all modals work in both light/dark modes
6. **Keyboard navigation** - Ensure TAB key works correctly
7. **Loading states** - Show feedback for long operations
8. **Error handling** - Display clear error messages

## Conclusion

The unified modal system provides a consistent, maintainable, and accessible way to display modal dialogs across your application. All modals automatically benefit from the same design language, animations, responsiveness, and dark mode support.
