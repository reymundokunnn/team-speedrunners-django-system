## Quick Reference (Do This Every Time)

PULL → CODE → PULL → RESOLVE (if needed) → PUSH

Commands:

```bash
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

### 1. Pull before starting

```bash
git pull origin main
```

### 2. Make your changes

### 3. Pull again before pushing

```bash
git pull origin main
```

### 4. Resolve conflicts (if any)

### 5. Push

```bash
git push origin main
```

---

## What Happens If You Skip These Steps

This has already happened in this project:

* Parts of the web app broke
* Newly added features were lost
* Other developers’ work was overwritten
* The application became unstable

---

## When a Merge Conflict Happens

You will see something like this in your file:

```js
function greet() {
    <<<<<<< HEAD
    return "Hello from my version";
    =======
    return "Hello from teammate version";
    >>>>>>> main
}
```

---

## How to Visualize the Conflict

Think of it like this:

```text
<<<<<<< HEAD        ← YOUR CODE (local)
your code here
=======             ← separator
incoming code here
>>>>>>> main        ← THEIR CODE (from repo)
```

---

## More Real Examples

### Example 1: Variable change

```js
    let apiUrl = "http://localhost:3000";   // your version
    =======
    let apiUrl = "https://api.production.com"; // incoming version
    >>>>>>> main
```

---

### Example 2: Function update

```js
function calculateTotal(price, tax) {
    <<<<<<< HEAD
    return price + tax;
    =======
    return price + tax + 10; // added service fee
    >>>>>>> main
}
```

---

### Example 3: UI text change

```html
<h1>
    <<<<<<< HEAD
    Welcome User
    =======
    Welcome Back, User
    >>>>>>> main
</h1>
```

---

## Option A: Keep Incoming Code Only

```bash
git checkout --theirs .
git add .
git commit -m "Keep incoming changes"
```

---

## Option B: Keep Your Code Only

```bash
git checkout --ours .
git add .
git commit -m "Keep local changes"
```

---

## Option C: Manually Merge (Recommended)

### Step-by-step

#### 1. Find the conflict

```js
function greet() {
    <<<<<<< HEAD
    return "Hello from my version";
    =======
    return "Hello from teammate version";
    >>>>>>> main
}
```

---

#### 2. Choose the final result

**Option: keep yours**

```js
function greet() {
  return "Hello from my version";
}
```

**Option: keep theirs**

```js
function greet() {
  return "Hello from teammate version";
}
```

**Option: combine both**

```js
function greet() {
  return "Hello from my version and teammate version";
}
```

---

#### 3. Remove ALL markers

Make sure these are completely deleted:

```text
    <<<<<<< HEAD
    =======
    >>>>>>> main
```

---

#### 4. Mark resolved

```bash
git add .
```

---

#### 5. Commit

```bash
git commit -m "Manually resolved conflicts"
```

---

## Important Rules

* Never leave `<<<<<<<`, `=======`, or `>>>>>>>` in the code
* Always read both versions before deciding
* Do not delete code blindly
* Test the app after resolving
* Ask if unsure

---

## Final Reminder

This is a required workflow.

We already experienced:

* Broken features
* Lost work
* Time wasted fixing avoidable issues

All caused by skipping basic Git steps.

Follow this process every time.
