import React from 'react';
import { useEditorState } from '@tiptap/react';
import { Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react';
import { TOOLBAR_GROUPS, FONT_FAMILIES, FONT_SIZES } from '../config/toolbar';
import ToolbarGroup from './ToolbarGroup';
import ToolbarButton from './ToolbarButton';

export default function Toolbar({ editor, onSetLink, onAddImageByUrl, onAddImageByFile }) {
  const { fontFamily, fontSize } = useEditorState({
    editor,
    selector: (ctx) => ({
      fontFamily: ctx.editor.getAttributes('textStyle').fontFamily || '',
      fontSize:   ctx.editor.getAttributes('textStyle').fontSize   || '',
    }),
  });

  if (!editor) return null;

  return (
    <div className="rte-toolbar">
      {TOOLBAR_GROUPS.map((group, index) => (
        <React.Fragment key={group.id}>
          <ToolbarGroup group={group} editor={editor} onLinkClick={onSetLink} />
          {index < TOOLBAR_GROUPS.length - 1 && (
            <div className="rte-toolbar-divider" />
          )}
        </React.Fragment>
      ))}

      <div className="rte-toolbar-divider" />

      <div className="rte-toolbar-group">
        <ToolbarButton icon={LinkIcon}  tooltip="Link beszúrása"       onClick={onSetLink}        active={editor.isActive('link')} />
        <ToolbarButton icon={ImageIcon} tooltip="Kép URL-ből"          onClick={onAddImageByUrl}  active={false} />
        <ToolbarButton icon={Upload}    tooltip="Kép feltöltése gépről" onClick={onAddImageByFile} active={false} />
      </div>

      <div className="rte-toolbar-divider" />

      <div className="rte-toolbar-group">
        <select
          className="rte-toolbar-select"
          value={fontFamily}
          onChange={(e) => {
            e.target.value
              ? editor.chain().focus().setFontFamily(e.target.value).run()
              : editor.chain().focus().unsetFontFamily().run();
          }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          className="rte-toolbar-select rte-toolbar-select--size"
          value={fontSize}
          onChange={(e) => {
            e.target.value
              ? editor.chain().focus().setFontSize(e.target.value).run()
              : editor.chain().focus().unsetFontSize().run();
          }}
        >
          <option value="">Méret</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="rte-toolbar-divider" />

      <div className="rte-toolbar-group">
        <label className="rte-toolbar-color" title="Betűszín">
          <span className="rte-toolbar-color__label">A</span>
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
        <label className="rte-toolbar-color" title="Kiemelőszín">
          <span className="rte-toolbar-color__label" style={{ background: '#fde68a' }}>A</span>
          <input
            type="color"
            defaultValue="#fde68a"
            onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
          />
        </label>
      </div>
    </div>
  );
}