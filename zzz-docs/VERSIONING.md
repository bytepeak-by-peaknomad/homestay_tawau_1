# Versioning & Undo Guide

Every change we make is saved as a **commit** — a numbered version you can go back to. This file is the quick reference for that workflow.

## The idea

- Work in small steps, commit often.
- One commit = one change, with a clear label.
- If you don't like a change, undo that one commit (nothing is lost by hand).

## Workflow

1. I (or you) make a change.
2. Review it, then commit it:
   ```
   git add -A
   git commit -m "describe the change"

   git push  #if want to push to main already
   ```
3. Repeat. Each commit is a new version.

> `git add -A` stages all changed/new files. Your `.env.local` is ignored, so
> secrets (`DATABASE_URL`, `ADMIN_SECRET`) are never committed.

## Seeing your versions

```
git log --oneline
```

Shows a list like:

```
c3f2b1a add invite-code review system
b841e9e Initial commit
```

The left column (`c3f2b1a`) is the version id.

## Undoing a change

| You want to... | Command |
| --- | --- |
| Undo the **latest** commit | `git revert HEAD` |
| Undo a specific older commit | `git revert <version-id>` |
| Throw away uncommitted changes | `git checkout -- .` (or `git restore .`) |
| Go back to an old version (permanent) | `git reset --hard <version-id>` |

- **`git revert`** is the safe one: it undoes a change *and keeps history*, so you can always come back.
- **`git reset --hard`** rewinds to an old version and deletes everything after it. Use it only when you're sure.

## Tagging milestones (optional)

Give important versions a friendly name:

```
git tag v1
git tag v2
```

Later you can jump back with `git checkout v1`.

## Rule of thumb

Commit **before** starting a new change so there's always a clean "last good version" to return to. I won't commit automatically — tell me when to do it.
