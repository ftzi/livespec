<p align="center">
  <img src="https://raw.githubusercontent.com/ftzi/livespec/main/assets/og-image.png" width="600" alt="Livespec - Specs in sync with code and tests">
</p>
<p align="center">
  <strong>Next-gen AI-native development.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/livespec"><img src="https://img.shields.io/npm/v/livespec" alt="npm version"></a>
  <a href="https://github.com/ftzi/livespec/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/livespec" alt="license"></a>
  <a href="https://github.com/ftzi/livespec/actions/workflows/ci.yml"><img src="https://github.com/ftzi/livespec/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>
<br/>

## What is Livespec?

**An AI-native tool that builds projects with living specs and spec-driven tests, while keeping everything in sync and working.**

Project documentation in tools like Notion lives disconnected from the actual code, and gets stale the moment it's written. Without documented behaviors, there's no way to verify tests cover everything they should. Even if all behaviors were documented, manually ensuring test coverage for each would be impractical. Other AI spec tools rely on complex and rigid workflows with multiple commands, and soon enough no longer represent actual code as you won't always use their processes.

Livespec brings Spec-Driven Development (SDD) with Behavior-Driven Development (BDD) scenarios to AI coding, while keeping specs, code, and tests in sync. Every behavior in your project is a spec. Every spec has tests linked with `@spec` tags. Your AI plans complex tasks, writes specs, code, and tests. Linked tests prove specs are valid.

**One command: `/livespec` finds and fixes specs without tests, features without specs, and drift between code and specs**, guiding you through decisions when needed and bringing important insights about your project. Coded something yourself? `/livespec` catches up.

**Designed for both humans and AI.** Just naturally talk to your AI to add or change features. No complex workflows or config to learn. Plans are automatically created for non-trivial tasks.

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

Works with **Claude Code**, **Cursor**, **Windsurf**, **GitHub Copilot**, and **Gemini CLI**. [Request others](https://github.com/ftzi/livespec/issues).

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
├── livespec.md              # Livespec conventions & workflows for AI
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
