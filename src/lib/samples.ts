export interface SampleEntry {
  file: string;
  label: string;
}

/** Validate the generated sample catalog before using filenames in a URL. */
export function parseSampleCatalog(data: unknown): SampleEntry[] {
  if (!data || typeof data !== 'object' || !('samples' in data) ||
      !Array.isArray(data.samples)) {
    throw new Error('サンプル一覧の形式が不正です。');
  }

  return data.samples.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || !('file' in entry) ||
        typeof entry.file !== 'string' || !/^[^/\\\\]+\\.stl$/i.test(entry.file)) {
      throw new Error('サンプル一覧に無効なファイル名があります。');
    }
    const label = 'label' in entry && typeof entry.label === 'string' && entry.label.trim()
      ? entry.label
      : entry.file.replace(/\\.stl$/i, '');
    return { file: entry.file, label };
  });
}
