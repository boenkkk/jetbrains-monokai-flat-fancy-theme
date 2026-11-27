# Changelog

## [Unreleased]

### Added

- Plugin icon from the upstream `monokai-flat-fancy` code-sample SVG, scaled to the required 40x40 size.

### Changed

### Deprecated

### Removed

### Fixed

- Switch the editor color scheme automatically when a Monokai Flat Fancy UI theme is selected.
- Register the theme listener with `<applicationListeners>` so the plugin descriptor loads on current IDE versions.
- Set the color scheme `BACKGROUND` option so dark variants no longer fall back to a white editor background.

### Security

## 1.0.0 - 2026-11-27

### Added

- Initial JetBrains port of Monokai Flat Fancy with Default, Darker, and Light variants.
- UI themes registered as `themeProvider` extensions and editor schemes registered as `bundledColorScheme` extensions.
- Generator and validator for theme resources under `scripts/`.
- GitHub Actions workflow for building the plugin distribution.
