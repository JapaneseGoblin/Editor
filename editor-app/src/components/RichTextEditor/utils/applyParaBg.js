// ── Bekezdés háttérszín helper ────────────────────────────────
export function applyParaBg(editor, color) {
  try {
    const { state, view } = editor;
    const { from, to } = state.selection;
    const tr = state.tr;
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

    if (!changed) {
      const resolved = state.doc.resolve(from);
      for (let d = resolved.depth; d >= 0; d--) {
        const node = resolved.node(d);
        if (node.type.name === 'paragraph' || node.type.name === 'heading') {
          tr.setNodeMarkup(resolved.before(d), undefined, {
            ...node.attrs,
            backgroundColor: color || null,
          });
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      // setMeta('addToHistory', false) megakadályozza hogy a szín picker
      // minden egyes lépése a history-ba kerüljön
      tr.setMeta('addToHistory', false);
      view.dispatch(tr);
    }
  } catch (e) {
    console.error('applyParaBg error:', e);
  }
}