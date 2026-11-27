# Contributing

The project is a metadata-only IntelliJ Platform plugin. There is no Java or Kotlin source code.

## Development workflow

1. Edit palette values or role mappings in `scripts/theme-config.mjs`.
2. Run `npm run check` to regenerate and validate `src/main/resources/themes/`.
3. Run `./gradlew buildPlugin` to produce the distribution in `build/distributions/`.
4. Run `./gradlew runIde` to open a sandbox IDE with the plugin installed.
5. Select the UI theme under `Appearance` and the editor scheme under `Color Scheme`.
6. Update `CHANGELOG.md` and open a pull request.

## File structure

- `scripts/theme-config.mjs`: source of truth for colors and JetBrains attribute groups.
- `scripts/generate-themes.mjs`: deterministic generator for UI themes and editor schemes.
- `scripts/generate-icons.mjs`: scales the upstream SVG to the required 40x40 plugin icons.
- `icons/`: source assets for plugin icons.
- `scripts/validate.mjs`: structural checks.
- `src/main/resources/themes/`: generated theme resources, committed to Git.
- `src/main/resources/META-INF/plugin.xml`: extension registrations.
- `.run/`: IDE run configurations for generation, build, and sandbox launch.
- `.github/workflows/`: CI build and release publishing.

## Theming references

- [IntelliJ Platform SDK: Theme Structure](https://plugins.jetbrains.com/docs/intellij/theme-structure.html)
- [IntelliJ Platform SDK: Customizing Themes](https://plugins.jetbrains.com/docs/intellij/themes-customize.html)
- [IntelliJ Platform SDK: Editor Schemes](https://plugins.jetbrains.com/docs/intellij/themes-extras.html)
- Use `Tools | Internal Actions | UI | UI Inspector` and `LaF Defaults` in a sandbox IDE to discover UI color keys.
