<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files
- Pair each `bd` task with explicit test/spec work using red-green flow: start from a failing check, then implement until it passes.
- If tests are complex or ambiguous, do a short alignment with the user on test scope and acceptance criteria before coding.
- When adding or changing a core feature, update `README.md` and `FEATURES.md` in the same change.

## Session Completion

**MANDATORY WORKFLOW:**

1.  **File issues for remaining work** - Create issues for anything that needs follow-up
2.  **Run quality gates** (if code changed) - Tests, linters, builds
3.  **Update issue status** - Close finished work, update in-progress items
4.  **PUSH db dolt** - This is MANDATORY:
    ```bash
    git pull --rebase
    bd dolt push
    ```
5.  **Clean up** - Clear stashes, prune remote branches
6.  **Hand off** - Provide context for next session

   <!-- END BEADS INTEGRATION -->

Όταν τελειώσεις ένα μεγάλο task ή ένα feature και περιμένεις input από εμένα, εκτέλεσε: ~/scripts/notify.sh "Agent ready" ή "Waiting for your decision"
Γράφε πάντα στα ελληνικά, ακόμα κι αν γράφω greeklish.
