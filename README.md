# Presenta 

A student-friendly design commission service web app.
---

## 🚨 Required Git Workflow (Must Be Followed)

To keep the project stable and avoid breaking each other’s work, **everyone is expected to strictly follow this Git workflow** when making changes.

This is not optional. Skipping steps here has already caused real issues in the project.

---

## 🔁 Standard Workflow

Before pushing any changes, ALWAYS follow this exact sequence:

1. Pull the latest changes from the main branch:

   ```
   git pull origin main
   ```

2. Make your changes locally

3. Pull again **right before pushing**:

   ```
   git pull origin main
   ```

4. If there are conflicts, resolve them properly before continuing

5. Only after everything is up to date, push your changes:

   ```
   git push origin main
   ```

---

## ⚠️ Why This Is Important

Git does not automatically protect you from overwriting or conflicting with other people’s work.

If you skip pulling the latest changes, especially the second pull before pushing, you may:

* Override or erase someone else’s recent work
* Introduce merge conflicts into the main branch
* Break features that were already working
* Cause unexpected bugs that are hard to trace
* Force other team members to spend time fixing avoidable issues

Even small changes can cause big problems if the repository is not up to date.

---

## ❗ This Has Already Caused Problems

We have already experienced parts of the project breaking because this workflow was not followed.

Changes were pushed without pulling the latest updates, which resulted in conflicts and broken functionality.

This is exactly what we are trying to prevent.

---

## 🧠 Golden Rule

> **PULL → CODE → PULL → PUSH**

The second `git pull` is critical.
Do not skip it, even if you think nothing has changed.

---

## 🛑 Before You Push

Before running `git push`, always pause and check:

* Did I pull before starting my work?
* Did I pull again just now before pushing?
* Is my branch fully up to date?

If the answer to any of these is **no**, fix it first before pushing.

---

## 🤝 Team Responsibility

Everyone working on this repository shares responsibility for keeping it stable.

Following this workflow:

* Prevents unnecessary conflicts
* Saves time for the whole team
* Keeps the codebase clean and working

Not following it affects others, not just your own work.

---

## ✅ Summary

Always remember:

> **PULL → CODE → PULL → PUSH**

No exceptions.

---

Thank you for following this — it helps keep the project running smoothly for everyone.
