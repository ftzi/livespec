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

**Specs that prove themselves.**

Traditional docs live in external tools, get stale the moment they're written, and the effort to maintain them is wasted. Tests might exist but verifying they cover all expected behaviors is manual and impractical.

Livespec brings Spec-Driven Development (SDD) with Behavior-Driven Development (BDD) scenarios to AI coding. Every behavior is a spec. Every spec has tests linked with `@spec` tags. **One command — `/livespec` — finds and fixes specs without tests, features without specs, and drift between code and specs**, guiding you through decisions when needed.

Your AI writes plans for complex tasks, specs, code, and tests. You approve. The system proves they work.

**Designed for both humans and AI.** Just naturally talk to your AI. No complex workflows, commands, or config to learn. Coded something yourself? `/livespec` catches up, or your AI updates specs when it notices drift.

**Specs are also AI context.** No need to re-explain what's already documented. Specs get automatically updated if info is outdated or missing.

**Language agnostic.** Works with any codebase, any language.

Inspired by [OpenSpec](https://github.com/Fission-AI/OpenSpec).

---

## 🔄 How It Works

### Building Features

<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/ftzi/livespec/main/assets/building-features.svg" width="200" alt="Building Features workflow" />
</p>
<br/>

### Keeping Specs & Code in Sync (`/livespec`)

<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/ftzi/livespec/main/assets/livespec-sync.svg" width="700" alt="Livespec Sync workflow" />
</p>
<br/>

---

## 🚀 Quick Start

Works with **Claude Code**, **Cursor**, **Windsurf**, and **GitHub Copilot**. [Request others](https://github.com/ftzi/livespec/issues).

**Prerequisites:** [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/). **For JS/TS projects, Bun is recommended for its faster integrated tests.**

```bash
npx livespec  # or: bunx livespec, pnpm dlx livespec, yarn dlx livespec
```

This sets up **livespec** files in your project. As instructed, run `/livespec` with your AI to populate generated files using your project information and optionally generate initial specs for your codebase.

Now just naturally ask your AI to build features. It will create feature plans for non-trivial tasks, update specs, and create and link tests. Run `/livespec` anytime to sync and verify everything is aligned.

> [!TIP]
> **Updating:** `npx livespec` can also be used to update livespec in your project to the latest version.

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

---

## 📖 Full Reference

See [`livespec/livespec.md`](./templates/livespec.md) for entry points, design decisions, test types, and more.

---

## 🤝 Contributing

Contributions and suggestions are very welcome! [Open an issue](https://github.com/ftzi/livespec/issues) or submit a PR.

---

## 🌟 Showcase

Have a project, video, or blog post using Livespec? [Open an issue](https://github.com/ftzi/livespec/issues) to get it featured here!
