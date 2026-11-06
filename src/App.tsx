import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import StlCanvas, { type StlCanvasHandle } from './components/StlCanvas';
import { MAX_STL_BYTES, formatModelLength, parseStl, type LoadedStl } from './lib/stl';

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
}

export default function App() {
  const canvasRef = useRef<StlCanvasHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const [model, setModel] = useState<LoadedStl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [color, setColor] = useState('#70ddc7');
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);

  const handleRenderError = useCallback((message: string) => setError(message), []);

  const loadFile = async (file: File) => {
    const requestId = ++requestRef.current;
    setError(null);

    if (!/\.stl$/i.test(file.name)) {
      setError('拡張子 .stl のファイルを選択してください。');
      return;
    }
    if (file.size === 0 || file.size > MAX_STL_BYTES) {
      setError(`ファイルサイズは1バイト以上、${MAX_STL_BYTES / (1024 * 1024)} MB以下にしてください。`);
      return;
    }

    setIsLoading(true);
    try {
      // No upload occurs; browser file APIs and STLLoader handle everything locally.
      const arrayBuffer = await file.arrayBuffer();
      if (requestId !== requestRef.current) return;
      const parsed = parseStl(arrayBuffer, file.name);
      setModel(parsed);
    } catch (cause) {
      if (requestId !== requestRef.current) return;
      setError(cause instanceof Error ? cause.message : 'STLを読み込めませんでした。');
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void loadFile(file);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void loadFile(file);
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  return (
    <div className="site-shell">
      <div className="page-container">
        <header className="site-header">
          <div className="site-brand">
            <span className="brand-mark" aria-hidden="true">⬡</span>
            <span>STL VIEWER</span>
          </div>
          <span className="header-caption">THREE.JS · 3D MESH VIEWER</span>
        </header>

        <main className="site-main">
          <section className="page-intro">
            <p className="section-kicker">3D MODEL WORKSPACE</p>
            <h1>STL Viewer</h1>
            <p className="page-description">
              STLファイルを読み込み、ブラウザで形状を確認できます。回転・拡大縮小・移動に対応。
              ファイルは外部に送信されません。
            </p>
          </section>

          <div className="workspace">
            <section className="panel viewer-panel" aria-label="3Dモデルビュワー">
              <div className="panel-top">
                <div>
                  <p className="section-kicker">MODEL PREVIEW</p>
                  <h2>{model ? model.name : '3Dプレビュー'}</h2>
                </div>
                <button className="button button--secondary" type="button"
                  onClick={() => canvasRef.current?.resetView()} aria-label="視点をリセット">
                  ↺ 視点リセット
                </button>
              </div>
              <div className={`viewer-surface${isDragging ? ' is-dragging' : ''}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <StlCanvas ref={canvasRef} model={model} color={color}
                  wireframe={wireframe} showGrid={showGrid} showAxes={showAxes}
                  onError={handleRenderError} />
                {!model && !isLoading && (
                  <div className="viewer-empty">
                    <span aria-hidden="true" className="empty-icon">⬡</span>
                    <strong>STLファイルを読み込んでください</strong>
                    <p>右側の読み込みボタン、またはここへドラッグ＆ドロップ</p>
                  </div>
                )}
                {isLoading && <div className="viewer-loading" role="status">STLを読み込んでいます…</div>}
                {isDragging && <div className="drop-overlay">ここにSTLファイルをドロップ</div>}
                <div className="viewer-orientation">Z UP · X / Y / Z</div>
              </div>
              <div className="viewer-help">
                <span>左ドラッグ：回転</span>
                <span>ホイール：拡大・縮小</span>
                <span>右ドラッグ：移動</span>
                <span>タッチ操作対応</span>
              </div>
            </section>

            <aside className="panel tool-panel" aria-label="STL読み込みと表示設定">
              <div className="side-section">
                <p className="section-kicker">FILE</p>
                <h2>ファイルを読み込む</h2>
                <input ref={inputRef} className="visually-hidden" type="file"
                  accept=".stl" onChange={onFileChange} aria-label="STLファイルを選択" />
                <button className="button button--primary upload-button" type="button"
                  onClick={() => inputRef.current?.click()}>
                  ＋ STLファイルを選択
                </button>
                <p className="helper-text">ASCII / Binary STLに対応 · 最大80 MB</p>
                <p className="privacy-note">モデルはブラウザ内で処理され、サーバーへアップロードされません。</p>
                {error && <p className="error-text" role="alert">{error}</p>}
              </div>

              <div className="side-section">
                <p className="section-kicker">DISPLAY</p>
                <h2>表示設定</h2>
                <label className="color-setting">
                  <span>モデルの色</span>
                  <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
                </label>
                <label className="toggle-row">
                  <span>ワイヤーフレーム</span>
                  <input type="checkbox" checked={wireframe}
                    onChange={(event) => setWireframe(event.target.checked)} />
                </label>
                <label className="toggle-row">
                  <span>グリッド</span>
                  <input type="checkbox" checked={showGrid}
                    onChange={(event) => setShowGrid(event.target.checked)} />
                </label>
                <label className="toggle-row">
                  <span>XYZ軸</span>
                  <input type="checkbox" checked={showAxes}
                    onChange={(event) => setShowAxes(event.target.checked)} />
                </label>
              </div>

              <div className="side-section">
                <p className="section-kicker">GEOMETRY</p>
                <h2>モデル情報</h2>
                {model ? (
                  <dl className="model-stats">
                    <div><dt>ファイル名</dt><dd title={model.name}>{model.name}</dd></div>
                    <div><dt>ファイルサイズ</dt><dd>{formatBytes(model.byteLength)}</dd></div>
                    <div><dt>三角形数</dt><dd>{model.triangleCount.toLocaleString('ja-JP')}</dd></div>
                    <div><dt>X寸法</dt><dd>{formatModelLength(model.dimensions[0])}</dd></div>
                    <div><dt>Y寸法</dt><dd>{formatModelLength(model.dimensions[1])}</dd></div>
                    <div><dt>Z寸法</dt><dd>{formatModelLength(model.dimensions[2])}</dd></div>
                  </dl>
                ) : <p className="helper-text">STLを読み込むと寸法と三角形数を表示します。</p>}
                <p className="unit-note">STL形式には単位情報がないため、寸法はファイル内の数値をそのまま表示します。</p>
              </div>
            </aside>
          </div>
        </main>

        <footer className="site-footer">
          <span>© STL VIEWER</span>
          <span>THREE.JS · STLLOADER</span>
          <a href="https://github.com/naoiw/stl-viewer" target="_blank" rel="noreferrer">GitHub ↗</a>
        </footer>
      </div>
    </div>
  );
}
