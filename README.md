<br/>
<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/ftzi/livespec/main/assets/logo.svg" width="400" alt="Livespec logo">
</p>
<br/>
<p align="center">
  <strong>Living specs for AI-native development.</strong><br>
  Where business rules and code stay in sync.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/livespec"><img src="https://img.shields.io/npm/v/livespec" alt="npm version"></a>
  <a href="https://github.com/ftzi/livespec/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/livespec" alt="license"></a>
  <a href="https://github.com/ftzi/livespec/actions/workflows/ci.yml"><img src="https://github.com/ftzi/livespec/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>
<br/>

## What is Livespec?

Livespec is a living specification framework for AI-native Spec-Driven Development (SDD). Specs evolve with your code and stay in sync. Language agnostic and supports any sort of project.

Livespec ensures your software works as intended. Requirements become specs, specs become tests, tests prove the system behaves correctly. **`/livespec-sync` ensures specs, code and tests are aligned.**

- **Markdown-based specs.** Specs are markdown files that serve as a central hub for your business rules and requirements.
- **Specs are the source of truth.** They document what the system does. If specs and code drift apart, `/livespec-sync` catches it.
- **Tests enforce specs.** Every scenario has tests that validate behavior. Tests reference specs via `@spec` tags for traceability.
- **Decisions documented.** Design rationale and edge cases live in the spec, not in your head.
- **Specs double as AI context.** No need to manually explain what specs already document.

Inspired by [Openspec](https://github.com/Fission-AI/OpenSpec).

---

## 🔄 How It Works

### Building Features

<p align="center">
  <img src="https://raw.githubusercontent.com/ftzi/livespec/main/assets/building-features.svg" width="200" alt="Building Features workflow" />
</p>

### Keeping Specs & Code in Sync (`/livespec-sync`)

<p align="center">
  <img src="https://raw.githubusercontent.com/ftzi/livespec/main/assets/livespec-sync.svg" width="400" alt="Livespec Sync workflow" />
</p>

---

## 🚀 Quick Start

Works with **Claude Code**, **Cursor**, **Windsurf**, and **GitHub Copilot**. [Request others](https://github.com/ftzi/livespec/issues).

**Prerequisites:** [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/). **For JS/TS projects, Bun is recommended for its faster integrated tests.**

```bash
npx livespec  # or: bunx, pnpm dlx, yarn dlx
```

This sets up livespec. Then run `/livespec-setup` with your AI to populate some generated files using your project information and optionally generate initial specs for your codebase.

Now just naturally ask your AI to build features — it will create feature plans for non-trivial tasks, update specs, and create and link tests.

> [!TIP] > **Updating:** The same command can be used to update livespec to the latest version.

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

## 📝 Spec Format (Summary)

Specs document features with testable scenarios:

```markdown
# Authentication [APP.auth]

User authentication for the application.

## UI

### Figma

https://figma.com/file/...

---

## Login [APP.auth.login]

### Scenario: Successful login [APP.auth.login.success]

- WHEN user enters valid credentials
- THEN user is redirected to dashboard
```

Tests link to specs' scenarios with `@spec`:

```typescript
/** @spec [APP.auth.login.success] */
it("redirects to dashboard after login", () => { ... });
```

See the [full reference](./templates/livespec.md) for entry points, design decisions, test types, and more.

---

## ⚡ Commands

Optional commands for explicit operations:

- `/livespec` — Show status, active plans, and suggestions
- `/livespec-setup` — Run after initializing or upgrading livespec to automatically populate .md files and optionally generate initial specs for existing code
- `/livespec-sync` — Keep specs healthy: finds scenarios without tests, tests without specs, and drift between documentation and code

---

## 📖 Full Reference

See [`livespec/livespec.md`](./templates/livespec.md) for the full documentation.

---

## 🤝 Contributing

Contributions and suggestions are very welcome! [Open an issue](https://github.com/ftzi/livespec/issues) or submit a PR.
