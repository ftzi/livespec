# ‼️ STILL WIP! ALMOST RELEASING IT! 🏗️

<br/>
<br/>
<br/>
<p align="center">
  <img src="logo.svg"  width="400" alt="Livespec logo">
</p>
<br/>
<p align="center">
  <strong>Next-gen spec-driven development.</strong><br>
  Specifications that evolve with your code. Documentation that stays true.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ftzi/livespec"><img src="https://img.shields.io/npm/v/@ftzi/livespec" alt="npm version"></a>
  <a href="https://github.com/ftzi/livespec/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@ftzi/livespec" alt="license"></a>
</p>
<br/>


## 💡 The Idea

Livespec ensures your software works as intended. Requirements from stakeholders become specs, specs become tests, tests prove the system behaves correctly.

Your AI reads specs before coding, implements what's specified, and validates that tests prove every scenario. When stakeholders ask "does it do X?" — the spec and its passing tests are the answer.

### Why specs matter

**Specs define what your software should do.** Not how it's currently implemented — how it *should* behave. When every feature has a spec, you have a complete picture of your system's intended behavior.

**Tests prove specs are true.** A scenario without a test is just a wish. When tests pass, the spec is real. When they fail, something needs fixing — the code or the spec.

**Tests enable speed.** This isn't bureaucracy. Comprehensive tests let you move fast without breaking things. Refactor fearlessly. Ship confidently. The test suite is your safety net.

**Context lives with behavior.** Why was this decision made? What problem does this solve? The rationale lives in the spec, not in someone's head or a lost Slack thread.

---

## 🚀 Quick Start

```bash
npx @ftzi/livespec  # or: bunx, pnpm dlx, yarn dlx
```

This scaffolds the `livespec/` directory and adds commands for your AI tools (Claude Code, Cursor, Copilot, Windsurf).

Then just talk to your AI assistant:

```
Add user authentication with email and password
```

It reads existing specs, creates a plan, implements code, updates specs, links tests. No special commands needed.

> **Updating:** Run `npx @ftzi/livespec@latest` (or bunx, pnpm dlx, yarn dlx) and select "Update base files" to get the latest AI instructions.

---

## 📁 Structure

```
livespec/
├── livespec.md              # AI instructions
├── projects/
│   └── my-app/
│       ├── project.md       # Domain knowledge, conventions
│       └── auth/
│           └── spec.md      # Feature spec with scenarios
└── plans/
    ├── active/              # Work in progress
    └── archived/            # Completed plans
```

---

## 📝 Spec Format

Specs combine context with testable scenarios:

```markdown
# Authentication [APP.auth]

User authentication for the application.

## Entry Points

| Route     | Description       |
| --------- | ----------------- |
| /login    | Login page        |
| /register | Registration page |

---

## Login [APP.auth.login]

### Scenario: Successful login [APP.auth.login.success]

Testing: unit

- WHEN user enters valid credentials
- AND clicks submit
- THEN user is redirected to dashboard
```

Tests reference specs with `@spec`:

```typescript
/** @spec [APP.auth.login.success] */
it('redirects to dashboard after login', () => {
  // ...
})
```

`Sync` finds scenarios without tests, tests without specs, and drift between what's documented and what's real.

---

## ⚡ Commands

Optional commands for explicit operations:

- `/livespec` — Check status, see active plans
- `/livespec-sync` — Validate specs, check coverage, ensure everything is in order
