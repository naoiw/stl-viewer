import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export const MAX_STL_BYTES = 80 * 1024 * 1024;

export interface LoadedStl {
  name: string;
  byteLength: number;
  geometry: THREE.BufferGeometry;
  dimensions: [number, number, number];
  triangleCount: number;
}

/** Parse ASCII or binary STL entirely inside the browser. STL itself has no units. */
export function parseStl(buffer: ArrayBuffer, name: string): LoadedStl {
  if (buffer.byteLength === 0) throw new Error('STLファイルが空です。');

  const geometry = new STLLoader().parse(buffer);

  try {
    const positions = geometry.getAttribute('position');
    if (!positions || positions.count < 3 || positions.count % 3 !== 0) {
      throw new Error('有効な三角形メッシュがありません。');
    }

    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (!bounds || bounds.isEmpty()) throw new Error('モデルの寸法を取得できません。');

    const size = new THREE.Vector3();
    bounds.getSize(size);
    if (![size.x, size.y, size.z].every(Number.isFinite) ||
        Math.max(size.x, size.y, size.z) <= 0) {
      throw new Error('STLに無効な座標が含まれています。');
    }

    // Move the mesh midpoint to the world origin, preserving STL's Z-up axes.
    const center = new THREE.Vector3();
    bounds.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return {
      name,
      byteLength: buffer.byteLength,
      geometry,
      dimensions: [size.x, size.y, size.z],
      triangleCount: positions.count / 3,
    };
  } catch (error) {
    geometry.dispose();
    throw error;
  }
}

export function formatModelLength(value: number): string {
  if (value === 0) return '0';
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(2);
  return Number(value.toPrecision(3)).toString();
}
