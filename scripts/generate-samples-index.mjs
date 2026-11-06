import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const samplesDirectory = fileURLToPath(new URL('../public/samples/', import.meta.url));
await mkdir(samplesDirectory, { recursive: true });

const entries = await readdir(samplesDirectory, { withFileTypes: true });
const samples = entries
  .filter((entry) => entry.isFile() && /\\.stl$/i.test(entry.name))
  .map((entry) => ({
    file: entry.name,
    label: entry.name.replace(/\\.stl$/i, ''),
  }))
  .sort((a, b) => a.file.localeCompare(b.file, 'ja', { numeric: true, sensitivity: 'base' }));

await writeFile(
  join(samplesDirectory, 'index.json'),
  JSON.stringify({ samples }, null, 2) + '\\n',
  'utf8',
);
console.log(`Sample STL catalog: ${samples.length} file(s)`);
