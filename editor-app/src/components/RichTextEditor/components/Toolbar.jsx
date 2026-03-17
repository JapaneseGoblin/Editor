import React, { useState, useRef, useEffect } from 'react';
import { useEditorState } from '@tiptap/react';
import { Image as ImageIcon, Link as LinkIcon, Upload, Undo2, Redo2, Save, Download } from 'lucide-react';
import { TOOLBAR_GROUPS, FONT_FAMILIES, FONT_SIZES } from '../config/toolbar';
import ToolbarGroup from './ToolbarGroup';
import ToolbarButton from './ToolbarButton';
import TablePicker from './TablePicker';

// ── Ikonok ────────────────────────────────────────────────────
const SaveIcon     = () => <Save size={14} />;
const DownloadIcon = () => <Download size={14} />;
const UploadIcon   = () => <Upload size={14} />;
const Col2Icon    = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="6" height="12" rx="1.5"/><rect x="9" y="2" width="6" height="12" rx="1.5" opacity=".5"/></svg>;
const IconRowAdd  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="10" y1="18" x2="14" y2="18"/></svg>;
const IconRowDel  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>;
const IconColAdd  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="16" y1="12" x2="20" y2="12"/><line x1="18" y1="10" x2="18" y2="14"/></svg>;
const IconColDel  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="16" y1="12" x2="20" y2="12"/></svg>;
const IconMerge   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="9"/><line x1="15" y1="3" x2="15" y2="9"/><line x1="9" y1="15" x2="9" y2="21"/><line x1="15" y1="15" x2="15" y2="21"/></svg>;
const IconTblDel  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>;
const IconVideo   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="15" height="16" rx="2"/><polygon points="22 12 16 8 16 16 22 12" fill="currentColor" stroke="none"/></svg>;
const IconBgColor = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>;

// Kezdőlap tab – szövegformázás
const TAB_KEZDOLAP = 'kezdolap';
// Beszúrás tab – kép, videó, táblázat, hasáb, link
const TAB_BESZURAS = 'beszuras';
// Táblázat tab – dinamikusan jelenik meg ha táblázatban van a kurzor
const TAB_TABLAZAT = 'tablazat';

// A config-ból ezek kerülnek a Kezdőlapra
const KEZDOLAP_GROUP_IDS = ['format', 'heading', 'align', 'list', 'insert'];

// ── Bekezdés háttérszín helper ────────────────────────────────
function applyParaBg(editor, color) {
  const { state, view } = editor;
  const { tr, selection } = state;
  const { from, to } = selection;
  let changed = false;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        backgroundColor: color || null,
      });
      changed = true;
    }
  });

  if (changed) view.dispatch(tr);
}

// ── ColumnPicker ──────────────────────────────────────────────
function ColumnPicker({ inColumns, columnCount, onApply }) {
  const [open,  setOpen]  = useState(false);
  const [input, setInput] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const apply = (n) => {
    onApply(n);
    setOpen(false);
    setInput('');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="rte-col-picker-btn">
        {/* Fő gomb: kattintásra 2 hasáb (vagy felold ha már aktív) */}
        <button
          className={`rte-toolbar-btn rte-col-picker-btn__main${inColumns ? ' rte-toolbar-btn--active' : ''}`}
          title={inColumns ? 'Hasábok feloldása' : '2 hasáb beillesztése'}
          onClick={() => onApply(inColumns ? (columnCount === 2 ? 2 : columnCount) : 2)}
        >
          <Col2Icon />
          <span className="rte-col-picker-btn__label">{inColumns ? columnCount : ''}</span>
        </button>
        {/* Nyíl: lenyitja a dropdownt */}
        <button
          className="rte-col-picker-btn__arrow"
          title="Egyéni hasábszám"
          onClick={() => { setOpen(v => !v); setInput(''); }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="rte-col-picker-dropdown">
          <div className="rte-col-picker-dropdown__title">Hasábok száma</div>
          <div className="rte-col-picker-dropdown__presets">
            {[1,2,3,4].map(n => (
              <button
                key={n}
                className={`rte-col-picker-dropdown__preset${inColumns && columnCount === n ? ' active' : ''}`}
                onClick={() => apply(n)}
              >{n}</button>
            ))}
          </div>
          <div className="rte-col-picker-dropdown__divider" />
          <div className="rte-col-picker-dropdown__custom">
            <input
              type="number"
              min="1"
              max="12"
              placeholder="Egyéni..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { const n = parseInt(input); if (n >= 1 && n <= 12) apply(n); }}}
              className="rte-col-picker-dropdown__input"
              autoFocus
            />
            <button
              className="rte-col-picker-dropdown__ok"
              onClick={() => { const n = parseInt(input); if (n >= 1 && n <= 12) apply(n); }}
            >OK</button>
          </div>
          {inColumns && (
            <>
              <div className="rte-col-picker-dropdown__divider" />
              <button className="rte-col-picker-dropdown__remove" onClick={() => apply(columnCount)}>
                Hasábok feloldása
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Toolbar({ editor, onSetLink, onAddImageByUrl, onAddImageByFile, onAddVideo, bgColor, onBgColorChange, onSaveNow, onExportJSON, onImportJSON }) {
  const [activeTab, setActiveTab] = useState(TAB_KEZDOLAP);

  const { fontFamily, fontSize, inColumns, columnCount, inTable } = useEditorState({
    editor,
    selector: (ctx) => ({
      fontFamily:  ctx.editor.getAttributes('textStyle').fontFamily || '',
      fontSize:    ctx.editor.getAttributes('textStyle').fontSize   || '',
      inColumns:   ctx.editor.isActive('columns'),
      columnCount: ctx.editor.getAttributes('columns').count || 0,
      inTable:     ctx.editor.isActive('table'),
    }),
  });

  // Ha táblázatban vagyunk, automatikusan mutassuk a Táblázat tabot
  React.useEffect(() => {
    if (inTable) setActiveTab(TAB_TABLAZAT);
    else if (activeTab === TAB_TABLAZAT) setActiveTab(TAB_KEZDOLAP);
  }, [inTable]); // eslint-disable-line

  if (!editor) return null;

  const handleColumns = (count) => {
    if (!inColumns) editor.chain().focus().insertColumns(count).run();
    else if (columnCount === count) editor.chain().focus().removeColumns().run();
    else editor.chain().focus().setColumnsCount(count).run();
  };

  const tabs = [
    { id: TAB_KEZDOLAP, label: 'Kezdőlap' },
    { id: TAB_BESZURAS, label: 'Beszúrás' },
    ...(inTable ? [{ id: TAB_TABLAZAT, label: '⊞ Táblázat' }] : []),
  ];

  return (
    <div className="rte-ribbon">
      {/* Gyors elérés – mindig látható */}
      <div className="rte-ribbon__quickbar">
        <button className="rte-ribbon__quick-btn" title="Visszavonás" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={14} />
        </button>
        <button className="rte-ribbon__quick-btn" title="Újra" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={14} />
        </button>
        <div className="rte-ribbon__quick-divider" />
        <div className="rte-ribbon__quick-divider" />
        <button className="rte-ribbon__quick-btn" title="Mentés (Ctrl+S)" onClick={onSaveNow}>
          <SaveIcon />
        </button>
        <button className="rte-ribbon__quick-btn" title="Letöltés JSON-ként" onClick={onExportJSON}>
          <DownloadIcon />
        </button>
        <button className="rte-ribbon__quick-btn" title="JSON betöltése" onClick={onImportJSON}>
          <UploadIcon />
        </button>
      </div>

      {/* Tab fejléc */}
      <div className="rte-ribbon__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`rte-ribbon__tab${activeTab === tab.id ? ' rte-ribbon__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab tartalom */}
      <div className="rte-ribbon__bar">

        {/* ── KEZDŐLAP ── */}
        {activeTab === TAB_KEZDOLAP && (
          <>
            {/* Betűtípus + méret */}
            <div className="rte-toolbar-group">
              <select className="rte-toolbar-select" value={fontFamily}
                onChange={(e) => e.target.value
                  ? editor.chain().focus().setFontFamily(e.target.value).run()
                  : editor.chain().focus().unsetFontFamily().run()}>
                {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <select className="rte-toolbar-select rte-toolbar-select--size" value={fontSize}
                onChange={(e) => e.target.value
                  ? editor.chain().focus().setFontSize(e.target.value).run()
                  : editor.chain().focus().unsetFontSize().run()}>
                <option value="">Méret</option>
                {FONT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="rte-toolbar-divider" />

            {/* Formázás, Fejlécek, Igazítás, Lista, Egyéb */}
            {TOOLBAR_GROUPS.filter(g => KEZDOLAP_GROUP_IDS.includes(g.id)).map((group, i, arr) => (
              <React.Fragment key={group.id}>
                <ToolbarGroup group={group} editor={editor} onLinkClick={onSetLink} />
                {i < arr.length - 1 && <div className="rte-toolbar-divider" />}
              </React.Fragment>
            ))}

            <div className="rte-toolbar-divider" />

            {/* Színek */}
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Szín</div>
              <div className="rte-toolbar-group">
                <label className="rte-toolbar-color" title="Betűszín">
                  <span className="rte-toolbar-color__label">A</span>
                  <input type="color" defaultValue="#000000" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
                </label>
                <label className="rte-toolbar-color" title="Kijelölt szöveg kiemelése">
                  <span className="rte-toolbar-color__label" style={{ background: '#fde68a' }}>A</span>
                  <input type="color" defaultValue="#fde68a" onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()} />
                </label>
                <label className="rte-toolbar-color" title="Bekezdés háttérszíne (teljes sor)">
                  <span className="rte-toolbar-color__label rte-toolbar-color__label--para">¶</span>
                  <input type="color" defaultValue="#4a7fa5"
                    onChange={(e) => applyParaBg(editor, e.target.value)} />
                </label>
                <button
                  className="rte-toolbar-btn"
                  title="Bekezdés háttér törlése"
                  style={{ fontSize: 11, width: 26 }}
                  onClick={() => applyParaBg(editor, null)}
                >✕¶</button>
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            {/* Oldal háttérszín */}
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Oldal</div>
              <div className="rte-toolbar-group">
                <label className="rte-toolbar-color" title="Oldal háttérszíne">
                  <IconBgColor />
                  <input type="color" value={bgColor || '#ffffff'} onChange={(e) => onBgColorChange(e.target.value)} />
                </label>
              </div>
            </div>
          </>
        )}

        {/* ── BESZÚRÁS ── */}
        {activeTab === TAB_BESZURAS && (
          <>
            {/* Kép + Videó + Link */}
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Média</div>
              <div className="rte-toolbar-group">
                <ToolbarButton icon={ImageIcon} tooltip="Kép URL-ből"           onClick={onAddImageByUrl}  active={false} />
                <ToolbarButton icon={Upload}    tooltip="Kép feltöltése gépről" onClick={onAddImageByFile} active={false} />
                <button className="rte-toolbar-btn" title="Videó beillesztése" onClick={onAddVideo}><IconVideo /></button>
                <ToolbarButton icon={LinkIcon}  tooltip="Link"                  onClick={onSetLink}        active={editor.isActive('link')} />
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            {/* Táblázat */}
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Táblázat</div>
              <div className="rte-toolbar-group">
                <TablePicker onInsert={(rows, cols) =>
                  editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
                } />
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            {/* Hasábok */}
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Hasábok</div>
              <div className="rte-toolbar-group">
                <ColumnPicker
                  inColumns={inColumns}
                  columnCount={columnCount}
                  onApply={handleColumns}
                />
              </div>
            </div>


          </>
        )}

        {/* ── TÁBLÁZAT (csak ha benne van) ── */}
        {activeTab === TAB_TABLAZAT && inTable && (
          <>
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Sorok</div>
              <div className="rte-toolbar-group">
                <button className="rte-toolbar-btn" title="Sor hozzáadása alá" onClick={() => editor.chain().focus().addRowAfter().run()}><IconRowAdd /></button>
                <button className="rte-toolbar-btn" title="Sor törlése"        onClick={() => editor.chain().focus().deleteRow().run()}><IconRowDel /></button>
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Oszlopok</div>
              <div className="rte-toolbar-group">
                <button className="rte-toolbar-btn" title="Oszlop hozzáadása" onClick={() => editor.chain().focus().addColumnAfter().run()}><IconColAdd /></button>
                <button className="rte-toolbar-btn" title="Oszlop törlése"   onClick={() => editor.chain().focus().deleteColumn().run()}><IconColDel /></button>
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Cellák</div>
              <div className="rte-toolbar-group">
                <button className="rte-toolbar-btn" title="Összevonás" onClick={() => editor.chain().focus().mergeCells().run()}><IconMerge /></button>
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Táblázat</div>
              <div className="rte-toolbar-group">
                <button className="rte-toolbar-btn" title="Táblázat törlése" onClick={() => editor.chain().focus().deleteTable().run()}><IconTblDel /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}