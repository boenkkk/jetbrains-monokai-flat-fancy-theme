import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'icons/monokai-flat-fancy.svg');
const source = readFileSync(sourcePath, 'utf8');
const rootTag = source.match(/<svg\b([^>]*)>/);

if (!rootTag) throw new Error(`Missing <svg> root in ${sourcePath}`);

const attributes = rootTag[1].replace(/\s(?:width|height)="[^"]*"/g, '');
const pluginIcon = source.replace(rootTag[0], `<svg${attributes} width="40" height="40">`);
const metaInf = resolve(root, 'src/main/resources/META-INF');

for (const name of ['pluginIcon.svg', 'pluginIcon_dark.svg']) {
  writeFileSync(resolve(metaInf, name), pluginIcon);
  console.log(`Generated ${resolve(metaInf, name)}`);
}
