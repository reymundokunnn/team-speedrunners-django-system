## 🚨 Critical Git Workflow Policy (READ THIS BEFORE PUSHING)

This project is shared by multiple developers. Because of that, **keeping your local copy in sync with the repository is not optional — it is required**.

Failure to follow the correct workflow has already caused **real problems in this project**, including broken parts of the web app and **loss of newly developed features**. This section explains exactly what you must do and what to do if conflicts happen.

---

## 🔁 Required Workflow (Do This Every Time)

Before you push any code, you MUST follow these steps in order:

### 1. Pull the latest changes before starting any work

```
git pull origin main
```

---

### 2. Make your changes locally

Work on your feature, fix, or update as needed.

---

### 3. Pull AGAIN before pushing (THIS IS THE MOST IMPORTANT STEP)

```
git pull origin main
```

---

### 4. If conflicts appear, resolve them properly (see guide below)

---

### 5. Push your changes

```
git push origin main
```

---

## ⚠️ What Happens If You Skip These Steps

This is not theoretical — **THE FOLLOWING ALREADY HAPPENED IN THIS PROJECT**:

* Parts of the web app broke
* Newly added features were lost
* Other developers’ work was overwritten
* The app became inconsistent and unstable

---

## ❗ When a Merge Conflict Happens

A conflict happens when:

* You changed a file
* Someone else also changed the same part of that file
* Git cannot decide which version to keep

You will see something like this in your files:

```
\<<<<<<< HEAD
your code
=======
incoming code
\>>>>>>> branch-name
```

---

## 🛠 How to Resolve Conflicts

You have **three main options**, depending on what you want:

---

### ✅ Option 1: Keep the NEW incoming code (discard your changes)

Use this if:

* Your changes are not important
* The other developer’s version is the correct one

Steps:

```
git checkout --theirs .
git add .
git commit -m "Resolved conflicts by keeping incoming changes"
```

---

### ✅ Option 2: Keep YOUR current code (ignore incoming changes)

Use this if:

* You are sure your version is correct
* You want to override what was pulled

Steps:

```
git checkout --ours .
git add .
git commit -m "Resolved conflicts by keeping local changes"
```

---

### ✅ Option 3: Manually merge both (MOST COMMON and SAFEST)

Use this if:

* Both versions are important
* You need to combine changes

Steps:

1. Open the conflicted file

2. Look for:

   ```
   <<<<<<< HEAD
   your code
   =======
   incoming code
   >>>>>>> branch-name
   ```

3. Edit the file:

   * Remove the markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   * Combine or choose the correct code

4. Then run:

```
git add .
git commit -m "Manually resolved merge conflicts"
```

---

## ⚠️ Important Notes When Resolving Conflicts

* NEVER leave conflict markers in the code
* ALWAYS test the app after resolving conflicts
* If unsure, ask before pushing
* Do not randomly delete code just to fix the conflict quickly

---

## 🧠 Why Pulling Twice Is Necessary

Even if you pulled at the start:

* Other developers may have pushed changes while you were working

The second pull:

* Syncs your work again
* Prevents overwriting others
* Reduces risk of breaking the app

---

## ✅ Golden Rule

**PULL → CODE → PULL → RESOLVE (if needed) → PUSH**

Never skip the second pull.

---

## 📌 Final Reminder

This is a **required workflow**, not a suggestion.

We have already experienced:

* Broken features
* Lost work
* Time wasted fixing avoidable issues

All because of skipping simple Git steps.

**Please follow this process every time to protect the project and everyone’s work.**

~ Reymundo (reymundokunnn)