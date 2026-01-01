# Vision: GitHub-Driven Development

> 🔮 Seeing the future

**Code and specs in synergy, with GitHub as the living source of truth.**

## The Core Idea

A living relationship between code and specifications. Not documentation that gets stale. Not tickets that drift from reality. But a **synergy** where code and specs flow together.

## How It Works

### 1. Code References GitHub Issues
- Code points to GitHub issues using `@spec #123`
- Optional path context for clarity: `@spec #123 (profile/view)`
- Natural, inline references - like comments that actually mean something
- The connection is alive, not just metadata
- GitHub handles unique IDs, no collision issues

### 2. Scheduled AI Verification
- AI runs periodically (or on-demand)
- Reads GitHub issues and finds related code via `@spec` references
- Compares what the code does vs what the issue spec says
- Updates checkboxes in issue descriptions
- Identifies drift: "Code does X, but spec says Y"

### 3. AI-Suggested Reconciliation
- When mismatches are found, AI asks: "Should we update the issue or the code?"
- Not just detection - actual suggestions and changes
- Can modify code OR update issue description, not just one direction
- Comments on the issue with findings
- Bidirectional truth

### 4. Natural Language Interface
- Talk to Claude in natural language
- No explicit agent names, no tool mentions
- Just describe what you want, the system figures out how
- "Check if authentication matches issue #45"
- "Update the login flow to match the latest requirements in #46"
- "What code implements #123?"
- "Are there any unimplemented checkboxes in #124?"

## The Philosophy

**Creation needs freedom.**

We can't let protocols and rigid structures kill creative power. The system should:
- Adapt to how you think, not force you to think in its terms
- Be present but invisible
- Support, not constrain
- Flow with your process, not interrupt it

## Why This Matters

Right now, there's always drift:
- Code gets ahead of specs
- Specs get ahead of code
- Comments lie
- Documentation rots
- Reality diverges from intention

**GitHub-Driven Development** creates **living specifications** that breathe with the codebase:
- Specs live in GitHub issues (collaborative, discussable)
- Code references issues via `@spec #123`
- AI verifies alignment and updates checkboxes
- Everything stays in sync automatically

## Open Questions

- How do we structure issue descriptions for optimal AI verification?
- What's the right frequency for AI verification?
- Should we use Issues (closable tasks) or Discussions (evolving specs)?
- How do we avoid over-constraining while maintaining clarity?
- What's the balance between structure and freedom?
- Should AI auto-update checkboxes or just suggest changes?

---

*This is a vision document. It's meant to provoke thought, not prescribe implementation. The best ideas emerge from exploration, not rigid plans.*
