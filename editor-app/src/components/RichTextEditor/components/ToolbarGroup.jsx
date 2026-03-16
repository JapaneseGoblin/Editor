import React from 'react';
import ToolbarButton from './ToolbarButton';

export default function ToolbarGroup({ group, editor, onLinkClick }) {
  return (
    <div className="rte-toolbar-group">
      {group.items.map((item) => (
        <ToolbarButton
          key={item.id}
          icon={item.icon}
          tooltip={item.tooltip}
          active={item.isActive(editor)}
          onClick={() => {
            if (item.id === 'link') {
              onLinkClick?.();
            } else {
              item.action(editor);
            }
          }}
        />
      ))}
    </div>
  );
}