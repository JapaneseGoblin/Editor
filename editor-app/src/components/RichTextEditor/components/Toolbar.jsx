import React, { useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { Image as ImageIcon, Link as LinkIcon, Upload, Undo2, Redo2, Save, Download } from 'lucide-react';
import { TOOLBAR_GROUPS, FONT_FAMILIES, FONT_SIZES } from '../config/toolbar';
import ToolbarGroup from './ToolbarGroup';
import ToolbarButton from './ToolbarButton';
import TablePicker from './TablePicker';
import ColumnPicker from './ColumnPicker';
import ColorPicker from './ColorPicker';
import { applyParaBg } from '../utils/applyParaBg';
import {
  IconRowAdd, IconRowDel, IconColAdd, IconColDel,
  IconMerge, IconTblDel, IconVideo, IconBgColor,
} from './toolbarIcons';

const TAB_KEZDOLAP = 'kezdolap';
const TAB_BESZURAS = 'beszuras';
const TAB_TABLAZAT = 'tablazat';

const KEZDOLAP_GROUP_IDS = ['format', 'heading', 'align', 'list', 'insert'];

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

      <div className="rte-ribbon__quickbar">
        <button className="rte-ribbon__quick-btn" title="Visszavonás" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={14} /></button>
        <button className="rte-ribbon__quick-btn" title="Újra"        onClick={() => editor.chain().focus().redo().run()}><Redo2 size={14} /></button>
        <div className="rte-ribbon__quick-divider" />
        <button className="rte-ribbon__quick-btn" title="Mentés"              onClick={onSaveNow}>   <Save     size={14} /></button>
        <button className="rte-ribbon__quick-btn" title="Letöltés JSON-ként" onClick={onExportJSON}><Download size={14} /></button>
        <button className="rte-ribbon__quick-btn" title="JSON betöltése"      onClick={onImportJSON}><Upload   size={14} /></button>
      </div>

      <div className="rte-ribbon__tabs">
        {tabs.map(tab => (
          <button key={tab.id}
            className={`rte-ribbon__tab${activeTab === tab.id ? ' rte-ribbon__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >{tab.label}</button>
        ))}
      </div>

      <div className="rte-ribbon__bar">

        {activeTab === TAB_KEZDOLAP && (
          <>
            <div className="rte-toolbar-group">
              <select className="rte-toolbar-select" value={fontFamily}
                onChange={(e) => e.target.value ? editor.chain().focus().setFontFamily(e.target.value).run() : editor.chain().focus().unsetFontFamily().run()}>
                {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <select className="rte-toolbar-select rte-toolbar-select--size" value={fontSize}
                onChange={(e) => e.target.value ? editor.chain().focus().setFontSize(e.target.value).run() : editor.chain().focus().unsetFontSize().run()}>
                <option value="">Méret</option>
                {FONT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="rte-toolbar-divider" />

            {TOOLBAR_GROUPS.filter(g => KEZDOLAP_GROUP_IDS.includes(g.id)).map((group, i, arr) => (
              <React.Fragment key={group.id}>
                <ToolbarGroup group={group} editor={editor} onLinkClick={onSetLink} />
                {i < arr.length - 1 && <div className="rte-toolbar-divider" />}
              </React.Fragment>
            ))}

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Szín</div>
              <div className="rte-toolbar-group">
                <ColorPicker label="A" title="Betűszín"
                  onSelect={(c) => editor.chain().focus().setColor(c).run()}
                  onClear={() => editor.chain().focus().unsetColor().run()} />
                <ColorPicker label={<span style={{ background: '#fde68a', padding: '0 2px' }}>A</span>} title="Szöveg kiemelése"
                  onSelect={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
                  onClear={() => editor.chain().focus().unsetHighlight().run()} />
                <ColorPicker label="¶" title="Bekezdés háttérszíne"
                  onSelect={(c) => { applyParaBg(editor, c); }}
                  onClear={() => applyParaBg(editor, null)}
                  keepOpen />
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Oldal</div>
              <div className="rte-toolbar-group">
                <ColorPicker label={<IconBgColor />} title="Oldal háttérszíne"
                  currentColor={bgColor}
                  onSelect={(c) => onBgColorChange(c)}
                  onClear={() => onBgColorChange('#ffffff')} />
              </div>
            </div>
          </>
        )}

        {activeTab === TAB_BESZURAS && (
          <>
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Média</div>
              <div className="rte-toolbar-group">
                <ToolbarButton icon={ImageIcon} tooltip="Kép URL-ből"           onClick={onAddImageByUrl}  active={false} />
                <ToolbarButton icon={Upload}    tooltip="Kép feltöltése gépről" onClick={onAddImageByFile} active={false} />
                <button className="rte-toolbar-btn" title="Videó" onClick={onAddVideo}><IconVideo /></button>
                <ToolbarButton icon={LinkIcon}  tooltip="Link" onClick={onSetLink} active={editor.isActive('link')} />
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Táblázat</div>
              <div className="rte-toolbar-group">
                <TablePicker onInsert={(rows, cols) => editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()} />
              </div>
            </div>

            <div className="rte-toolbar-divider" />

            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Hasábok</div>
              <div className="rte-toolbar-group">
                <ColumnPicker inColumns={inColumns} columnCount={columnCount} onApply={handleColumns} />
              </div>
            </div>
          </>
        )}

        {activeTab === TAB_TABLAZAT && inTable && (
          <>
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Sorok</div>
              <div className="rte-toolbar-group">
                <button className="rte-toolbar-btn" title="Sor hozzáadása" onClick={() => editor.chain().focus().addRowAfter().run()}><IconRowAdd /></button>
                <button className="rte-toolbar-btn" title="Sor törlése"    onClick={() => editor.chain().focus().deleteRow().run()}><IconRowDel /></button>
              </div>
            </div>
            <div className="rte-toolbar-divider" />
            <div className="rte-ribbon__section">
              <div className="rte-ribbon__section-label">Oszlopok</div>
              <div className="rte-toolbar-group">
                <button className="rte-toolbar-btn" title="Oszlop hozzáadása" onClick={() => editor.chain().focus().addColumnAfter().run()}><IconColAdd /></button>
                <button className="rte-toolbar-btn" title="Oszlop törlése"    onClick={() => editor.chain().focus().deleteColumn().run()}><IconColDel /></button>
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