```markdown
# image-remotion-skill Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill demonstrates best practices for developing TypeScript-based React applications, as seen in the `image-remotion-skill` repository. It covers coding conventions, commit patterns, file organization, and testing strategies, providing a blueprint for maintainable and consistent codebases.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `imageRenderer.tsx`, `videoPreview.test.ts`

### Import Style
- Prefer **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { renderImage } from './imageRenderer';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // imageRenderer.tsx
    export function renderImage() { ... }
    ```

### Commit Patterns
- Follow **Conventional Commits**.
- Use prefixes such as `refactor`.
- Keep commit messages concise (average ~43 characters).
  - Example:
    ```
    refactor: update image rendering logic
    ```

## Workflows

### Refactoring Code
**Trigger:** When improving code structure or readability without changing functionality.
**Command:** `/refactor`

1. Identify code that can be improved (e.g., simplify logic, rename variables).
2. Make changes while ensuring no change in external behavior.
3. Run tests to verify nothing is broken.
4. Commit with a message like: `refactor: <short description>`
5. Push changes and open a pull request if required.

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - Example: `imageRenderer.test.ts`
- The testing framework is not specified, but tests should be colocated with the code or in a `__tests__` directory.
- Example test file structure:
  ```typescript
  // imageRenderer.test.ts
  import { renderImage } from './imageRenderer';

  test('renders image correctly', () => {
    // test implementation
  });
  ```

## Commands
| Command    | Purpose                                 |
|------------|-----------------------------------------|
| /refactor  | Start a code refactoring workflow       |
```
