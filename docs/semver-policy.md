# Semantic Versioning Policy

## Version format

We follow **Semantic Versioning 2.0.0**: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Breaking API changes, database migrations requiring downtime, removed features
- **MINOR** (x.1.x): New features, new API endpoints, new database tables (backward compatible)
- **PATCH** (x.x.1): Bug fixes, performance improvements, security patches (no breaking changes)

## Current version: 1.0.0

## What constitutes a breaking change

- Removing or renaming an API endpoint
- Changing the shape of API response objects
- Adding required fields to API requests
- Removing database columns or tables
- Changing the behavior of existing endpoints
- Removing exported package members

## Release process

1. All changes merge to `dev` (integration branch, always green)
2. When ready for release, tag `dev` with `v{MAJOR}.{MINOR}.{PATCH}`
3. CI builds Docker image with version tag + `latest`
4. GitHub Release is created with auto-generated notes
5. Release notes include: breaking changes, new features, bug fixes

## Pre-release versions

Use suffixes for pre-release: `-alpha.1`, `-beta.1`, `-rc.1`
