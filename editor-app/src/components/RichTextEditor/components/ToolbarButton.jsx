import React, { Component } from 'react';

export default class ToolbarButton extends Component {
  render() {
    const { icon: Icon, tooltip, onClick, active = false, disabled = false } = this.props;
    return (
      <button
        className={`rte-toolbar-btn${active ? ' rte-toolbar-btn--active' : ''}`}
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        type="button"
      >
        <Icon size={16} />
      </button>
    );
  }
}