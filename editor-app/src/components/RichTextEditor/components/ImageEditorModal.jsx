import React, { Component, createRef } from 'react';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function renderToCanvas(canvas, img, transform, adjustments) {
  const { rotation, flipH, flipV } = transform;
  const { brightness, contrast, saturation } = adjustments;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const w   = img.naturalWidth  * cos + img.naturalHeight * sin;
  const h   = img.naturalWidth  * sin + img.naturalHeight * cos;
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

function applyCrop(sourceCanvas, crop) {
  const { x, y, w, h } = crop;
  const out = document.createElement('canvas');
  out.width  = w;
  out.height = h;
  out.getContext('2d').drawImage(sourceCanvas, x, y, w, h, 0, 0, w, h);
  return out;
}

class Tab extends Component {
  render() {
    const { id, active, label, icon, onClick } = this.props;
    return (
      <button
        className={`ime-tab${active ? ' ime-tab--active' : ''}`}
        onClick={() => onClick(id)}
      >
        <span>{icon}</span> {label}
      </button>
    );
  }
}

class SliderRow extends Component {
  render() {
    const { label, value, min, max, step = 1, onChange, unit = '' } = this.props;
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
}

class CropCanvas extends Component {
  constructor(props) {
    super(props);
    this.state     = { displayW: 1, displayH: 1 };
    this.containerRef = createRef();
    this.dragging  = null;
    this.observer  = null;
  }

  componentDidMount() {
    const el = this.containerRef.current;
    if (!el) return;
    this.observer = new ResizeObserver(() => {
      const { width } = el.getBoundingClientRect();
      const scale = width / this.props.imgNaturalW;
      this.setState({ displayW: width, displayH: this.props.imgNaturalH * scale });
    });
    this.observer.observe(el);
  }

  componentWillUnmount() {
    this.observer?.disconnect();
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseup',   this._onUp);
  }

  onMouseDown(e, type) {
    e.preventDefault();
    const { displayW, displayH } = this.state;
    const scale   = displayW / this.props.imgNaturalW;
    const { crop } = this.props;
    const cropPx  = { x: crop.x * scale, y: crop.y * scale, w: crop.w * scale, h: crop.h * scale };

    this.dragging = { type, startX: e.clientX, startY: e.clientY, origCrop: cropPx };

    const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
    const toNatural = (px) => ({
      x: Math.round(px.x / scale), y: Math.round(px.y / scale),
      w: Math.round(px.w / scale), h: Math.round(px.h / scale),
    });

    this._onMove = (me) => {
      const dx = me.clientX - this.dragging.startX;
      const dy = me.clientY - this.dragging.startY;
      const orig = this.dragging.origCrop;
      let nx = orig.x, ny = orig.y, nw = orig.w, nh = orig.h;

      if (type === 'move') {
        nx = clamp(orig.x + dx, 0, displayW - orig.w);
        ny = clamp(orig.y + dy, 0, displayH - orig.h);
      } else {
        if (type.includes('e')) nw = clamp(orig.w + dx, 20, displayW - orig.x);
        if (type.includes('s')) nh = clamp(orig.h + dy, 20, displayH - orig.y);
        if (type.includes('w')) { nx = clamp(orig.x + dx, 0, orig.x + orig.w - 20); nw = orig.w - (nx - orig.x); }
        if (type.includes('n')) { ny = clamp(orig.y + dy, 0, orig.y + orig.h - 20); nh = orig.h - (ny - orig.y); }
      }
      this.props.setCrop(toNatural({ x: nx, y: ny, w: nw, h: nh }));
    };
    this._onUp = () => {
      window.removeEventListener('mousemove', this._onMove);
      window.removeEventListener('mouseup',   this._onUp);
    };
    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('mouseup',   this._onUp);
  }

  render() {
    const { previewUrl, crop, imgNaturalW } = this.props;
    const { displayW, displayH } = this.state;
    const scale  = displayW / imgNaturalW;
    const cropPx = { x: crop.x * scale, y: crop.y * scale, w: crop.w * scale, h: crop.h * scale };

    const handles = ['n','ne','e','se','s','sw','w','nw'];
    const handlePos = (dir) => {
      const cx = cropPx.x, cy = cropPx.y, cw = cropPx.w, ch = cropPx.h;
      const map = { n:[cx+cw/2,cy], ne:[cx+cw,cy], e:[cx+cw,cy+ch/2], se:[cx+cw,cy+ch],
                    s:[cx+cw/2,cy+ch], sw:[cx,cy+ch], w:[cx,cy+ch/2], nw:[cx,cy] };
      return map[dir];
    };

    return (
      <div ref={this.containerRef} className="ime-crop-container" style={{ height: displayH }}>
        <img src={previewUrl} alt="" className="ime-crop-img" draggable={false} />
        <svg className="ime-crop-overlay" width={displayW} height={displayH}>
          <defs>
            <mask id="crop-mask">
              <rect width="100%" height="100%" fill="white"/>
              <rect x={cropPx.x} y={cropPx.y} width={cropPx.w} height={cropPx.h} fill="black"/>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#crop-mask)"/>
          <rect x={cropPx.x} y={cropPx.y} width={cropPx.w} height={cropPx.h} fill="none" stroke="white" strokeWidth="1.5"/>
          <line x1={cropPx.x+cropPx.w/3} y1={cropPx.y} x2={cropPx.x+cropPx.w/3} y2={cropPx.y+cropPx.h} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <line x1={cropPx.x+2*cropPx.w/3} y1={cropPx.y} x2={cropPx.x+2*cropPx.w/3} y2={cropPx.y+cropPx.h} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <line x1={cropPx.x} y1={cropPx.y+cropPx.h/3} x2={cropPx.x+cropPx.w} y2={cropPx.y+cropPx.h/3} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <line x1={cropPx.x} y1={cropPx.y+2*cropPx.h/3} x2={cropPx.x+cropPx.w} y2={cropPx.y+2*cropPx.h/3} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <rect x={cropPx.x} y={cropPx.y} width={cropPx.w} height={cropPx.h} fill="transparent" style={{ cursor:'move' }} onMouseDown={(e) => this.onMouseDown(e,'move')}/>
          {handles.map(dir => {
            const [hx,hy] = handlePos(dir);
            const cursor = dir==='n'||dir==='s' ? 'ns-resize' : dir==='e'||dir==='w' ? 'ew-resize' : dir==='ne'||dir==='sw' ? 'nesw-resize' : 'nwse-resize';
            return <rect key={dir} x={hx-5} y={hy-5} width={10} height={10} fill="white" stroke="#3b82f6" strokeWidth="1.5" rx="2" style={{cursor}} onMouseDown={(e) => this.onMouseDown(e,dir)}/>;
          })}
        </svg>
      </div>
    );
  }
}

export default class ImageEditorModal extends Component {
  constructor(props) {
    super(props);
    const { attrs } = props;
    this.state = {
      activeTab:   'crop',
      imgObj:      null,
      rotation:    0,
      flipH:       false,
      flipV:       false,
      brightness:  100,
      contrast:    100,
      saturation:  100,
      crop:        null,
      alt:         attrs.alt         || '',
      caption:     attrs.caption     || '',
      borderRadius: parseInt(attrs.borderRadius) || 0,
      borderWidth:  parseInt(attrs.borderWidth)  || 0,
      borderColor:  attrs.borderColor || '#000000',
      previewUrl:   props.src,
    };
    this.workingCanvas = document.createElement('canvas');
  }

  componentDidMount() {
    loadImage(this.props.src).then((img) => {
      this.setState({
        imgObj: img,
        crop: { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight },
      }, () => this.updatePreview());
    });
  }

  componentDidUpdate(_, prevState) {
    const changed = ['rotation','flipH','flipV','brightness','contrast','saturation','imgObj']
      .some(k => this.state[k] !== prevState[k]);
    if (changed && this.state.imgObj) this.updatePreview();
  }

  updatePreview() {
    const { imgObj, rotation, flipH, flipV, brightness, contrast, saturation } = this.state;
    if (!imgObj) return;
    renderToCanvas(this.workingCanvas, imgObj, { rotation, flipH, flipV }, { brightness, contrast, saturation });
    this.setState({
      previewUrl: this.workingCanvas.toDataURL('image/png'),
      crop: { x: 0, y: 0, w: this.workingCanvas.width, h: this.workingCanvas.height },
    });
  }

  handleSave() {
    const { imgObj, rotation, flipH, flipV, brightness, contrast, saturation,
            crop, alt, caption, borderRadius, borderWidth, borderColor } = this.state;
    if (!imgObj) return;
    renderToCanvas(this.workingCanvas, imgObj, { rotation, flipH, flipV }, { brightness, contrast, saturation });
    const cropped = applyCrop(this.workingCanvas, crop);
    this.props.onSave({
      src: cropped.toDataURL('image/jpeg', 0.92),
      alt, caption,
      borderRadius: borderRadius ? `${borderRadius}px` : '0px',
      borderWidth:  borderWidth  ? `${borderWidth}px`  : '0px',
      borderColor,
    });
  }

  rotate(deg) {
    this.setState(s => ({ rotation: (s.rotation + deg + 360) % 360 }));
  }

  render() {
    const { onClose } = this.props;
    const {
      activeTab, previewUrl, crop, imgObj,
      rotation, flipH, flipV, brightness, contrast, saturation,
      alt, caption, borderRadius, borderWidth, borderColor,
    } = this.state;

    const previewWrapperStyle = {
      borderRadius: `${borderRadius}px`,
      border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none',
      display: 'inline-block', overflow: 'hidden', maxWidth: '100%', maxHeight: '320px',
    };
    const previewImgStyle = {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
      maxWidth: '100%', maxHeight: '320px', display: 'block',
    };

    return (
      <div className="ime-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="ime-modal">
          <div className="ime-header">
            <span className="ime-header__title">🖼 Képszerkesztő</span>
            <button className="ime-header__close" onClick={onClose}>✕</button>
          </div>

          <div className="ime-tabs">
            <Tab id="crop"   active={activeTab==='crop'}   icon="✂️" label="Vágás"       onClick={(id) => this.setState({ activeTab: id })}/>
            <Tab id="adjust" active={activeTab==='adjust'} icon="🎨" label="Korrekció"   onClick={(id) => this.setState({ activeTab: id })}/>
            <Tab id="meta"   active={activeTab==='meta'}   icon="⚙️" label="Beállítások" onClick={(id) => this.setState({ activeTab: id })}/>
          </div>

          <div className="ime-body">

            {activeTab === 'crop' && (
              <div className="ime-tab-content">
                <div className="ime-transform-btns">
                  <button className="ime-btn" onClick={() => this.rotate(-90)}>↺ -90°</button>
                  <button className="ime-btn" onClick={() => this.rotate(90)}>↻ +90°</button>
                  <button className={`ime-btn${flipH ? ' ime-btn--active' : ''}`} onClick={() => this.setState(s => ({ flipH: !s.flipH }))}>⇄ Flip H</button>
                  <button className={`ime-btn${flipV ? ' ime-btn--active' : ''}`} onClick={() => this.setState(s => ({ flipV: !s.flipV }))}>⇅ Flip V</button>
                  {rotation !== 0 && <button className="ime-btn ime-btn--ghost" onClick={() => this.setState({ rotation: 0 })}>Reset forgatás</button>}
                </div>
                {crop && imgObj && (
                  <CropCanvas
                    previewUrl={previewUrl}
                    crop={crop}
                    setCrop={(c) => this.setState({ crop: c })}
                    imgNaturalW={this.workingCanvas.width  || imgObj.naturalWidth}
                    imgNaturalH={this.workingCanvas.height || imgObj.naturalHeight}
                  />
                )}
                {crop && (
                  <div className="ime-crop-info">
                    {crop.w} × {crop.h} px
                    <button className="ime-btn ime-btn--ghost ime-btn--sm" onClick={() => {
                      const c = this.workingCanvas;
                      this.setState({ crop: { x:0, y:0, w: c.width || imgObj?.naturalWidth, h: c.height || imgObj?.naturalHeight } });
                    }}>Reset vágás</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className="ime-tab-content">
                <div className="ime-preview-box">
                  <div style={previewWrapperStyle}><img src={previewUrl} alt="" style={previewImgStyle}/></div>
                </div>
                <SliderRow label="Fényerő"     value={brightness} min={0} max={200} onChange={(v) => this.setState({ brightness: v })}  unit="%"/>
                <SliderRow label="Kontraszt"   value={contrast}   min={0} max={200} onChange={(v) => this.setState({ contrast: v })}    unit="%"/>
                <SliderRow label="Telítettség" value={saturation} min={0} max={200} onChange={(v) => this.setState({ saturation: v })}  unit="%"/>
                <button className="ime-btn ime-btn--ghost" style={{ marginTop: 12 }}
                  onClick={() => this.setState({ brightness: 100, contrast: 100, saturation: 100 })}>Visszaállítás</button>
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="ime-tab-content">
                <div className="ime-preview-box">
                  <div style={previewWrapperStyle}><img src={previewUrl} alt="" style={previewImgStyle}/></div>
                </div>
                <div className="ime-field">
                  <label className="ime-label">Alt szöveg</label>
                  <input className="ime-input" value={alt} onChange={(e) => this.setState({ alt: e.target.value })} placeholder="Kép leírása"/>
                </div>
                <div className="ime-field">
                  <label className="ime-label">Caption (felirat)</label>
                  <input className="ime-input" value={caption} onChange={(e) => this.setState({ caption: e.target.value })} placeholder="Kép alatti felirat"/>
                </div>
                <div className="ime-field-row">
                  <div className="ime-field">
                    <label className="ime-label">Lekerekítés</label>
                    <SliderRow label="" value={borderRadius} min={0} max={120} onChange={(v) => this.setState({ borderRadius: v })} unit="px"/>
                  </div>
                </div>
                <div className="ime-field-row">
                  <div className="ime-field" style={{ flex: 2 }}>
                    <label className="ime-label">Keret vastagság</label>
                    <SliderRow label="" value={borderWidth} min={0} max={20} onChange={(v) => this.setState({ borderWidth: v })} unit="px"/>
                  </div>
                  <div className="ime-field">
                    <label className="ime-label">Keret szín</label>
                    <input type="color" className="ime-color" value={borderColor} onChange={(e) => this.setState({ borderColor: e.target.value })}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ime-footer">
            <button className="ime-btn ime-btn--ghost" onClick={onClose}>Mégse</button>
            <button className="ime-btn ime-btn--primary" onClick={() => this.handleSave()}>✓ Alkalmaz</button>
          </div>
        </div>
      </div>
    );
  }
}