## Quick Reference (Do This Every Time)

PULL → CODE → PULL → RESOLVE (if needed) → PUSH

Commands:

```id="l9v3hz"
git pull origin main
# make changes
git pull origin main
# resolve conflicts if any
git push origin main
```

Never skip the second pull.

---

## Critical Git Workflow Policy (READ THIS BEFORE PUSHING)

This project is shared by multiple developers. Because of that, keeping your local copy in sync with the repository is required.

Failure to follow the correct workflow has already caused real problems in this project, including broken parts of the web app and loss of newly developed features. This section explains exactly what you must do and how to properly handle merge conflicts.

---

## Required Workflow (Do This Every Time)

Before you push any code, you MUST follow these steps in order:

### 1. Pull the latest changes before starting any work

```id="0p5hvw"
git pull origin main
```

---

### 2. Make your changes locally

Work on your feature, fix, or update as needed.

---

### 3. Pull AGAIN before pushing (most important step)

```id="l71t0c"
git pull origin main
```

---

### 4. Resolve any conflicts if they appear (see guide below)

---

### 5. Push your changes

```id="f4ot4e"
git push origin main
```

---

## What Happens If You Skip These Steps

This has already happened in this project:

* Parts of the web app broke
* Newly added features were lost
* Other developers’ work was overwritten
* The application became unstable and inconsistent

---

## When a Merge Conflict Happens

A merge conflict happens when:

* You modified a file
* Another developer modified the same part of that file
* Git cannot automatically decide which version to keep

You will see markers like this inside the file:

```id="1l2n6o"
    <<<<<<< HEAD
    your code
    =======
    incoming code
    >>>>>>> branch-name
```

---

## How to Properly Read Conflict Markers

* `<<<<<<< HEAD` → your current local code
* `=======` → separator
* `>>>>>>> branch-name` → incoming code from repository

Simple view:

TOP = your version
BOTTOM = incoming version

---

## Option A: Keep the Incoming Code Only

```id="84lf9p"
git checkout --theirs .
git add .
git commit -m "Resolved conflicts by keeping incoming changes"
```

---

## Option B: Keep Your Current Code Only

```id="xg61l7"
git checkout --ours .
git add .
git commit -m "Resolved conflicts by keeping local changes"
```

---

## Option C: Manually Merge Both Versions (Recommended)

### Step-by-step guide

1. Open the file with conflict markers

Example:

```id="06ztkj"
    <<<<<<< HEAD
    const title = "Old Title";
    =======
    const title = "New Title";
    >>>>>>> main
```

---

2. Decide the final result

Keep one or combine:

```id="q9p7c0"
const title = "New Title";
```

---

3. Remove ALL conflict markers

Delete:

    <<<<<<< HEAD
    * =======
    >>>>>>> main

---

4. Save the file

---

5. Mark as resolved

```id="o9rqhn"
git add .
```

---

6. Commit

```id="wcb0qq"
git commit -m "Manually resolved merge conflicts"
```

---

## Important Rules When Resolving Conflicts

* Never leave conflict markers in the code
* Always review both versions carefully
* Do not delete code blindly
* Test the app after resolving conflicts
* Ask if unsure

---

## Why Pulling Twice Is Required

Even if you pulled at the start, other developers may have pushed changes while you were working.

The second pull:

* Updates your branch again
* Prevents overwriting others’ work
* Reduces the risk of breaking the application

---

## Final Reminder

This is a required workflow for this repository.

We have already experienced:

* Broken functionality
* Lost features
* Wasted time fixing avoidable issues

All of these were caused by skipping basic Git steps.

Following this process protects the project and everyone’s work.
