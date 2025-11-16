---
description: Check git diff, create commit, and push to remote
---

Please perform the following steps to commit and push changes:

1. Run `git branch --show-current` to get the current branch name
2. Run `git status` to see which files have been modified
3. Run `git diff` to show the detailed changes
4. Analyze the changes and create an appropriate commit message that:
   - Summarizes what was changed
   - Uses conventional commit format (e.g., "feat:", "fix:", "refactor:", "docs:", "chore:")
   - Is concise but descriptive
5. Run `git add .` to stage all changes
6. Run `git commit -m "<your commit message>"` with the generated message
7. Run `git push origin <current-branch>` to push to remote (use the branch name from step 1)

Make sure to:
- Review the changes before committing
- Create a meaningful commit message based on the actual changes
- Push to the current branch, not always master
- Handle any merge conflicts if they occur during push
