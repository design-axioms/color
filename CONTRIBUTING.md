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

## Documentation & examples

The docs site is part of the user programming model contract.

- `pnpm -w check:rfc010` scans docs content (`site/src/content/docs/**/*.{md,mdx}`) to prevent accidentally teaching forbidden “plumbing” (engine addressing, raw color literals, etc.).
- Guides are expected to be copy/paste safe and strictly contract-aligned.

### Explanatory spans (internals)

If you need to mention internals for explanation (not integration), wrap the smallest possible region in an explicit explanatory span:

- In `.md` files:
  - `<!-- axm-docs:explanatory:start -->`
  - `<!-- axm-docs:explanatory:end -->`
- In `.mdx` files:
  - `{/* axm-docs:explanatory:start */}`
  - `{/* axm-docs:explanatory:end */}`

Policy:

- Explanatory spans are **not** a public API endorsement.
- Keep them rare and scoped: if contract-level teaching is sufficient, prefer that.

## QA & Visual Audits

We maintain a suite of visual audit tools to verify the design system across different contexts.

- **Capture Screenshots**: Run `pnpm qa:capture` to generate a matrix of screenshots (Pages × Viewports × Themes) in the `qa-audit/` directory. This is useful for manual review and generating audit reports.
