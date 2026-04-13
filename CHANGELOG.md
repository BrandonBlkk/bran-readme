# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

- (No changes yet)

## [0.1.0] - 2026-04-13

### Added

- Created `CHANGELOG.md` to track project evolution.
- Integrated dynamic versioning in the Navbar (pulling directly from `package.json`).
- Shipped the core README builder with drag-and-drop section management for header, about, stats, skills, social links, and custom text blocks.
- Added live GitHub-style preview, raw markdown editing, and one-click markdown copy/export from the builder workspace.
- Added persistent builder and profile settings storage with reset-to-default flows for quick recovery.
- Added a dedicated Settings workspace for display name, GitHub username, website, and location defaults.
- Added GitHub account sync so authenticated profile data can prefill builder defaults automatically.
- Added built-in starter templates plus a Templates gallery for browsing, previewing, and applying layouts.
- Added Supabase-backed community template publishing with create, update, delete, and ownership-aware management flows.
- Added per-user template favorites so signed-in users can save and revisit preferred layouts.
- Added OAuth authentication with GitHub and Google for account-based template and favorites features.
- Added a landing page, About page, and responsive app shell for the builder, templates, and settings experience.
- Added in-app feedback submission with rating and optional comments.

### Changed

- Migrated from Beta branding to formal Semantic Versioning.
- Established `0.1.0` as the baseline documented release for the current BranReadme feature set.
