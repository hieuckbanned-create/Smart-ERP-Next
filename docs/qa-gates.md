# Smart ERP Next QA Gates

## Rule

`100%` Jest coverage is only a unit/integration coverage result for the current Jest configuration. It is not release certification.

Do not report Smart ERP Next as `100% complete`, `release-ready`, or `enterprise passed` unless the release gate passes in the same working session.

## Commands

```bash
pnpm qa:commit
```

Runs the commit gate:

- lint all workspaces
- type-check all workspaces
- Jest unit/integration tests with configured coverage thresholds

This gate allows a commit, but it is not enough to claim release readiness.

```bash
pnpm qa:release
```

Runs the release gate:

- all commit gates
- web build
- native Windows desktop build
- mobile native type-check
- e2e assertion audit that blocks `401`, `404`, and `500` as accepted success states
- API end-to-end tests
- Playwright end-user web flows
- native artifact verification for Android, iOS, and Windows

If APK, IPA, or Windows installable artifacts are missing, release certification must fail.

## Native Artifacts

The native artifact gate searches these locations:

- `artifacts`
- `dist`
- `apps/mobile`
- `apps/desktop/src-tauri/target/release/bundle`

Required artifact types:

- Android: `.apk` or `.aab`
- iOS: `.ipa`
- Windows: `.msi` or `.exe`

Passing unit coverage without these artifacts is not a valid release claim.

## Git Hook

The tracked hook template is `.githooks/pre-commit`. The local `.git/hooks/pre-commit` in this workspace has also been updated to call `pnpm qa:commit`.

To use the tracked hook path in a fresh clone:

```bash
git config core.hooksPath .githooks
```
