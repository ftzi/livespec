# Vision: GitHub-Driven Development

> Thinking through how to organize code-spec synergy with GitHub as the source of truth

## The Hierarchy

**Systems** → **Components** → **Domains**

- **System**: A complete feature area (profile, auth, share, payments)
- **Component**: A piece of functionality within a system (view, edit, delete, settings)
- **Domain**: The aspect we're spec'ing (ui, api, marketing, analytics, design)

## Naming Convention

Instead of meaningless IDs like `PROJ-123`, use **semantic, slash-separated paths**:

```
profile                → Root system
profile/view           → Viewing profiles
profile/view/ui        → Frontend for viewing
profile/view/api       → Backend endpoints for viewing
profile/edit           → Editing profiles
profile/marketing      → Marketing materials for profile feature
```

**Why slashes, not dots?**
- Maps directly to file paths
- Natural to expand: `profile` → `profile/edit` → `profile/edit/validation`
- No need to change references when adding depth
- Flexible depth - use what you need

**Examples of flexible depth:**

```
share                  → Simple system, just one file
share/button           → More detail needed
share/button/ui        → Even more specific

auth                   → Root system
auth/login             → Login flow
auth/oauth             → OAuth separately

payments               → Simple at first
payments/stripe        → Later: split by provider
payments/stripe/webhooks → Later: more granular
```

Start shallow, deepen as needed. **The path grows with complexity.**

## File Structure: Mirror the Path

The spec path IS the file path:

```
specs/
  profile.md                  # Simple system, one file

  auth.md                     # Root overview
  auth/
    login.md                  # or auth/login.md
    oauth.md
    session.md

  share/
    button.md                 # or share/button.md
    modal.md
    marketing.md

  payments/
    stripe/
      webhooks.md             # Deep when needed
      subscriptions.md
```

**Key insight: The reference in code IS the file path.**

```typescript
// Spec: profile
export function ProfilePage() { ... }

// Spec: profile/edit
export function ProfileEditForm() { ... }

// Later, we split it:
// Spec: profile/edit/form
// Spec: profile/edit/validation

// The old reference still works! profile/edit can be a directory now
```

**Why this works:**
- `profile/edit` can start as `specs/profile/edit.md`
- Later become `specs/profile/edit/README.md` (or just `edit.md` inside the directory)
- Code references don't break - they're just paths
- File system naturally handles this transition
- Add depth where needed, keep flat where simple

**Example evolution:**

```
# Day 1: Simple
specs/auth.md

# Day 30: Getting complex
specs/auth.md → specs/auth/README.md (or keep the file)
specs/auth/login.md
specs/auth/oauth.md

# Day 90: Very specific
specs/auth/oauth/google.md
specs/auth/oauth/github.md

# Code references:
// Spec: auth          → finds auth.md or auth/README.md
// Spec: auth/login    → finds auth/login.md
// Spec: auth/oauth    → finds auth/oauth.md or auth/oauth/README.md
```

**No breaking changes when adding depth.**

## Spec File Format

Each spec has **both a short code and a full path** for flexible referencing:

```markdown
---
id: PV-001
spec: profile/view
depends-on:
  - profile/view/api
  - auth/session
related-code:
  - apps/web/app/(home)/profile/page.tsx
  - apps/web/components/profile/ProfileView.tsx
last-verified: 2025-11-24
verified-by: ai-housekeeping
---

# Profile View

**Short code:** `PV-001` · **Full path:** `profile/view`

## Purpose
Display user profile information in a clean, accessible layout.

## Requirements

### Display Avatar
- [x] Show user avatar image when available
- [x] Fallback to user initials when no image
- [ ] 120px size on desktop, 80px on mobile
- [x] Rounded circular style

### Display Information
- [x] Username as prominent heading
- [x] Bio text with proper formatting
- [ ] Join date as "Member since {month} {year}"
- [x] Responsive layout (mobile/desktop)

### Interactions
- [x] Show edit button when viewing own profile
- [x] Edit button routes to /profile/edit
- [ ] Show mutual followers count
- [ ] "Report profile" button for other users

## Dependencies
- Needs session data from `auth/session`
- Calls `GET /api/profile/:userId` from `profile/view/api`

## Implementation Notes
*[AI-maintained - updated during verification]*

Last verified: 2025-11-24
- Avatar display working correctly ✓
- Join date not implemented yet - see line 45 in ProfileView.tsx
- Mutual followers feature not started
- Report button pending design approval

## Open Questions
- Should mutual followers show follower avatars or just count?
- Where should report button be positioned?
```

### Checkbox Management

**Who sets checkboxes:**

1. **When writing specs** (human or AI):
   - All new requirements start unchecked: `- [ ]`
   - Natural state = "not done yet"

2. **When implementing features** (developer or AI):
   - Check boxes as requirements are completed: `- [x]`
   - AI implementing code can auto-check related boxes
   - Developer checks manually during implementation

3. **During periodic verification** (scheduled AI):
   - "Housekeeping" AI reads code and updates checkboxes
   - Checks: Does the code actually do what this box says?
   - Unchecks boxes if implementation regressed or was removed
   - Updates `last-verified` timestamp and notes

**Example housekeeping run:**

```
🏠 Housekeeping: Verifying profile/view specs...

📝 profile/view#display-avatar
  ✓ Avatar display - IMPLEMENTED
  ✓ Initials fallback - IMPLEMENTED
  ✗ Responsive sizing - NOT FOUND
    → Code shows fixed 100px, spec says 120px/80px
    → Unchecked box, added note

📝 profile/view#display-information
  ✓ Username heading - IMPLEMENTED
  ✓ Bio formatting - IMPLEMENTED
  ✗ Join date - NOT IMPLEMENTED
    → No date rendering found in code
    → Box already unchecked, confirmed

Updated: 6 checked, 4 unchecked
Last verified: 2025-11-24 14:30
```

**Benefits:**
- **Visual drift detection** - Unchecked boxes = work to do
- **Living status** - Always know what's implemented
- **No separate tracking** - Status lives with the spec
- **Git history** - Track when boxes were checked/unchecked
- **Natural workflow** - Check boxes as you implement

## Key Design Principles

### 1. Dual Reference System
❌ Random IDs only: `PROJ-423`, `TICKET-1829`
✅ Short code + full path: `PR-002` AND `profile/edit`

**Use short codes for quick reference:**
- In conversations: "Can you check PR-002?"
- In commits: "implements AU-015"
- In TODOs: "blocked by SH-003"

**Use full paths for clarity:**
- In code: `@spec profile/edit#validation`
- When self-documentation matters
- For hierarchical understanding

### 2. Variable Depth
Use as many levels as you need, no more:
```
share              # Simple feature, one file
profile/edit       # Two levels
auth/oauth/google  # Three levels when needed
```

### 3. No Breaking Changes When Refactoring
```
# Start simple:
// @spec AU-001 (auth)
function LoginPage() { ... }

# Later, split into multiple specs:
specs/auth.md → specs/auth/README.md
Add: specs/auth/login.md (AU-002), specs/auth/oauth.md (AU-003)

# Short code still works:
// @spec AU-001  (AI knows this is now auth/login)

# Or update to be more specific:
// @spec AU-002 (auth/login)
```

### 4. Cross-Domain by Default
Not just code. A system includes:
- **UI** - Frontend components
- **API** - Backend endpoints
- **Marketing** - Messaging, copy, positioning
- **Analytics** - What we track and why
- **Design** - Visual specs, mockups
- **QA** - Test cases and acceptance criteria

Example:
```
share/button       # The button itself
share/marketing    # How we promote it
share/analytics    # What we track
```

### 5. Flexible, Not Rigid
- Markdown, not schemas
- Optional frontmatter
- Natural language requirements
- AI helps maintain, doesn't enforce
- **Grow complexity only when needed**

## Avoiding Conflicts

**Q: What if two people create `profile/settings` at the same time?**

**A: Path-based naming + file system prevents this:**
- Paths are deterministic based on the feature
- If both are working on profile settings, they're working on the *same* spec
- Git handles merge conflicts like any other file
- If they're actually different things, they should have different paths:
  - `profile/settings` (general settings)
  - `profile/privacy` (privacy-specific settings)

## Relating Code to Specs

**GitHub-Driven Development: Reference GitHub Issues**

Use GitHub issue numbers with optional path context:

```typescript
/**
 * @spec #123
 */
export function ProfileView({ userId }: { userId: string }) {
  // Implements GitHub issue #123 - Profile View
}
```

**With path context for clarity:**
```typescript
/**
 * @spec #123 (profile/view)
 */
export function ProfileView() { ... }
```

**With heading anchor:**
```typescript
/**
 * Displays user avatar with fallback to initials
 * @spec #123 (profile/view#display-avatar)
 * @param user - User object containing avatar URL and name
 */
function Avatar({ user }: { user: User }) {
  // ...
}
```

**Quick inline reference:**
```typescript
// @spec #124
export function ProfileEditForm() { ... }
```

**In discussions/commits:**
```
// TODO: Implement email validation per @spec #124
git commit -m "implements #123 - profile view component"
```

**Why GitHub Issues?**
- **Collision-free IDs**: GitHub assigns unique numbers
- **Already integrated**: Native to your repo
- **Assignment & status**: Built-in workflow
- **Discussion threads**: Comments on issues
- **No extra tools**: `gh` CLI + MCP already available
- **PR linking**: Auto-references in commits
- **Labels**: Can tag systems (label:profile, label:auth)

**Search patterns:**
```bash
# Find all spec references
grep -r "@spec #" .

# Find specific issue
grep -r "@spec #123" .

# Find by path context
grep -r "@spec.*profile/view" .

# Use gh CLI
gh issue list --label spec
gh issue view 123
```

**Benefits:**
- **Native integration**: Already part of GitHub workflow
- **Zero collision**: GitHub handles unique IDs
- **Assignment built-in**: Issues have assignees
- **Discussion natural**: Comment threads on issues
- **Status tracking**: Open/closed + custom labels
- **Self-documenting**: Optional path hints in code for context

**In the spec file (`specs/profile/view.md`):**
```markdown
# Profile View

## Display Avatar
Shows user avatar with fallback to initials...

## Show Bio
Displays user biography with 500 char limit...
```

**Why heading anchors?**
- One spec file can cover multiple aspects
- Granular references without creating tons of files
- Natural markdown syntax (`path#heading`)
- Like linking to sections in documentation

### Broken Reference Handling

**When a reference breaks:**

```typescript
// @spec PE-002 (profile/edit#email-validation)
// (Section renamed from "Email Validation" to "Email Rules")
```

AI detects the broken reference and:
1. **Looks up spec via short code** (PE-002)
2. **Searches for similar headings** in that spec
   - "Email Rules", "Email Requirements", "Validate Email"
3. **Searches in parent/child specs**
   - `profile/edit/validation#email`
   - `profile#email`
4. **Suggests fixes**
   - "Heading renamed to `#email-rules`"
5. **Auto-fix option**
   - Update code comment to new heading
   - Or update spec heading to match old reference

**Example AI response:**
```
⚠️  Broken Reference Detected
Code: apps/web/components/ProfileForm.tsx:42
Reference: @spec PE-002 (profile/edit#email-validation)

❌ Heading #email-validation not found in specs/profile/edit.md

🔍 Possible matches in PE-002:
  1. #email-rules (similarity: 95%)
  2. #validation-email (similarity: 82%)

💡 Suggested fix:
  - Update code to: @spec PE-002 (profile/edit#email-rules)
  - Or rename heading in spec to: "Email Validation"
```

**In the spec:**
```yaml
related-code:
  - apps/web/components/profile/ProfileView.tsx
  - apps/web/app/(home)/profile/page.tsx
```

**Bidirectional references** let AI find relationships both ways.

The reference is just a path + optional heading - simple, flexible, granular.

## Natural Language Interface

Instead of rigid commands, you talk naturally:

- "Check if the profile view matches its spec"
- "What's different between the share button code and spec?"
- "Update the auth marketing spec with the new messaging"
- "Generate the profile edit form based on its spec"
- "Are there any unimplemented requirements in the payment system?"
- "Find all code that references the profile/edit spec"

The system figures out:
1. Which specs you're talking about
2. What code to examine (uses `@spec:` references)
3. What action to take
4. How to respond

**Behind the scenes**, AI searches for `@spec PE-002` or `@spec profile/edit` to find all related code.

## Open Questions to Explore

1. **Checkbox verification**: How does AI determine if a checkbox should be checked?
2. **Housekeeping frequency**: Daily? On every commit? On-demand only?
3. **Confidence threshold**: When is AI confident enough to auto-check/uncheck boxes?
4. **Conflict resolution**: What if developer checked a box but AI verification says it's not done?
5. **Heading normalization**: How do we convert "Email Validation" to `#email-validation` anchor?
6. **Broken reference detection**: How often should AI check for broken references?
7. **Auto-fix confidence**: When should AI auto-fix vs suggest changes?
8. **Dependencies**: How explicit should we be about dependencies between specs?
9. **Granularity balance**: When to use heading anchors vs split into separate files?
10. **Partial implementation**: How to handle features that are 80% done? Sub-checkboxes?

## The Path Forward

Start simple:
1. Create `specs/` directory
2. Pick one system (e.g., `S-profile`) and experiment with structure
3. Write a few specs in natural markdown
4. Add code comments that reference specs
5. See what emerges from usage
6. Let the structure evolve organically

**No rigid tooling yet.** Let creation flow freely, then notice patterns.

---

*This is exploratory. Structure should emerge from use, not be imposed upfront.*
