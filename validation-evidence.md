# Validation Evidence — UI-to-Spec Factory

Date checked: 25 Nov 2026

## Checks run

- JavaScript syntax check: `node --check app.js` — passed.
- Generated 8 packages: 4 mockups × 2 output stacks.
- Reference validation checks passed: 64/64.
- Broken variants scored lower than reference packages: 8/8.

## Sample results

| Mockup | Stack | Reference score | Broken score |
| --- | --- | ---: | ---: |
| Billing Card | HTML | 100% | 88% |
| Login Form | React | 100% | 88% |
| Dashboard Widget | HTML | 100% | 88% |
| Product Card | React | 100% | 88% |

## Interpretation

The validator checks required components, accessible labels/roles, responsive rules, and primary action handling. Removing the primary button label drops the score, showing that the validation separates complete packages from broken ones.
