import React, { Component, createRef } from 'react';

const COLS = 8;
const ROWS = 8;

export default class TablePicker extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, hoverR: 0, hoverC: 0 };
    this.ref = createRef();
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleInsert = this.handleInsert.bind(this);
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

  handleInsert(rows, cols) {
    this.props.onInsert(rows, cols);
    this.setState({ open: false, hoverR: 0, hoverC: 0 });
  }

  render() {
    const { open, hoverR, hoverC } = this.state;

    return (
      <div ref={this.ref} className="rte-table-picker-wrap">
        <button
          className={`rte-toolbar-btn${open ? ' rte-toolbar-btn--active' : ''}`}
          title="Táblázat beillesztése"
          type="button"
          onClick={() => this.setState(s => ({ open: !s.open }))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1" opacity=".9"/>
            <rect x="9" y="1" width="6" height="6" rx="1" opacity=".5"/>
            <rect x="1" y="9" width="6" height="6" rx="1" opacity=".5"/>
            <rect x="9" y="9" width="6" height="6" rx="1" opacity=".3"/>
          </svg>
        </button>

        {open && (
          <div className="rte-table-picker">
            <div className="rte-table-picker__label">
              {hoverR > 0 && hoverC > 0
                ? `${hoverR} × ${hoverC} táblázat`
                : 'Húzd ki a méretet'}
            </div>

            <div
              className="rte-table-picker__grid"
              style={{ gridTemplateColumns: `repeat(${COLS}, 22px)` }}
            >
              {Array.from({ length: ROWS * COLS }).map((_, i) => {
                const row = Math.floor(i / COLS) + 1;
                const col = (i % COLS) + 1;
                const active = row <= hoverR && col <= hoverC;
                return (
                  <div
                    key={i}
                    className={`rte-table-picker__cell${active ? ' rte-table-picker__cell--active' : ''}`}
                    onMouseEnter={() => this.setState({ hoverR: row, hoverC: col })}
                    onMouseLeave={() => this.setState({ hoverR: 0, hoverC: 0 })}
                    onClick={() => this.handleInsert(row, col)}
                  />
                );
              })}
            </div>

            <div className="rte-table-picker__divider" />

            <button
              className="rte-table-picker__custom-btn"
              onClick={() => {
                const input = window.prompt('Sorok × Oszlopok (pl. 4x6)', '3x3');
                if (!input) return;
                const [r, c] = input.split(/[x×,;]/).map(Number);
                if (r > 0 && c > 0) this.handleInsert(r, c);
              }}
            >
              Egyéni méret...
            </button>
          </div>
        )}
      </div>
    );
  }
}