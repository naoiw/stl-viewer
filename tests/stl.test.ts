import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_STL_BYTES, formatModelLength, parseStl } from '../src/lib/stl.ts';

function createBinaryStl(): ArrayBuffer {
  const buffer = new ArrayBuffer(84 + 50);
  const view = new DataView(buffer);
  view.setUint32(80, 1, true);
  const points = [0, 0, 0, 10, 0, 0, 0, 20, 30];
  points.forEach((value, i) => view.setFloat32(96 + i * 4, value, true));
  return buffer;
}

test('binary STL geometry and bounding dimensions', () => {
  const model = parseStl(createBinaryStl(), 'part.stl');
  try {
    assert.equal(model.triangleCount, 1);
    assert.deepEqual(model.dimensions, [10, 20, 30]);
    assert.equal(model.byteLength, 134);
    assert.deepEqual(
      model.geometry.boundingBox?.min.toArray(),
      [-5, -10, -15],
    );
  } finally {
    model.geometry.dispose();
  }
});

test('ASCII STL geometry', () => {
  const ascii = [
    'solid triangle',
    'facet normal 0 0 1',
    'outer loop',
    'vertex 0 0 0',
    'vertex 1 0 0',
    'vertex 0 1 0',
    'endloop',
    'endfacet',
    'endsolid triangle',
  ].join('\n');
  const data = new TextEncoder().encode(ascii).buffer;
  const model = parseStl(data, 'triangle.stl');
  try {
    assert.equal(model.triangleCount, 1);
    assert.deepEqual(model.dimensions, [1, 1, 0]);
  } finally {
    model.geometry.dispose();
  }
});

test('empty STL is rejected', () => {
  assert.throws(() => parseStl(new ArrayBuffer(0), 'empty.stl'), /空です/);
});

test('length formatting and configured file limit', () => {
  assert.equal(formatModelLength(15), '15.00');
  assert.equal(formatModelLength(0.125), '0.125');
  assert.equal(MAX_STL_BYTES, 80 * 1024 * 1024);
});
