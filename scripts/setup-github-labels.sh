#!/bin/bash

# GitHub Labels Setup Script
# This script creates a comprehensive set of labels for the bubble-card-modules repository
# Requires: GitHub CLI (gh) to be installed and authenticated

echo "🏷️  Setting up GitHub labels for bubble-card-modules..."

# Check if GitHub CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   # or visit: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"

# Function to create or update a label
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"
    
    if gh label list | grep -q "^$name"; then
        echo "📝 Updating label: $name"
        gh label edit "$name" --color "$color" --description "$description"
    else
        echo "✨ Creating label: $name"
        gh label create "$name" --color "$color" --description "$description"
    fi
}

echo ""
echo "🔧 Creating module labels..."

# Module labels - Blue theme
create_label "module:icon_border_progress" "0366d6" "Issues related to icon_border_progress module"
create_label "module:separator_as_progress_bar" "0366d6" "Issues related to separator_as_progress_bar module"
create_label "module:separator_as_timeline" "0366d6" "Issues related to separator_as_timeline module"
create_label "module:circular_progress_bar" "0366d6" "Issues related to circular_progress_bar module"
create_label "module:helpers" "0366d6" "Issues related to shared helper functions"

echo ""
echo "🎯 Creating type labels..."

# Type labels - Semantic colors
create_label "type:bug" "d73a4a" "Something isn't working"
create_label "type:enhancement" "a2eeef" "New feature or request"
create_label "type:documentation" "0075ca" "Improvements or additions to documentation"
create_label "type:question" "d876e3" "Further information is requested"
create_label "type:feature-request" "84b6eb" "Request for a new feature"
create_label "type:refactor" "fbca04" "Code refactoring without functional changes"
create_label "type:performance" "ff9500" "Performance improvements"
create_label "type:testing" "c2e0c6" "Testing related changes"

echo ""
echo "⚡ Creating priority labels..."

# Priority labels - Traffic light colors
create_label "priority:critical" "b60205" "Critical issue requiring immediate attention"
create_label "priority:high" "d93f0b" "High priority issue"
create_label "priority:medium" "fbca04" "Medium priority issue"
create_label "priority:low" "0e8a16" "Low priority issue"

echo ""
echo "📊 Creating status labels..."

# Status labels - Progress colors
create_label "status:needs-triage" "ededed" "Issue needs to be triaged and categorized"
create_label "status:ready-for-dev" "c2e0c6" "Issue is ready for development"
create_label "status:in-progress" "fef2c0" "Issue is currently being worked on"
create_label "status:waiting-for-feedback" "d4c5f9" "Waiting for feedback from reporter or community"
create_label "status:blocked" "e99695" "Issue is blocked by another issue or external dependency"
create_label "status:wont-fix" "ffffff" "This will not be worked on"

echo ""
echo "🎨 Creating complexity labels..."

# Complexity labels - Size indicators
create_label "complexity:simple" "c2e0c6" "Simple change, easy to implement"
create_label "complexity:moderate" "fef2c0" "Moderate complexity, requires some planning"
create_label "complexity:complex" "f9d0c4" "Complex change, requires significant work"

echo ""
echo "👥 Creating community labels..."

# Community labels
create_label "good-first-issue" "7057ff" "Good for newcomers"
create_label "help-wanted" "008672" "Extra attention is needed"
create_label "needs-reproduction" "f9d0c4" "Issue needs steps to reproduce"
create_label "duplicate" "cfd3d7" "This issue or pull request already exists"
create_label "invalid" "e4e669" "This doesn't seem right"

echo ""
echo "🚀 Creating release labels..."

# Release labels
create_label "release:major" "b60205" "Breaking change requiring major version bump"
create_label "release:minor" "fbca04" "New feature requiring minor version bump"
create_label "release:patch" "0e8a16" "Bug fix requiring patch version bump"

echo ""
echo "✅ GitHub labels setup complete!"
echo ""
echo "📋 Summary of created labels:"
echo "   • Module labels (5): Blue theme for organization"
echo "   • Type labels (8): Semantic colors for issue categorization"
echo "   • Priority labels (4): Traffic light colors for urgency"
echo "   • Status labels (6): Progress colors for workflow tracking"
echo "   • Complexity labels (3): Size indicators for effort estimation"
echo "   • Community labels (5): Standard GitHub community labels"
echo "   • Release labels (3): Version impact indicators"
echo ""
echo "🎯 Next steps:"
echo "   1. Create issue templates: npm run setup:issue-templates"
echo "   2. Review and customize labels in GitHub repository settings"
echo "   3. Start using labels on existing issues"
echo ""
echo "💡 Tip: You can view all labels at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')/labels"
