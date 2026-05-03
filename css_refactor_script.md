# CSS Refactoring Script - styles.css
## File: /home/reymundo/Desktop/team-speedrunners-django-system/static/css/styles.css
## Total Lines: 16508
## Date: 2026-05-02

---

## EXECUTIVE SUMMARY

This script identifies and resolves all CSS selector conflicts in styles.css. 
The approach follows these principles:
1. Keep the MOST COMPLETE version of each conflicting selector
2. Add missing properties to incomplete versions  
3. Remove truly duplicate definitions
4. No HTML template changes needed (class names remain the same)

---

## PRIORITY GROUPING

### PRIORITY 1 (CRITICAL) - Duplicate Selectors Breaking Specificity
**Issue**: Multiple definitions of the same selector cause unpredictable cascade behavior

#### 1.1 `.header-search` - EXACT DUPLICATE
- **Lines**: 783-788 and 790-795
- **Issue**: Lines 790-795 are exact duplicate of lines 783-788
- **Action**: DELETE lines 790-795

**CURRENT:**
```css
783: .header-search {
784:     position: relative;
785:     display: flex;
786:     align-items: center;
787:     width: 100%;
788: }
789: 
790: .header-search {
791:     position: relative;
792:     display: flex;
793:     align-items: center;
794:     width: 100%;
795: }
```

**FIX:**
```css
783: .header-search {
784:     position: relative;
785:     display: flex;
786:     align-items: center;
787:     width: 100%;
788: }
789: 
790: [DELETED - Duplicate]
```

**Edit Command:**
```
Delete lines 790-795 (the duplicate .header-search block)
```

---

#### 1.2 `.modal-body` - INCOMPLETE VERSIONS
- **Lines**: 1195-1199, 1391-1393, 5131-5133
- **Issue**: Line 1195 has `overflow-y: auto` and `flex: 1`. Lines 1391 and 5131 are missing these critical properties
- **Action**: ADD missing properties to lines 1391 and 5131

**CURRENT Line 1195 (MOST COMPLETE - KEEP as canonical):**
```css
1195: .modal-body {
1196:     padding: 20px 24px;
1197:     overflow-y: auto;
1198:     flex: 1;
1199: }
```

**CURRENT Line 1391 (MISSING overflow-y and flex):**
```css
1391: .modal-body {
1392:     padding: 20px 24px;
1393: }
```

**CURRENT Line 5131 (MISSING overflow-y and flex):**
```css
5131: .modal-body {
5132:     padding: 20px 24px;
5133: }
```

**FIX:** Replace lines 1391-1393 with complete version, DELETE line 5131-5133 (redundant in media query context)

**Edit for lines 1391-1393:**
```css
1391: .modal-body {
1392:     padding: 20px 24px;
1393:     overflow-y: auto;
1394:     flex: 1;
1395: }
```

**Edit for lines 5131-5133:**
```css
[DELETE lines 5131-5133 - redundant duplicate in media query section]
```

---

#### 1.3 `.modal-actions` - MISSING margin-top
- **Lines**: 1202-1206, 4315-4319, 5304-5309
- **Issue**: Lines 1202 and 5304 missing `margin-top`. Line 4315 has `margin-top: 20px`
- **Action**: ADD `margin-top: 20px` to lines 1202 and 5304 (most complete version)

**CURRENT Line 1202 (MISSING margin-top):**
```css
1202: .modal-actions {
1203:     display: flex;
1204:     gap: 12px;
1205:     justify-content: flex-end;
1206: }
```

**CURRENT Line 4315 (HAS margin-top):**
```css
4315: .modal-actions {
4316:     display: flex;
4317:     gap: 12px;
4318:     justify-content: flex-end;
4319:     margin-top: 20px;
4320: }
```

**CURRENT Line 5304 (MISSING margin-top):**
```css
5304: .modal-actions {
5305:     display: flex;
5306:     gap: 15px;
5307:     justify-content: space-between;
5308:     margin-top: 15px;
5309: }
```

**NOTE**: Line 5304 ALREADY HAS margin-top: 15px. Line 1202 is the one missing it.

**FIX:**
- **Line 1202-1206**: ADD `margin-top: 20px;` 
- **Line 4315-4320**: DELETE (redundant - same as updated 1202 but context-specific, KEEP for specificity)
- **Line 5304-5309**: KEEP (has unique justify-content: space-between)

**Edit for lines 1202-1206:**
```css
1202: .modal-actions {
1203:     display: flex;
1204:     gap: 12px;
1205:     justify-content: flex-end;
1206:     margin-top: 20px;
1207: }
```

**Edit for lines 4315-4320:**
```css
[DELETE lines 4315-4320 - redundant with updated line 1202]
```

---

### PRIORITY 2 (HIGH) - .btn Conflicting Base Styles
**Issue**: Two base `.btn` definitions with different styles - causes inconsistent button rendering

#### 2.1 `.btn` - CONFLICTING VERSIONS
- **Line 2166**: Complete version with background, hover effects, flex properties
- **Line 3928**: Minimal version, different padding/border-radius
- **Issue**: Which one is canonical? Line 2166 has more complete styling including hover states

**CURRENT Line 2166 (MOST COMPLETE - KEEP):**
```css
2166: .btn {
2167:     padding: 12px 20px;
2168:     border-radius: 10px;
2169:     background-color: #e87f14;
2170:     color: white;
2171:     font-weight: 700;
2172:     border: none;
2173:     font-size: clamp(0.9rem, 1.5vw, 1rem);
2174:     cursor: pointer;
2175:     transition: all 0.3s ease;
2176:     position: relative;
2177:     overflow: hidden;
2178:     display: flex;
2179:     align-items: center;
2180:     justify-content: center;
2181:     gap: 10px;
2182: }
```

**CURRENT Line 3928 (INCOMPLETE - PROBLEMATIC):**
```css
3928: .btn {
3929:     padding: 12px 24px;
3930:     border: none;
3931:     border-radius: 8px;
3932:     font-weight: 600;
3933:     cursor: pointer;
3934:     transition: all 0.3s ease;
3935:     font-size: 0.95rem;
3936: }
```

**PROBLEM**: Line 3928 overrides the canonical .btn with:
- Different padding (12px 24px vs 12px 20px)
- Different border-radius (8px vs 10px)
- Missing background-color (makes buttons invisible!)
- Missing color (text becomes invisible on white background!)
- Missing flex properties
- Missing hover effects
- Different font-weight (600 vs 700)
- Uses fixed font-size vs clamp()

**FIX OPTIONS:**
1. Merge: Update line 3928's parent container to use the complete .btn styles
2. Replace: Change line 3928 block to NOT redefine .btn (use more specific selector)

**RECOMMENDATION**: The section at lines 3928-3941 is likely a FORM-SPECIFIC button style. 
Instead of redefining `.btn`, create `.form-actions .btn` or similar.

**Current context (lines 3921-3947):**
```css
3921: .step-actions {
3922:     display: flex;
3923:     justify-content: space-between;
3924:     margin-top: 30px;
3925:     gap: 15px;
3926: }
3927: 
3928: .btn {  /* BAD: Overrides base .btn */
3929:     padding: 12px 24px;
...
3936: }
3937: 
3938: .btn:disabled {
3939:     opacity: 0.5;
3940:     cursor: not-allowed;
3941: }
3942: 
3943: .btn-prev {
3944:     background-color: #6c757d;
...
```

**FIX**: Change line 3928 from `.btn` to `.step-actions .btn` (scoped to this context)

```css
3928: .step-actions .btn {
3929:     padding: 12px 24px;
3930:     border: none;
3931:     border-radius: 8px;
3932:     font-weight: 600;
3933:     cursor: pointer;
3934:     transition: all 0.3s ease;
3935:     font-size: 0.95rem;
3936:     background-color: #e87f14;  /* ADD: was missing! */
3937:     color: white;              /* ADD: was missing! */
3938:     font-weight: 700;          /* UPDATE: was 600 */
3939: }
3940: 
3941: .step-actions .btn:disabled {
3942:     opacity: 0.5;
3943:     cursor: not-allowed;
3944: }
```

---

### PRIORITY 3 (MEDIUM) - Profile Container Conflicts

#### 3.1 `.profile-container` - DIFFERENT PADDING/POSITION
- **Line 12463**: Standard profile layout
- **Line 13528**: Profile cover page variant
- **Issue**: Two different layouts for different profile pages

**CURRENT Line 12463:**
```css
12463: .profile-container {
12464:     max-width: 1200px;
12465:     margin: 0 auto;
12466:     padding: 60px 20px 30px;
12467: }
```

**CURRENT Line 13528:**
```css
13528: .profile-container {
13529:     max-width: 1200px;
13530:     margin: 0 auto;
13531:     padding: 80px 20px 40px;
13532:     position: relative;
13533: }
```

**ANALYSIS**: These are for DIFFERENT profile layouts:
- Line 12463: Basic profile (no cover image)
- Line 13528: Enhanced profile WITH cover banner (has `position: relative` for cover positioning)

**RECOMMENDATION**: KEEP BOTH - they serve different layout contexts. 
The second (13528) is used with `.profile-cover` element that needs relative positioning.

**NO ACTION NEEDED** - These are context-specific variants.

---

#### 3.2 `.profile-actions` - DIFFERENT PADDING/GAP
- **Line 12617**: Profile detail header actions
- **Line 13894**: Profile actions (enhanced)
- **Issue**: Different spacing values

**CURRENT Line 12617:**
```css
12617: .profile-actions {
12618:     display: flex;
12619:     gap: 8px;
12620:     flex-wrap: wrap;
12621:     justify-content: center;
12622: }
```

**CURRENT Line 13894:**
```css
13894: .profile-actions {
13895:     display: flex;
13896:     gap: 12px;
13897:     flex-wrap: wrap;
13898:     padding-top: 8px;
13899: }
```

**ANALYSIS**: 
- Line 12617: Used in profile header (centered, tighter gap)
- Line 13894: Used in profile edit/social section (more gap, has padding-top)
- Both have different purposes

**RECOMMENDATION**: These serve different layout contexts. 
Line 12617 is more compact for profile headers.
Line 13894 has more breathing room for action buttons.

**NO ACTION NEEDED** - Context-specific styling is appropriate here.

---

### PRIORITY 4 (LOW) - Form Actions

#### 4.1 `.form-actions` - SINGLE DEFINITION (NO CONFLICT)
- **Line 5658**: Only one base definition
- **Note**: Has responsive overrides in media queries (lines 5759, 6081, 6228)

**CURRENT Line 5658-5665:**
```css
5658: .form-actions {
5659:     display: flex;
5660:     gap: 15px;
5661:     margin-top: 20px;
5662:     padding-top: 20px;
5663:     border-top: 1px solid #efefef;
5664:     justify-content: flex-end;
5665: }
```

**ANALYSIS**: This is the canonical form-actions definition. Media query overrides are appropriate for responsive behavior.

**NO ACTION NEEDED** - No conflicts, properly structured.

---

## HTML TEMPLATE IMPACT ANALYSIS

### Classes Used in Templates:

#### 1. `.modal-body` - USED IN:
- `/templates/dashboard/designer_dashboard.html` (line 405)
- `/templates/dashboard/user_dashboard.html` (line 1048)
- `/templates/dashboard/admin_dashboard.html` (line 760)
- `/templates/profile.html` (lines 569, 595, 724, 751, 777)
- `/templates/chat.html` (lines 2101, 2127, 2156)
- `/templates/partials/header.html` (line 326)

**IMPACT**: Adding `overflow-y: auto` and `flex: 1` ensures modals properly handle content overflow.
**NO HTML CHANGES NEEDED** - Pure CSS fix improves existing modals.

#### 2. `.modal-actions` - USED IN:
- `/templates/dashboard/designer_dashboard.html` (line with id="modalActions")
- `/templates/dashboard/user_dashboard.html` (multiple uses)
- `/templates/dashboard/admin_dashboard.html` (multiple uses)
- `/templates/profile.html` (multiple modal-actions divs)
- `/templates/signin.html` (line with modal-actions)

**IMPACT**: Adding `margin-top: 20px` provides consistent spacing above action buttons.
**NO HTML CHANGES NEEDED** - Pure CSS improvement.

#### 3. `.btn` - USED IN:
- `/templates/settings/unified_settings.html` (zoom/rotate/crop buttons use `class="btn btn-secondary btn-icon"`)
- `/templates/settings/unified_settings.html` (apply/cancel buttons use `class="btn btn-primary"` and `class="btn btn-secondary"`)
- Various other template locations

**IMPACT**: Fixing the line 3928 conflict prevents button styling from breaking on form pages.
**NO HTML CHANGES NEEDED** - Scoping the override fixes the issue.

#### 4. `.profile-container` - USED IN:
- `/templates/profile.html` (line with class="profile-container")

**IMPACT**: None - both definitions serve different profile page variants.

#### 5. `.profile-actions` - **NOT USED IN ANY TEMPLATE**
- Defined in CSS but no template usage found
- May be vestigial or used via JavaScript

**IMPACT**: None - CSS definitions don't affect existing UI.

#### 6. `.header-search` - **DUPLICATE ONLY**
- No functional impact, just wasted bytes

**IMPACT**: Removing duplicate reduces file size, no visual change.

---

## IMPLEMENTATION SEQUENCE

### Phase 1: Critical Fixes (Apply Immediately)
1. **Remove `.header-search` duplicate** (lines 790-795)
2. **Fix `.modal-body` incomplete definitions** (add overflow-y:auto and flex:1 to line 1391, delete line 5131-5133)
3. **Fix `.modal-actions` missing margin** (add margin-top:20px to line 1202)

### Phase 2: High Priority (Apply Immediately)
4. **Fix `.btn` override conflict** (scope line 3928 to `.step-actions .btn` and add missing bg/color)

### Phase 3: Cleanup (Optional)
5. **Remove redundant `.modal-actions`** at line 4315-4320 (if not context-critical)
6. **Remove redundant `.modal-body`** at line 5131-5133

---

## DETAILED EDIT COMMANDS

### Edit 1: Remove .header-search duplicate
**File**: static/css/styles.css  
**Lines**: 790-795  
**Action**: DELETE  

```
Delete these 6 lines:
790: .header-search {
791:     position: relative;
792:     display: flex;
793:     align-items: center;
794:     width: 100%;
795: }
```

---

### Edit 2: Fix .modal-body at line 1391
**File**: static/css/styles.css  
**Lines**: 1391-1393  
**Action**: REPLACE  

**Old:**
```css
1391: .modal-body {
1392:     padding: 20px 24px;
1393: }
```

**New:**
```css
1391: .modal-body {
1392:     padding: 20px 24px;
1393:     overflow-y: auto;
1394:     flex: 1;
1395: }
```

---

### Edit 3: Remove redundant .modal-body at line 5131
**File**: static/css/styles.css  
**Lines**: 5131-5133  
**Action**: DELETE  

```
Delete these 3 lines:
5131: .modal-body {
5132:     padding: 20px 24px;
5133: }
```

---

### Edit 4: Add margin-top to .modal-actions at line 1202
**File**: static/css/styles.css  
**Lines**: 1202-1206  
**Action**: REPLACE  

**Old:**
```css
1202: .modal-actions {
1203:     display: flex;
1204:     gap: 12px;
1205:     justify-content: flex-end;
1206: }
```

**New:**
```css
1202: .modal-actions {
1203:     display: flex;
1204:     gap: 12px;
1205:     justify-content: flex-end;
1206:     margin-top: 20px;
1207: }
```

---

### Edit 5: Remove redundant .modal-actions at line 4315
**File**: static/css/styles.css  
**Lines**: 4315-4320  
**Action**: DELETE  

```
Delete these 6 lines:
4315: .modal-actions {
4316:     display: flex;
4317:     gap: 12px;
4318:     justify-content: flex-end;
4319:     margin-top: 20px;
4320: }
```

---

### Edit 6: Fix .btn override at line 3928 (CRITICAL)
**File**: static/css/styles.css  
**Lines**: 3928-3941  
**Action**: REPLACE  

**Old:**
```css
3928: .btn {
3929:     padding: 12px 24px;
3930:     border: none;
3931:     border-radius: 8px;
3932:     font-weight: 600;
3933:     cursor: pointer;
3934:     transition: all 0.3s ease;
3935:     font-size: 0.95rem;
3936: }
3937: 
3938: .btn:disabled {
3939:     opacity: 0.5;
3940:     cursor: not-allowed;
3941: }
```

**New:**
```css
3928: .step-actions .btn {
3929:     padding: 12px 24px;
3930:     border: none;
3931:     border-radius: 8px;
3932:     font-weight: 700;
3933:     cursor: pointer;
3934:     transition: all 0.3s ease;
3935:     font-size: 0.95rem;
3936:     background-color: #e87f14;
3937:     color: white;
3938: }
3939: 
3940: .step-actions .btn:disabled {
3941:     opacity: 0.5;
3942:     cursor: not-allowed;
3943: }
```

---

## VERIFICATION COMMANDS

After applying edits, run:

```bash
# Check no duplicate .header-search
grep -n "^\.header-search {" static/css/styles.css
# Should output only: 783:.header-search {

# Check .modal-body definitions
grep -n "^\.modal-body {" static/css/styles.css
# Should output: 1195, 1391 (and possibly media query variants)
# Should NOT output: 5131

# Check .modal-actions definitions
grep -n "^\.modal-actions {" static/css/styles.css
# Should output: 1202, 5304 (and media query variants)
# Should NOT output: 4315

# Check .btn is not overridden in step-actions context
grep -A5 "^\.step-actions \.btn {" static/css/styles.css
# Should show properly scoped selector

# Validate CSS syntax (if css-validator available)
npm run lint 2>/dev/null || echo "Lint command not configured"
```

---

## SUMMARY OF CHANGES

| Priority | Selector | Lines | Action | Impact |
|----------|----------|-------|--------|--------|
| P1 Crit | .header-search | 790-795 | DELETE | Removes duplicate, no visual change |
| P1 Crit | .modal-body | 1391-1393 | FIX | Adds overflow-y:auto, flex:1 |
| P1 Crit | .modal-body | 5131-5133 | DELETE | Removes redundant def |
| P1 Crit | .modal-actions | 1202-1206 | FIX | Adds margin-top:20px |
| P2 High | .modal-actions | 4315-4320 | DELETE | Removes redundant def |
| P2 High | .btn | 3928-3941 | FIX | Scope to .step-actions .btn, add missing bg/color |

**Total Lines Changed**: ~27 lines  
**HTML Changes Required**: NONE  
**Risk Level**: LOW (all changes are additive or scoping fixes)  

---

## NOTES

- All `.profile-container` and `.profile-actions` definitions are KEPT as they serve different layout contexts
- `.form-actions` has no conflicts - single canonical definition with responsive overrides
- No HTML templates need updating (class names unchanged, only CSS improvements)
- The critical `.btn` override fix prevents invisible buttons on step-action forms
