import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSampleCatalog } from '../src/lib/samples.ts';

test('accepts generated sample entries', () => {
  assert.deepEqual(parseSampleCatalog({ samples: [
    { file: 'part-01.stl', label: 'part-01' },
    { file: '日本語 model.STL', label: '日本語 model' },
  ] }), [
    { file: 'part-01.stl', label: 'part-01' },
    { file: '日本語 model.STL', label: '日本語 model' },
  ]);
});

test('accepts an empty catalog', () => {
  assert.deepEqual(parseSampleCatalog({ samples: [] }), []);
});

test('rejects invalid manifest and unsafe paths', () => {
  assert.throws(() => parseSampleCatalog(null), /不正/);
  assert.throws(() => parseSampleCatalog({ samples: [{ file: '../secret.stl' }] }), /無効/);
  assert.throws(() => parseSampleCatalog({ samples: [{ file: 'sub/part.stl' }] }), /無効/);
  assert.throws(() => parseSampleCatalog({ samples: [{ file: 'image.png' }] }), /無効/);
});
