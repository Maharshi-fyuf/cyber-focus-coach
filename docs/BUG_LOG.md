# Bug Log
## Cyber Focus Coach

All bugs are recorded here. Never delete entries.

---

## Template

```
## BUG-XXX: [Short Description]

**ID:** BUG-XXX  
**Date:** YYYY-MM-DD  
**Severity:** Critical | High | Medium | Low  
**Status:** Open | Resolved | Won't Fix

### Description
What happened?

### Steps to Reproduce
1.
2.
3.

### Root Cause
Why did it happen?

### Resolution
How was it fixed?

### Prevention
What process or code change prevents recurrence?

### Files Affected
- file.ts

### Related Commits
- abc1234
```

---

## BUG-001: Python PATH Broken — py Launcher Points to Missing Executable

**ID:** BUG-001  
**Date:** 2026-07-20  
**Severity:** Medium (blocks Python usage, not blocking Node.js work)  
**Status:** Open — deferred (non-blocking for Milestone 1 Node.js build)

### Description
Running `py --version` produces: `Unable to create process using 'python3.15t.exe': The system cannot find the file specified`. The py launcher (Windows Python launcher) is configured to use Python 3.15 as the default, but the Python 3.15 installation is an experimental free-threaded build missing the standard `python.exe` executable.

### Root Cause
Two Python installations are present:
- Python 3.13: `AppData\Local\Programs\Python\Python313` — has Scripts and DLLs but **no python.exe in root**
- Python 3.15: Experimental free-threaded build — executable is named `python3.15t.exe`, not `python.exe`

The py launcher's default points to 3.15t, which doesn't exist at the expected path.

### Resolution
Install clean Python 3.13 from python.org (official installer, not Microsoft Store or Anaconda). Check "Add to PATH" during installation.

### Prevention
Always install Python from python.org using the official installer. Verify with `python --version` immediately after install.

### Files Affected
- None (environment issue, not code)
