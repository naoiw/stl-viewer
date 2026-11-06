import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseStl } from '../src/lib/stl.ts';

const fixtures = [
  { file: '01-cube.stl', triangles: 12, dimensions: [20, 20, 20] },
  { file: '02-pyramid.stl', triangles: 6, dimensions: [30, 30, 30] },
  { file: '03-cylinder.stl', triangles: 128, dimensions: [30, 30, 35] },
  { file: '04-torus.stl', triangles: 768, dimensions: [64, 64, 16] },
];

for (const fixture of fixtures) {
  test(`built-in sample: ${fixture.file}`, async () => {
    const bytes = await readFile(new URL(`../public/samples/${fixture.file}`, import.meta.url));
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const model = parseStl(buffer, fixture.file);
    try {
      assert.equal(model.triangleCount, fixture.triangles);
      model.dimensions.forEach((value, index) => {
        assert.ok(Math.abs(value - fixture.dimensions[index]) < 0.001);
      });
    } finally {
      model.geometry.dispose();
    }
  });
}
