import { useState, type ReactNode } from 'react';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import {
  Box, Tabs, Tab, Divider, Select, MenuItem,
  Tooltip, IconButton, Typography, useMediaQuery, useTheme,
  Switch, FormControlLabel,
} from '@mui/material';
import { setAutocompleteEnabled } from '../extensions/AIAutocomplete';
import {
  Undo2, Redo2, Save, Download, Upload,
  Image as ImageIcon, Link as LinkIcon,
} from 'lucide-react';
import { TOOLBAR_GROUPS, FONT_FAMILIES, FONT_SIZES } from '../config/toolbar';
import ToolbarGroup from './ToolbarGroup';
import ToolbarButton from './ToolbarButton';
import TablePicker from './TablePicker';
import ColumnPicker from './ColumnPicker';
import ColorPicker from './ColorPicker';
import { applyParaBg } from '../utils/applyParaBg';
import { IconRowAdd, IconRowDel, IconColAdd, IconColDel, IconMerge, IconTblDel, IconVideo, IconBgColor } from './toolbarIcons';

const TAB_KEZDOLAP = 'kezdolap';
const TAB_BESZURAS = 'beszuras';
const TAB_TABLAZAT = 'tablazat';
const KEZDOLAP_GROUP_IDS = ['format', 'heading', 'align', 'list', 'insert'];

interface ToolbarProps {
  editor: Editor;
  onSetLink: () => void;
  onAddImageByUrl: () => void;
  onAddImageByFile: () => void;
  onAddVideo: () => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  onSaveNow: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
}

function QuickBtn({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip title={title} placement="top" arrow>
      <IconButton size="small" onClick={onClick}
        sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
        {children}
      </IconButton>
    </Tooltip>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography variant="caption" color="text.disabled"
      sx={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.25 }}>
      {children}
    </Typography>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <SectionLabel>{label}</SectionLabel>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>{children}</Box>
    </Box>
  );
}

export default function Toolbar({
  editor, onSetLink, onAddImageByUrl, onAddImageByFile, onAddVideo,
  bgColor, onBgColorChange, onSaveNow, onExportJSON, onImportJSON,
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState(TAB_KEZDOLAP);
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { fontFamily, fontSize, inColumns, columnCount, inTable } = useEditorState({
    editor,
    selector: (ctx) => ({
      fontFamily:  ctx.editor.getAttributes('textStyle').fontFamily as string || '',
      fontSize:    ctx.editor.getAttributes('textStyle').fontSize   as string || '',
      inColumns:   ctx.editor.isActive('columns'),
      columnCount: (ctx.editor.getAttributes('columns').count as number) || 0,
      inTable:     ctx.editor.isActive('table'),
    }),
  });

  // Derived: ha táblázatban vagyunk, automatikusan táblázat tab; ha kilépünk, kezdőlap
  const effectiveTab = inTable
    ? TAB_TABLAZAT
    : activeTab === TAB_TABLAZAT
      ? TAB_KEZDOLAP
      : activeTab;

  const handleColumns = (count: number) => {
    if (!inColumns) editor.chain().focus().insertColumns(count).run();
    else if (columnCount === count) editor.chain().focus().removeColumns().run();
    else editor.chain().focus().setColumnsCount(count).run();
  };

  const tabList = [
    { id: TAB_KEZDOLAP, label: 'Kezdőlap' },
    { id: TAB_BESZURAS, label: 'Beszúrás' },
    ...(inTable ? [{ id: TAB_TABLAZAT, label: '⊞ Táblázat' }] : []),
  ];

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>

      {/* Gyorselérés */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <QuickBtn title="Visszavonás" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={14} /></QuickBtn>
        <QuickBtn title="Újra"        onClick={() => editor.chain().focus().redo().run()}><Redo2 size={14} /></QuickBtn>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <QuickBtn title="Mentés"               onClick={onSaveNow}>   <Save     size={14} /></QuickBtn>
        <QuickBtn title="Letöltés JSON-ként"   onClick={onExportJSON}><Download  size={14} /></QuickBtn>
        <QuickBtn title="JSON betöltése"        onClick={onImportJSON}><Upload   size={14} /></QuickBtn>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="AI autocomplete be/ki" placement="top" arrow>
          <FormControlLabel
            control={
              <Switch
                size="small"
                onChange={(e) => setAutocompleteEnabled(e.target.checked)}
              />
            }
            label={<Typography variant="caption" sx={{ fontSize: 11 }}>AI</Typography>}
            sx={{ m: 0, gap: 0.5 }}
          />
        </Tooltip>
      </Box>

      {/* Tabok */}
      <Tabs value={effectiveTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ minHeight: 32, px: 1, '& .MuiTab-root': { minHeight: 32, py: 0.5, px: 1.5, fontSize: 12 } }}>
        {tabList.map(t => <Tab key={t.id} value={t.id} label={t.label} />)}
      </Tabs>

      {/* Tab tartalom */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1, px: 1, py: 0.75, overflowX: 'auto' }}>

        {effectiveTab === TAB_KEZDOLAP && (
          <>
            {/* Betűtípus + méret */}
            {!isMobile && (
              <>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Select size="small" value={fontFamily} displayEmpty sx={{ fontSize: 12, height: 28, minWidth: 130 }}
                    onChange={(e) => e.target.value ? editor.chain().focus().setFontFamily(e.target.value).run() : editor.chain().focus().unsetFontFamily().run()}>
                    {FONT_FAMILIES.map(f => <MenuItem key={f.value} value={f.value} sx={{ fontSize: 12 }}>{f.label}</MenuItem>)}
                  </Select>
                  <Select size="small" value={fontSize} displayEmpty sx={{ fontSize: 12, height: 28, minWidth: 70 }}
                    onChange={(e) => e.target.value ? editor.chain().focus().setFontSize(e.target.value).run() : editor.chain().focus().unsetFontSize().run()}>
                    <MenuItem value="" sx={{ fontSize: 12 }}>Méret</MenuItem>
                    {FONT_SIZES.map(s => <MenuItem key={s.value} value={s.value} sx={{ fontSize: 12 }}>{s.label}</MenuItem>)}
                  </Select>
                </Box>
                <Divider orientation="vertical" flexItem />
              </>
            )}

            {TOOLBAR_GROUPS.filter(g => KEZDOLAP_GROUP_IDS.includes(g.id)).map((group, i, arr) => (
              <Box key={group.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ToolbarGroup group={group} editor={editor} onLinkClick={onSetLink} />
                {i < arr.length - 1 && <Divider orientation="vertical" flexItem />}
              </Box>
            ))}

            <Divider orientation="vertical" flexItem />

            <Section label="Szín">
              <ColorPicker label="A" title="Betűszín"
                onSelect={(c) => editor.chain().focus().setColor(c).run()}
                onClear={() => editor.chain().focus().unsetColor().run()} />
              <ColorPicker label={<span style={{ background: '#fde68a', padding: '0 2px' }}>A</span>} title="Szöveg kiemelése"
                onSelect={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
                onClear={() => editor.chain().focus().unsetHighlight().run()} />
              <ColorPicker label="¶" title="Bekezdés háttérszíne"
                onSelect={(c) => applyParaBg(editor, c)}
                onClear={() => applyParaBg(editor, null)}
                keepOpen />
            </Section>

            <Divider orientation="vertical" flexItem />

            <Section label="Oldal">
              <ColorPicker label={<IconBgColor />} title="Oldal háttérszíne"
                currentColor={bgColor}
                onSelect={(c) => onBgColorChange(c)}
                onClear={() => onBgColorChange('#ffffff')} />
            </Section>
          </>
        )}

        {effectiveTab === TAB_BESZURAS && (
          <>
            <Section label="Média">
              <ToolbarButton icon={ImageIcon} tooltip="Kép URL-ből"           onClick={onAddImageByUrl}  active={false} />
              <ToolbarButton icon={Upload}    tooltip="Kép feltöltése gépről" onClick={onAddImageByFile} active={false} />
              <Tooltip title="Videó" placement="top" arrow>
                <IconButton size="small" onClick={onAddVideo}
                  sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                  <IconVideo />
                </IconButton>
              </Tooltip>
              <ToolbarButton icon={LinkIcon} tooltip="Link" onClick={onSetLink} active={editor.isActive('link')} />
            </Section>

            <Divider orientation="vertical" flexItem />

            <Section label="Táblázat">
              <TablePicker onInsert={(rows, cols) => editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()} />
            </Section>

            <Divider orientation="vertical" flexItem />

            <Section label="Hasábok">
              <ColumnPicker inColumns={inColumns} columnCount={columnCount} onApply={handleColumns} />
            </Section>
          </>
        )}

        {effectiveTab === TAB_TABLAZAT && inTable && (
          <>
            <Section label="Sorok">
              <Tooltip title="Sor hozzáadása" placement="top" arrow>
                <IconButton size="small" onClick={() => editor.chain().focus().addRowAfter().run()}
                  sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                  <IconRowAdd />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sor törlése" placement="top" arrow>
                <IconButton size="small" onClick={() => editor.chain().focus().deleteRow().run()}
                  sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                  <IconRowDel />
                </IconButton>
              </Tooltip>
            </Section>

            <Divider orientation="vertical" flexItem />

            <Section label="Oszlopok">
              <Tooltip title="Oszlop hozzáadása" placement="top" arrow>
                <IconButton size="small" onClick={() => editor.chain().focus().addColumnAfter().run()}
                  sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                  <IconColAdd />
                </IconButton>
              </Tooltip>
              <Tooltip title="Oszlop törlése" placement="top" arrow>
                <IconButton size="small" onClick={() => editor.chain().focus().deleteColumn().run()}
                  sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                  <IconColDel />
                </IconButton>
              </Tooltip>
            </Section>

            <Divider orientation="vertical" flexItem />

            <Section label="Cellák">
              <Tooltip title="Összevonás" placement="top" arrow>
                <IconButton size="small" onClick={() => editor.chain().focus().mergeCells().run()}
                  sx={{ borderRadius: 1, p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                  <IconMerge />
                </IconButton>
              </Tooltip>
            </Section>

            <Divider orientation="vertical" flexItem />

            <Section label="Táblázat">
              <Tooltip title="Táblázat törlése" placement="top" arrow>
                <IconButton size="small" onClick={() => editor.chain().focus().deleteTable().run()}
                  sx={{ borderRadius: 1, p: 0.5, color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}>
                  <IconTblDel />
                </IconButton>
              </Tooltip>
            </Section>
          </>
        )}
      </Box>
    </Box>
  );
}