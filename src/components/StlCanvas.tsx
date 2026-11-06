import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { LoadedStl } from '../lib/stl';

export interface StlCanvasHandle {
  resetView: () => void;
}

interface Props {
  model: LoadedStl | null;
  color: string;
  wireframe: boolean;
  showGrid: boolean;
  showAxes: boolean;
  onError: (message: string) => void;
}

interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  grid: THREE.GridHelper;
  axes: THREE.AxesHelper;
}

function fitView(context: SceneContext, model: LoadedStl | null) {
  const { camera, controls, grid, axes } = context;
  const dimensions = model?.dimensions ?? [8, 8, 8];
  const longest = Math.max(...dimensions, 0.001);
  const radius = Math.max(Math.hypot(...dimensions) / 2, 0.01);
  const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2) * 1.5;

  camera.near = Math.max(radius / 1000, 0.00001);
  camera.far = Math.max(distance * 100, camera.near * 10000);
  camera.updateProjectionMatrix();
  camera.position.copy(new THREE.Vector3(1.15, -1.5, 0.95).normalize().multiplyScalar(distance));
  controls.target.set(0, 0, 0);
  controls.minDistance = Math.max(radius * 0.05, 0.00001);
  controls.maxDistance = distance * 25;
  controls.update();

  grid.scale.setScalar(longest / 10);
  grid.position.z = model ? -dimensions[2] / 2 - longest * 0.015 : -4;
  axes.scale.setScalar(longest / 6);
}

const StlCanvas = forwardRef<StlCanvasHandle, Props>(function StlCanvas({
  model, color, wireframe, showGrid, showAxes, onError,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<SceneContext | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useImperativeHandle(ref, () => ({
    resetView() {
      if (contextRef.current) fitView(contextRef.current, model);
    },
  }), [model]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onError('WebGLを初期化できません。ブラウザのハードウェアアクセラレーション設定を確認してください。');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = 'model-canvas';
    renderer.domElement.setAttribute('aria-label', 'STLの3D表示領域');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.zoomToCursor = true;

    scene.add(new THREE.HemisphereLight(0xe5f7ff, 0x52657e, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(3, -4, 7);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x8fb4ff, 1.25);
    rimLight.position.set(-5, 3, 2);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(10, 20, 0x51748c, 0x294157);
    grid.rotation.x = Math.PI / 2; // STL convention: XY ground, Z vertical.
    scene.add(grid);

    const axes = new THREE.AxesHelper(1);
    scene.add(axes);

    const context = { scene, camera, renderer, controls, grid, axes };
    contextRef.current = context;
    fitView(context, null);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let frame = 0;
    const tick = () => {
      frame = window.requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      axes.geometry.dispose();
      (axes.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
      contextRef.current = null;
    };
  }, [onError]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context || !model) return;

    const material = new THREE.MeshStandardMaterial({
      color, metalness: 0.12, roughness: 0.55,
      side: THREE.DoubleSide, wireframe,
    });
    const mesh = new THREE.Mesh(model.geometry, material);
    context.scene.add(mesh);
    materialRef.current = material;
    fitView(context, model);

    return () => {
      context.scene.remove(mesh);
      if (materialRef.current === material) materialRef.current = null;
      material.dispose();
      model.geometry.dispose();
    };
    // The model geometry is owned by this effect and disposed when replaced.
    // Material changes are handled by the following effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.color.set(color);
    materialRef.current.wireframe = wireframe;
    materialRef.current.needsUpdate = true;
  }, [color, wireframe]);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.grid.visible = showGrid;
    contextRef.current.axes.visible = showAxes;
  }, [showGrid, showAxes]);

  return <div className="model-viewport" ref={containerRef} />;
});

export default StlCanvas;
