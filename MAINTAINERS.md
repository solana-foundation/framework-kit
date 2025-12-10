# Maintaining Framework Kit

This document captures the release and publishing workflow for the Framework Kit
packages. The process mirrors what we use in
[`create-solana-dapp`](https://github.com/solana-foundation/create-solana-dapp),
with a single trusted workflow handling both canary snapshots and stable
publishes.

## Changesets

- We use [Changesets](https://github.com/changesets/changesets) for semantic versioning.
- Any change that affects an npm package must include a changeset. Run
  `pnpm changeset`, select the touched packages, choose the semver bump, and add
  a short changelog entry.
- When PRs with pending changesets merge into `main`, the Changesets GitHub bot
  automatically opens a "Version Packages" PR that bumps package versions and
  updates CHANGELOG entries.

## Publishing flow

The `.github/workflows/publish-packages.yml` workflow is the only trusted
workflow registered with npm. It runs automatically on every push to `main`,
and it can also be triggered manually via the **Run workflow** button.

1. **Stable releases (`regular` path)**  
   Pushes to `main` always run the workflow with `release_type=regular`. The job
   lint/tests/builds the repo and invokes `changesets/action`. As long as there
   are pending changesets, the action keeps the bot-owned "Version Packages" PR
   up to date. When that PR is merged (meaning no pending changesets remain),
   the workflow automatically runs `pnpm publish-packages` (which maps to
   `pnpm changeset publish`) to publish new versions to npm with the `latest`
   tag.

2. **Canary releases (`canary` path)**  
   To publish a snapshot, manually run the workflow from the Actions tab and set
   the `release_type` input to `canary`. The job will run lint/test/build, call
   `pnpm changeset version --snapshot canary`, rebuild, and publish the affected
   packages under the `canary` npm tag (via `pnpm changeset publish --tag canary`).
   Consumers can install these previews through `@solana/<package>@canary`.

## Operational requirements

- npm trusted publishing must remain configured for the
  `solana-foundation/framework-kit` repository and the
  `.github/workflows/publish-packages.yml` workflow filename.
- The default `GITHUB_TOKEN` handles release PR automation, and npm is accessed
  via OIDC—no `NPM_TOKEN` or extra PAT is necessary.
- Trigger manual runs from the workflow's **Run workflow** button whenever you
  need a canary snapshot or to re-run a failed publish.
