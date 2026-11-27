<!-- Plugin description -->
<h2>Flat and fancy Monokai for JetBrains IDEs</h2>

<p>
A port of the Monokai Flat Fancy Visual Studio Code theme by boenkkk. Three variants ship in one plugin, each with matching
IDE UI colors and editor syntax colors.
</p>
<!-- Plugin description end -->

# Monokai Flat Fancy Theme for JetBrains

The palette is ported from [boenkkk/monokai-flat-fancy](https://github.com/boenkkk/monokai-flat-fancy) v1.1.2. VS Code
`colors` keys become JetBrains UI color keys, and TextMate token foregrounds become JetBrains editor scheme attributes.

## Variants

| Variant | Base | Editor background | Base UI theme |
| --- | --- | --- | --- |
| Monokai Flat Fancy Default | Darcula | `#1E1F1C` | dark |
| Monokai Flat Fancy Darker | Darcula | `#000000` | dark |
| Monokai Flat Fancy Light | Light | `#FFFFFF` | light |

## Installation

Install from the JetBrains Marketplace once the plugin is published, or install a locally built distribution:

1. Run `./gradlew buildPlugin`.
2. Open `Settings` > `Plugins` > the gear icon > `Install Plugin from Disk...`.
3. Select the ZIP in `build/distributions/` and restart the IDE when prompted.

## Usage

- UI theme: `Settings` > `Appearance & Behavior` > `Appearance` > `Theme`. Selecting a Monokai Flat Fancy theme also switches the editor color scheme to the matching variant.
- Editor colors: `Settings` > `Editor` > `Color Scheme`. The scheme can still be changed independently afterwards.

## Development

Generated resources are committed so a plain `./gradlew buildPlugin` works without Node.js.

```bash
npm run generate     # regenerate theme resources and plugin icons
npm run validate     # check JSON/XML structure, icons, and plugin.xml registrations
npm run check        # both of the above
./gradlew buildPlugin
./gradlew runIde
./gradlew verifyPlugin
```

### Where things live

- `scripts/theme-config.mjs`: palette values copied from the VS Code theme plus role-to-attribute mappings. Edit this file to change colors.
- `scripts/generate-themes.mjs`: writes three `.theme.json` UI themes and three `.xml` editor schemes.
- `scripts/generate-icons.mjs`: scales `icons/monokai-flat-fancy.svg` to the required 40x40 plugin icons.
- `scripts/validate.mjs`: fails on malformed colors, unresolved UI color references, duplicate attributes, invalid icons, or missing registrations.
- `icons/monokai-flat-fancy.svg`: upstream icon asset from `boenkkk/openidea-monokai-flat-fancy-theme`.
- `src/main/java/`: applies the matching editor scheme when a Monokai Flat Fancy UI theme is selected.
- `src/main/resources/META-INF/plugin.xml`: registers all six resources and the theme listener with the IDE.
- `src/main/resources/themes/`: generated output, tracked in Git.

### Porting notes

- VS Code 8-digit hex colors (`#RRGGBBAA`) are composited over the variant's `editor.background`, because JetBrains color schemes use six-digit RGB.
- JetBrains `theme JSON` named colors allow indirection; the generator declares a fixed set of semantic names and the `ui` tree references them.
- The VS Code theme's late `variable, variable.parameter, variable.language` rule wins, so parameters use the neutral foreground instead of orange. This behavior is preserved.
- Bracket and indent rainbow groups use the Monokai pink, yellow, green, cyan, and purple family.
- The editor scheme defines 462 token attributes, including console and block-terminal ANSI colors.

## License

MIT. The original theme is copyright (c) 2022 Budi Santoso. See `LICENSE`.
