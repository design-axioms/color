# Contributing to Color System

## Workflow

We use a standard Pull Request workflow.

1.  **Create a Branch**: Create a new branch for your feature or fix.
    ```bash
    git checkout -b feature/my-feature
    ```
2.  **Make Changes**: Implement your changes.
3.  **Run Checks**: Ensure all local checks pass before pushing.
    ```bash
    pnpm lint
    pnpm build
    pnpm test
    ```
    _Note: If you encounter linting errors related to Astro types (e.g., in `site/src/content.config.ts`), run `pnpm --filter site astro sync` to generate the necessary type definitions._
4.  **Push and PR**: Push your branch and open a Pull Request against `main`.
    ```bash
    git push -u origin feature/my-feature
    gh pr create
    ```

## CI/CD

Our CI pipeline runs on GitHub Actions and performs the following checks:

- **Lint**: Runs `eslint .` to check for code quality and style issues.
- **Build**: Builds the library and CLI using `tsup`.
- **Test**: Runs unit tests using `vitest`.
- **Solve**: Verifies the color solver logic.
- **Audit Theme**: Audits the generated theme.

## Development

- **Package Manager**: We use `pnpm`.
- **Node Version**: We target Node.js v24.
- **Formatting**: We use Prettier. Run `pnpm format` to format code.
