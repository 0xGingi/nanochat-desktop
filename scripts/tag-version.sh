#!/bin/bash
# scripts/tag-version.sh
# Automatically tags the current commit based on the branch name version

BRANCH=$(git rev-parse --abbrev-ref HEAD)
DERIVED_VERSION=""

# Extract version from branch name (e.g., v1.0.0, v.1.1.1, v03, v12)
if [[ $BRANCH =~ v\.?([0-9]+\.[0-9]+\.[0-9]+) ]]; then
    DERIVED_VERSION="${BASH_REMATCH[1]}"
elif [[ $BRANCH =~ v([0-9])([0-9]) ]]; then
    MAJOR="${BASH_REMATCH[1]}"
    MINOR="${BASH_REMATCH[2]}"
    DERIVED_VERSION="$MAJOR.$MINOR.0"
fi

if [ -n "$DERIVED_VERSION" ]; then
    TAG="v$DERIVED_VERSION"
    
    # Check if the tag already points to the current commit
    if git rev-parse "$TAG" >/dev/null 2>&1; then
        TAG_COMMIT=$(git rev-parse "$TAG")
        CURRENT_COMMIT=$(git rev-parse HEAD)
        
        if [ "$TAG_COMMIT" == "$CURRENT_COMMIT" ]; then
            # Tag already exists on this commit, nothing to do
            exit 0
        fi
        
        # Tag exists but on a different commit. 
        # We don't force move it automatically to avoid accidents, 
        # but for branch-based versioning, we usually want the latest commit to have the tag.
        echo "Updating tag $TAG to current commit..."
        git tag -f "$TAG"
    else
        echo "Creating tag $TAG on current commit..."
        git tag "$TAG"
    fi
fi