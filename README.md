## 🚨 Important Git Workflow Rule (READ BEFORE PUSHING)

To avoid breaking the project and losing work, **everyone must follow this workflow every time you push changes**.

### 🔁 Required Steps

1. Pull the latest changes before starting:

   ```
   git pull origin main
   ```

2. Make your changes

3. Pull again before pushing (this step is VERY important):

   ```
   git pull origin main
   ```

4. Then push your changes:

   ```
   git push origin main
   ```

---

### ⚠️ Why this matters

Recently, **some parts of the web app broke and newly added features were lost** because changes were pushed without pulling the latest updates first.

When you skip `git pull`, this can happen:

* You overwrite someone else's work
* New features can disappear
* The app can break without you noticing
* Merge conflicts become harder to fix later
* Time is wasted trying to recover lost code

---

### ❌ What went wrong before

This is not just a reminder — **this already caused real issues in the project**:

* Working features were accidentally removed
* Recent updates from other developers were overwritten
* The app behavior became inconsistent

---

### ✅ Golden Rule

**PULL → CODE → PULL → PUSH**

Never skip the second `git pull`.

---

### 💡 Reminder

If you're unsure whether your branch is up to date, just pull again.
It’s always safer to pull one extra time than to break the project.

---

Following this simple workflow helps protect everyone's work and keeps the project stable.

~ Reymundo (reymundokunnn)