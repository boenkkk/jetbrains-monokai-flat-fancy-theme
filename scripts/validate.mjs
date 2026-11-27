import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VARIANTS } from './theme-config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themesDir = resolve(root, 'src/main/resources/themes');
const pluginXml = readFileSync(resolve(root, 'src/main/resources/META-INF/plugin.xml'), 'utf8');
const hex = /^#[0-9A-Fa-f]{6}$/;
const failures = [];

check(existsSync(resolve(root, 'icons/monokai-flat-fancy.svg')), 'Missing source plugin icon');
for (const name of ['pluginIcon.svg', 'pluginIcon_dark.svg']) {
  const path = resolve(root, `src/main/resources/META-INF/${name}`);
  check(existsSync(path), `Missing ${name}`);
  if (!existsSync(path)) continue;
  const svg = readFileSync(path, 'utf8');
  check(svg.includes('width="40"') && svg.includes('height="40"'), `${name} must be 40x40`);
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function collectReferences(value, references) {
  if (typeof value === 'string') {
    references.push(value);
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectReferences(nested, references);
  }
}

for (const variant of VARIANTS) {
  const jsonPath = resolve(themesDir, `monokai-flat-fancy-${variant.id}.theme.json`);
  const xmlPath = resolve(themesDir, `monokai-flat-fancy-${variant.id}.xml`);

  check(existsSync(jsonPath), `Missing ${jsonPath}`);
  check(existsSync(xmlPath), `Missing ${xmlPath}`);
  check(
    pluginXml.includes(`path="/themes/monokai-flat-fancy-${variant.id}.theme.json"`),
    `plugin.xml does not register the UI theme for ${variant.id}`,
  );
  check(
    pluginXml.includes(`path="/themes/monokai-flat-fancy-${variant.id}"/>`),
    `plugin.xml does not register the editor scheme for ${variant.id}`,
  );
  if (!existsSync(jsonPath) || !existsSync(xmlPath)) continue;

  const theme = JSON.parse(readFileSync(jsonPath, 'utf8'));
  check(theme.name === variant.label, `Unexpected theme name in ${variant.id}`);
  check(theme.dark === variant.dark, `Unexpected dark flag in ${variant.id}`);
  check(
    theme.editorScheme === `/themes/monokai-flat-fancy-${variant.id}.xml`,
    `Unexpected editorScheme in ${variant.id}`,
  );

  for (const [name, value] of Object.entries(theme.colors)) {
    check(hex.test(value), `Invalid named color ${name} in ${variant.id}: ${value}`);
  }

  const references = [];
  collectReferences(theme.ui, references);
  for (const reference of references) {
    check(
      hex.test(reference) || reference in theme.colors,
      `Unresolved UI color reference in ${variant.id}: ${reference}`,
    );
  }

  for (const [name, value] of Object.entries(theme.icons.ColorPalette)) {
    check(hex.test(value), `Invalid icon color ${name} in ${variant.id}: ${value}`);
  }

  const xml = readFileSync(xmlPath, 'utf8');
  const scheme = xml.match(/<scheme name="([^"]+)" version="(\d+)" parent_scheme="([^"]+)">/);
  check(Boolean(scheme), `Invalid scheme root in ${variant.id}`);
  if (scheme) {
    check(scheme[1] === variant.label, `Unexpected scheme name in ${variant.id}`);
    check(scheme[3] === variant.parentScheme, `Unexpected parent scheme in ${variant.id}`);
  }

  const attributeNames = [...xml.matchAll(/^    <option name="([^"]+)">/gm)].map((match) => match[1]);
  check(
    attributeNames.length === new Set(attributeNames).size,
    `Duplicate attribute names in ${variant.id}`,
  );

  for (const [, value] of xml.matchAll(/ value="([^"]*)"/g)) {
    check(
      value === '' || /^[0-9A-F]{6}$/.test(value) || /^\d+$/.test(value),
      `Invalid XML option value in ${variant.id}: ${value}`,
    );
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log(`Validated ${VARIANTS.length} UI themes and editor schemes.`);
