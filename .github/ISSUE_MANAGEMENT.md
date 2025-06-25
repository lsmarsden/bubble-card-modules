# GitHub Issue Management Setup

This directory contains tools to set up comprehensive GitHub issue management for the bubble-card-modules repository.

## Quick Setup

### 1. Set up GitHub Labels

```bash
npm run setup:github-labels
```

This creates:

- **Module labels**: `module:icon_border_progress`, `module:separator_as_progress_bar`, etc.
- **Type labels**: `type:bug`, `type:feature-request`, `type:documentation`, etc.
- **Priority labels**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- **Status labels**: `status:needs-triage`, `status:ready-for-dev`, `status:in-progress`, etc.
- **Complexity labels**: `complexity:simple`, `complexity:moderate`, `complexity:complex`
- **Community labels**: `good-first-issue`, `help-wanted`, etc.
- **Release labels**: `release:major`, `release:minor`, `release:patch`

### 2. Verify Issue Templates

```bash
npm run setup:issue-templates
```

This verifies the issue templates are in place:

- **Bug Report** - For reporting module bugs with reproducible YAML configs
- **Feature Request** - For suggesting new features
- **Question** - For asking usage questions
- **Documentation** - For documentation improvements

## Usage Examples

### Labeling Issues

When someone reports a bug in the `icon_border_progress` module:

```
Labels: module:icon_border_progress, type:bug, priority:medium, status:needs-triage
```

When someone requests a new feature for the timeline module:

```
Labels: module:separator_as_timeline, type:feature-request, priority:low, status:needs-triage, complexity:moderate
```

When a helper function has a performance issue:

```
Labels: module:helpers, type:performance, priority:high, status:ready-for-dev
```

### Filtering Issues

- All icon_border_progress issues: `label:module:icon_border_progress`
- High priority bugs: `label:type:bug label:priority:high`
- Ready for development: `label:status:ready-for-dev`
- Good first issues: `label:good-first-issue`
- Documentation improvements needed: `label:type:documentation`

### Issue Workflow

1. **New Issue Created** → Auto-labeled with `status:needs-triage`
2. **Maintainer Reviews** → Add module, type, priority labels
3. **Issue Accepted** → Change to `status:ready-for-dev`
4. **Development Starts** → Change to `status:in-progress`
5. **Needs Info** → Change to `status:waiting-for-feedback`
6. **Issue Resolved** → Close with appropriate resolution

## Label Color Scheme

- **Module labels**: Blue (`#0366d6`) - for organization
- **Bug labels**: Red (`#d73a4a`) - for attention
- **Enhancement labels**: Light blue (`#a2eeef`) - for positivity
- **Priority critical**: Dark red (`#b60205`) - for urgency
- **Priority high**: Orange (`#d93f0b`) - for importance
- **Priority medium**: Yellow (`#fbca04`) - for awareness
- **Priority low**: Green (`#0e8a16`) - for calmness
- **Status labels**: Various pastels for workflow stages
- **Community labels**: Purple/teal for engagement

## Module-Specific Guidelines

### icon_border_progress

- Common issues: Color interpolation, entity resolution, progress calculation
- Required info: Entity states, color stops configuration, expected vs actual progress

### separator_as_progress_bar

- Common issues: Timeline positioning, color configuration, responsive behavior
- Required info: Complete timeline data, styling configuration

### separator_as_timeline

- Common issues: Date formatting, event positioning, responsive layout
- Required info: Event data structure, timeline configuration

### circular_progress_bar

- Common issues: SVG rendering, animation performance, size calculations
- Required info: Size settings, animation configuration, browser details

### helpers

- Common issues: Function behavior, performance, edge cases
- Required info: Input parameters, expected vs actual output, test cases

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- Repository push permissions for label management

## Maintenance

### Adding New Modules

When adding a new module, update `scripts/setup-github-labels.sh`:

```bash
create_label "module:new_module_name" "0366d6" "Issues related to new_module_name module"
```

### Customizing Labels

Modify colors and descriptions in `scripts/setup-github-labels.sh`:

```bash
create_label "priority:urgent" "ff0000" "Urgent issue requiring immediate attention"
```

### Updating Issue Templates

Edit files in `.github/ISSUE_TEMPLATE/`:

- `bug_report.md` - Bug report template
- `feature_request.md` - Feature request template
- `question.md` - Question template
- `documentation.md` - Documentation template
- `config.yml` - Issue template configuration

## Troubleshooting

### Label Setup Fails

1. Ensure GitHub CLI is installed: `brew install gh`
2. Authenticate: `gh auth login`
3. Check repository permissions
4. Re-run: `npm run setup:github-labels`

### Issue Templates Not Appearing

1. Check files exist in `.github/ISSUE_TEMPLATE/`
2. Verify YAML frontmatter is correct
3. Push changes to GitHub
4. Clear browser cache and try again

### Common Label Patterns

**Bug Triage:**

```
module:icon_border_progress + type:bug + priority:high + status:needs-triage
→ Investigation and reproduction
→ status:ready-for-dev + complexity:moderate
→ status:in-progress (when work starts)
→ Close when fixed
```

**Feature Request Flow:**

```
module:helpers + type:feature-request + status:needs-triage
→ Discussion and specification
→ status:ready-for-dev + complexity:complex + help-wanted
→ status:in-progress (when work starts)
→ Close when implemented
```

## Best Practices

1. **Always use module labels** - Makes filtering and assignment easier
2. **Triage within 48 hours** - Keep `status:needs-triage` queue manageable
3. **Update status actively** - Helps contributors find work
4. **Use complexity labels** - Helps new contributors find appropriate issues
5. **Link related issues** - Use "Related to #123" or "Fixes #123"
6. **Close with resolution** - Comment on why/how issue was resolved

## Automation Opportunities

Consider setting up GitHub Actions to:

- Auto-apply module labels based on file paths in PRs
- Auto-close stale issues with `status:waiting-for-feedback`
- Auto-assign reviewers based on module labels
- Generate release notes grouped by module and type
