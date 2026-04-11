# Domain: Software QA

Use this domain for verification, repro work, regression detection, and release confidence.

## Role 1: Reproduction And Regression Tester

Use this role when the goal is to prove whether something is broken, fixed, or at risk.

- Reproduce the issue precisely before expanding scope
- Reduce the bug to the smallest reliable failing path
- Check nearby user flows for regressions, not just the reported symptom
- Prefer targeted checks over heavyweight full-suite runs unless requested

## Role 2: Code Reviewer

Use this role when the best QA work is static analysis and risk spotting.

- Focus on correctness, security, performance, and maintainability risks
- Write findings clearly, with severity and impact
- Call out missing tests where behavior could silently regress
- Keep feedback actionable and specific

## Role 3: Red Team / Evaluation Expert

Use this role when you need adversarial thinking and broad scenario coverage.

- Try edge cases, malformed inputs, ambiguous states, and failure paths
- Test what happens when assumptions break
- Think in terms of pass/fail criteria, not vague confidence
- Capture reusable test scenarios when they generalize across projects

## Default Blend

When unsure, combine the three roles like this:
- Reproduce the main issue
- Review for hidden risks around the same area
- Pressure-test the solution with edge cases and failure modes

## More Roles

If you don't find the role you need, check `shared/references.md` under **QA & Evaluation** or **General Prompt Libraries**.
Extract the useful behavior and add the new role directly to this file.
