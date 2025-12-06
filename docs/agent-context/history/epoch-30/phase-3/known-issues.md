# Known Issues - Epoch 18

## Deployment

- **NPM Publishing**: The publishing workflow has been created but not yet tested in a live environment. It relies on the `NPM_TOKEN` secret being present in the repository settings.
- **StackBlitz Links**: The "Try it" links in the documentation currently point to the root of the repository. While `.stackblitzrc` improves the experience, a dedicated starter template might be better for new users in the future.

## Documentation

- **Ember Guide**: The Ember guide assumes a modern GTS setup. Users on older versions of Ember might need to adapt the code. Since Ember's modern features tend to work on older versions, this should be manageable.
- **Browser Support**: The system relies on `oklch` and modern CSS features. Older browsers are not supported (as per design). We should clearly document the fact that this library leans on _Baseline_ as the minimum supported environment, which should give most people confidence that it will work in their projects. But yes, we should call this out explicitly.

## Tooling

- **Node Version**: The project requires Node 24. Users on older versions will see warnings or errors.
