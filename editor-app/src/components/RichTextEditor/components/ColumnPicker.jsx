import React, { Component, createRef } from 'react';
import { Col2Icon } from './toolbarIcons';

export default class ColumnPicker extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, input: '' };
    this.ref   = createRef();
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidUpdate(_, prevState) {
    if (this.state.open && !prevState.open) {
      document.addEventListener('mousedown', this.handleOutsideClick);
    } else if (!this.state.open && prevState.open) {
      document.removeEventListener('mousedown', this.handleOutsideClick);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  handleOutsideClick(e) {
    if (this.ref.current && !this.ref.current.contains(e.target)) {
      this.setState({ open: false });
    }
  }

  apply(n) {
    this.props.onApply(n);
    this.setState({ open: false, input: '' });
  }

  render() {
    const { inColumns, columnCount } = this.props;
    const { open, input } = this.state;

    return (
      <div ref={this.ref} style={{ position: 'relative' }}>
        <div className="rte-col-picker-btn">
          <button
            className={`rte-toolbar-btn rte-col-picker-btn__main${inColumns ? ' rte-toolbar-btn--active' : ''}`}
            title={inColumns ? 'Hasábok feloldása' : '2 hasáb beillesztése'}
            onClick={() => this.props.onApply(inColumns ? (columnCount === 2 ? 2 : columnCount) : 2)}
          >
            <Col2Icon />
            <span className="rte-col-picker-btn__label">{inColumns ? columnCount : ''}</span>
          </button>
          <button
            className="rte-col-picker-btn__arrow"
            title="Egyéni hasábszám"
            onClick={() => this.setState(s => ({ open: !s.open, input: '' }))}
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
                  onClick={() => this.apply(n)}
                >{n}</button>
              ))}
            </div>
            <div className="rte-col-picker-dropdown__divider" />
            <div className="rte-col-picker-dropdown__custom">
              <input
                type="number" min="1" max="12" placeholder="Egyéni..."
                value={input}
                onChange={(e) => this.setState({ input: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { const n = parseInt(input); if (n >= 1 && n <= 12) this.apply(n); }}}
                className="rte-col-picker-dropdown__input"
                autoFocus
              />
              <button
                className="rte-col-picker-dropdown__ok"
                onClick={() => { const n = parseInt(input); if (n >= 1 && n <= 12) this.apply(n); }}
              >OK</button>
            </div>
            {inColumns && (
              <>
                <div className="rte-col-picker-dropdown__divider" />
                <button className="rte-col-picker-dropdown__remove" onClick={() => this.apply(columnCount)}>
                  Hasábok feloldása
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}