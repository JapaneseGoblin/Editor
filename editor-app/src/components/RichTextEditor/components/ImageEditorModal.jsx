import React, {
  useRef, useState, useEffect, useCallback, useLayoutEffect,
} from 'react';

// ─────────────────────────────────────────────────────────────
// Segéd: kép betöltése Image objektumként
// ─────────────────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─────────────────────────────────────────────────────────────
// Canvas-ra rajzolja a képet a jelenlegi transzformációkkal
// ─────────────────────────────────────────────────────────────
function renderToCanvas(canvas, img, transform, adjustments) {
  const { rotation, flipH, flipV } = transform;
  const { brightness, contrast, saturation } = adjustments;

  const rad  = (rotation * Math.PI) / 180;
  const cos  = Math.abs(Math.cos(rad));
  const sin  = Math.abs(Math.sin(rad));
  const w    = img.naturalWidth  * cos + img.naturalHeight * sin;
  const h    = img.naturalWidth  * sin + img.naturalHeight * cos;

  canvas.width  = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.filter = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
  ].join(' ');
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// Crop alkalmazása canvas-on
// ─────────────────────────────────────────────────────────────
function applyCrop(sourceCanvas, crop) {
  const { x, y, w, h } = crop;
  const out = document.createElement('canvas');
  out.width  = w;
  out.height = h;
  out.getContext('2d').drawImage(sourceCanvas, x, y, w, h, 0, 0, w, h);
  return out;
}

// ─────────────────────────────────────────────────────────────
// Tab gomb
// ─────────────────────────────────────────────────────────────
function Tab({ id, active, label, icon, onClick }) {
  return (
    <button
      className={`ime-tab${active ? ' ime-tab--active' : ''}`}
      onClick={() => onClick(id)}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Slider sor
// ─────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 1, onChange, unit = '' }) {
  return (
    <div className="ime-slider-row">
      <div className="ime-slider-label">
        <span>{label}</span>
        <span className="ime-slider-value">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ime-slider"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CropCanvas – interaktív crop overlay
// ─────────────────────────────────────────────────────────────
function CropCanvas({ previewUrl, crop, setCrop, imgNaturalW, imgNaturalH }) {
  const containerRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ w: 1, h: 1 });
  const dragging = useRef(null); // { type, startX, startY, origCrop }

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const { width } = el.getBoundingClientRect();
      const scale = width / imgNaturalW;
      setDisplaySize({ w: width, h: imgNaturalH * scale });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [imgNaturalW, imgNaturalH]);

  const scale   = displaySize.w / imgNaturalW;
  const cropPx  = { x: crop.x * scale, y: crop.y * scale, w: crop.w * scale, h: crop.h * scale };

  const toNatural = (px) => ({
    x: Math.round(px.x / scale),
    y: Math.round(px.y / scale),
    w: Math.round(px.w / scale),
    h: Math.round(px.h / scale),
  });

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const onMouseDown = (e, type) => {
    e.preventDefault();
    dragging.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      origCrop: { ...cropPx },
    };
    const onMove = (me) => {
      const dx = me.clientX - dragging.current.startX;
      const dy = me.clientY - dragging.current.startY;
      const orig = dragging.current.origCrop;
      let nx = orig.x, ny = orig.y, nw = orig.w, nh = orig.h;

      if (type === 'move') {
        nx = clamp(orig.x + dx, 0, displaySize.w - orig.w);
        ny = clamp(orig.y + dy, 0, displaySize.h - orig.h);
      } else {
        if (type.includes('e')) nw = clamp(orig.w + dx, 20, displaySize.w - orig.x);
        if (type.includes('s')) nh = clamp(orig.h + dy, 20, displaySize.h - orig.y);
        if (type.includes('w')) { nx = clamp(orig.x + dx, 0, orig.x + orig.w - 20); nw = orig.w - (nx - orig.x); }
        if (type.includes('n')) { ny = clamp(orig.y + dy, 0, orig.y + orig.h - 20); nh = orig.h - (ny - orig.y); }
      }
      setCrop(toNatural({ x: nx, y: ny, w: nw, h: nh }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handles = ['n','ne','e','se','s','sw','w','nw'];
  const handlePos = (dir) => {
    const cx = cropPx.x, cy = cropPx.y, cw = cropPx.w, ch = cropPx.h;
    const map = { n:[cx+cw/2,cy], ne:[cx+cw,cy], e:[cx+cw,cy+ch/2], se:[cx+cw,cy+ch],
                  s:[cx+cw/2,cy+ch], sw:[cx,cy+ch], w:[cx,cy+ch/2], nw:[cx,cy] };
    return map[dir];
  };

  return (
    <div ref={containerRef} className="ime-crop-container" style={{ height: displaySize.h }}>
      <img src={previewUrl} alt="" className="ime-crop-img" draggable={false} />

      {/* Overlay */}
      <svg className="ime-crop-overlay" width={displaySize.w} height={displaySize.h}>
        {/* Sötétítés */}
        <defs>
          <mask id="crop-mask">
            <rect width="100%" height="100%" fill="white"/>
            <rect x={cropPx.x} y={cropPx.y} width={cropPx.w} height={cropPx.h} fill="black"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#crop-mask)"/>

        {/* Crop keret */}
        <rect x={cropPx.x} y={cropPx.y} width={cropPx.w} height={cropPx.h}
          fill="none" stroke="white" strokeWidth="1.5"/>

        {/* Harmadolás rács */}
        <line x1={cropPx.x + cropPx.w/3} y1={cropPx.y} x2={cropPx.x + cropPx.w/3} y2={cropPx.y + cropPx.h} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        <line x1={cropPx.x + 2*cropPx.w/3} y1={cropPx.y} x2={cropPx.x + 2*cropPx.w/3} y2={cropPx.y + cropPx.h} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        <line x1={cropPx.x} y1={cropPx.y + cropPx.h/3} x2={cropPx.x + cropPx.w} y2={cropPx.y + cropPx.h/3} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        <line x1={cropPx.x} y1={cropPx.y + 2*cropPx.h/3} x2={cropPx.x + cropPx.w} y2={cropPx.y + 2*cropPx.h/3} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>

        {/* Mozgatás terület */}
        <rect x={cropPx.x} y={cropPx.y} width={cropPx.w} height={cropPx.h}
          fill="transparent" style={{ cursor: 'move' }}
          onMouseDown={(e) => onMouseDown(e, 'move')}/>

        {/* Sarok + él fogók */}
        {handles.map(dir => {
          const [hx, hy] = handlePos(dir);
          const cursor = dir === 'n' || dir === 's' ? 'ns-resize'
            : dir === 'e' || dir === 'w' ? 'ew-resize'
            : dir === 'ne' || dir === 'sw' ? 'nesw-resize' : 'nwse-resize';
          return (
            <rect key={dir} x={hx-5} y={hy-5} width={10} height={10}
              fill="white" stroke="#3b82f6" strokeWidth="1.5" rx="2"
              style={{ cursor }} onMouseDown={(e) => onMouseDown(e, dir)}/>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FŐKOMPONENS
// ─────────────────────────────────────────────────────────────
export default function ImageEditorModal({ src, attrs, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('crop');
  const [imgObj,    setImgObj]    = useState(null);

  // Transzformációk
  const [rotation, setRotation] = useState(0);
  const [flipH,    setFlipH]    = useState(false);
  const [flipV,    setFlipV]    = useState(false);

  // Adjustments
  const [brightness,  setBrightness]  = useState(100);
  const [contrast,    setContrast]    = useState(100);
  const [saturation,  setSaturation]  = useState(100);

  // Crop (természetes px-ben)
  const [crop, setCrop] = useState(null);

  // Metadata
  const [alt,          setAlt]          = useState(attrs.alt  || '');
  const [caption,      setCaption]      = useState(attrs.caption || '');
  const [borderRadius, setBorderRadius] = useState(parseInt(attrs.borderRadius) || 0);
  const [borderWidth,  setBorderWidth]  = useState(parseInt(attrs.borderWidth)  || 0);
  const [borderColor,  setBorderColor]  = useState(attrs.borderColor || '#000000');

  // Preview URL (transzformált canvas → dataURL)
  const [previewUrl, setPreviewUrl] = useState(src);
  const workingCanvas = useRef(document.createElement('canvas'));

  // Kép betöltése
  useEffect(() => {
    loadImage(src).then((img) => {
      setImgObj(img);
      setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
    });
  }, [src]);

  // Preview frissítése ha transzformáció/adjustment változik
  useEffect(() => {
    if (!imgObj) return;
    const canvas = workingCanvas.current;
    renderToCanvas(canvas, imgObj, { rotation, flipH, flipV }, { brightness, contrast, saturation });
    setPreviewUrl(canvas.toDataURL('image/png'));
    // Crop reset ha méret változott (forgatás után)
    setCrop({ x: 0, y: 0, w: canvas.width, h: canvas.height });
  }, [imgObj, rotation, flipH, flipV, brightness, contrast, saturation]);

  const rotate = (deg) => setRotation((r) => (r + deg + 360) % 360);

  const handleSave = useCallback(() => {
    if (!imgObj) return;

    // 1. Transzformált canvas
    const canvas = workingCanvas.current;
    renderToCanvas(canvas, imgObj, { rotation, flipH, flipV }, { brightness, contrast, saturation });

    // 2. Crop alkalmazása
    const cropped = applyCrop(canvas, crop);

    // 3. Eredmény base64
    const newSrc = cropped.toDataURL('image/jpeg', 0.92);

    onSave({
      src: newSrc,
      alt,
      caption,
      borderRadius: borderRadius ? `${borderRadius}px` : '0px',
      borderWidth:  borderWidth  ? `${borderWidth}px`  : '0px',
      borderColor,
    });
  }, [imgObj, rotation, flipH, flipV, brightness, contrast, saturation, crop, alt, caption, borderRadius, borderWidth, borderColor, onSave]);

  const previewWrapperStyle = {
    borderRadius: `${borderRadius}px`,
    border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none',
    display: 'inline-block',
    overflow: 'hidden',
    maxWidth: '100%',
    maxHeight: '320px',
  };

  const previewImgStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    maxWidth: '100%',
    maxHeight: '320px',
    display: 'block',
  };

  return (
    <div className="ime-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ime-modal">

        {/* Fejléc */}
        <div className="ime-header">
          <span className="ime-header__title">🖼 Képszerkesztő</span>
          <button className="ime-header__close" onClick={onClose}>✕</button>
        </div>

        {/* Tabok */}
        <div className="ime-tabs">
          <Tab id="crop"   active={activeTab==='crop'}   icon="✂️" label="Vágás"      onClick={setActiveTab}/>
          <Tab id="adjust" active={activeTab==='adjust'} icon="🎨" label="Korrekció"  onClick={setActiveTab}/>
          <Tab id="meta"   active={activeTab==='meta'}   icon="⚙️" label="Beállítások" onClick={setActiveTab}/>
        </div>

        {/* Tartalom */}
        <div className="ime-body">

          {/* ── VÁGÁS tab ──────────────────────────────────── */}
          {activeTab === 'crop' && (
            <div className="ime-tab-content">
              <div className="ime-transform-btns">
                <button className="ime-btn" onClick={() => rotate(-90)} title="Forgatás balra">↺ -90°</button>
                <button className="ime-btn" onClick={() => rotate(90)}  title="Forgatás jobbra">↻ +90°</button>
                <button className={`ime-btn${flipH ? ' ime-btn--active' : ''}`} onClick={() => setFlipH(v => !v)} title="Vízszintes tükrözés">⇄ Flip H</button>
                <button className={`ime-btn${flipV ? ' ime-btn--active' : ''}`} onClick={() => setFlipV(v => !v)} title="Függőleges tükrözés">⇅ Flip V</button>
                {rotation !== 0 && (
                  <button className="ime-btn ime-btn--ghost" onClick={() => setRotation(0)}>Reset forgatás</button>
                )}
              </div>

              {crop && imgObj && (
                <CropCanvas
                  previewUrl={previewUrl}
                  crop={crop}
                  setCrop={setCrop}
                  imgNaturalW={workingCanvas.current.width  || imgObj.naturalWidth}
                  imgNaturalH={workingCanvas.current.height || imgObj.naturalHeight}
                />
              )}

              {crop && (
                <div className="ime-crop-info">
                  {crop.w} × {crop.h} px
                  <button className="ime-btn ime-btn--ghost ime-btn--sm" onClick={() => {
                    const c = workingCanvas.current;
                    setCrop({ x: 0, y: 0, w: c.width || imgObj?.naturalWidth, h: c.height || imgObj?.naturalHeight });
                  }}>Reset vágás</button>
                </div>
              )}
            </div>
          )}

          {/* ── KORREKCIÓ tab ───────────────────────────────── */}
          {activeTab === 'adjust' && (
            <div className="ime-tab-content">
              <div className="ime-preview-box">
                <div style={previewWrapperStyle}>
                  <img src={previewUrl} alt="" style={previewImgStyle} />
                </div>
              </div>

              <SliderRow label="Fényerő"   value={brightness}  min={0}   max={200} onChange={setBrightness}  unit="%"/>
              <SliderRow label="Kontraszt" value={contrast}    min={0}   max={200} onChange={setContrast}    unit="%"/>
              <SliderRow label="Telítettség" value={saturation} min={0}  max={200} onChange={setSaturation}  unit="%"/>

              <button className="ime-btn ime-btn--ghost" style={{ marginTop: 12 }} onClick={() => {
                setBrightness(100); setContrast(100); setSaturation(100);
              }}>Visszaállítás</button>
            </div>
          )}

          {/* ── BEÁLLÍTÁSOK tab ─────────────────────────────── */}
          {activeTab === 'meta' && (
            <div className="ime-tab-content">
              <div className="ime-preview-box">
                <div style={previewWrapperStyle}>
                  <img src={previewUrl} alt="" style={previewImgStyle} />
                </div>
              </div>

              <div className="ime-field">
                <label className="ime-label">Alt szöveg</label>
                <input className="ime-input" value={alt} onChange={(e) => setAlt(e.target.value)}
                  placeholder="Kép leírása (akadálymentesség)"/>
              </div>

              <div className="ime-field">
                <label className="ime-label">Caption (felirat)</label>
                <input className="ime-input" value={caption} onChange={(e) => setCaption(e.target.value)}
                  placeholder="Kép alatti felirat (elhagyható)"/>
              </div>

              <div className="ime-field-row">
                <div className="ime-field">
                  <label className="ime-label">Lekerekítés</label>
                  <SliderRow label="" value={borderRadius} min={0} max={120} onChange={setBorderRadius} unit="px"/>
                </div>
              </div>

              <div className="ime-field-row">
                <div className="ime-field" style={{ flex: 2 }}>
                  <label className="ime-label">Keret vastagság</label>
                  <SliderRow label="" value={borderWidth} min={0} max={20} onChange={setBorderWidth} unit="px"/>
                </div>
                <div className="ime-field">
                  <label className="ime-label">Keret szín</label>
                  <input type="color" className="ime-color" value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}/>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lábléc */}
        <div className="ime-footer">
          <button className="ime-btn ime-btn--ghost" onClick={onClose}>Mégse</button>
          <button className="ime-btn ime-btn--primary" onClick={handleSave}>✓ Alkalmaz</button>
        </div>
      </div>
    </div>
  );
}