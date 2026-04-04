import { Component, createRef } from 'react';
import { Tooltip, IconButton, Paper, Box, Typography, Divider, Button } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';

const COLS = 8;
const ROWS = 8;

interface TablePickerProps {
  onInsert: (rows: number, cols: number) => void;
}

interface TablePickerState {
  open: boolean;
  hoverR: number;
  hoverC: number;
}

export default class TablePicker extends Component<TablePickerProps, TablePickerState> {
  ref = createRef<HTMLDivElement>();

  constructor(props: TablePickerProps) {
    super(props);
    this.state = { open: false, hoverR: 0, hoverC: 0 };
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidUpdate(_: TablePickerProps, prevState: TablePickerState) {
    if (this.state.open && !prevState.open) document.addEventListener('mousedown', this.handleOutsideClick);
    else if (!this.state.open && prevState.open) document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  componentWillUnmount() { document.removeEventListener('mousedown', this.handleOutsideClick); }

  calcStyle(): React.CSSProperties {
    const el = this.ref.current;
    if (!el) return { position: 'absolute', top: '100%', left: 0, zIndex: 200 };
    const rect = el.getBoundingClientRect();
    const panelW = 220;
    const left = rect.left + panelW > window.innerWidth - 8 ? rect.right - panelW : rect.left;
    return { position: 'fixed', top: rect.bottom + 4, left: Math.max(8, left), zIndex: 9999 };
  }

  handleOutsideClick(e: MouseEvent) {
    if (this.ref.current && !this.ref.current.contains(e.target as Node)) this.setState({ open: false });
  }

  handleInsert(rows: number, cols: number) {
    this.props.onInsert(rows, cols);
    this.setState({ open: false, hoverR: 0, hoverC: 0 });
  }

  render() {
    const { open, hoverR, hoverC } = this.state;
    return (
      <Box ref={this.ref} sx={{ position: 'relative' }}>
        <Tooltip title="Táblázat beillesztése" placement="top" arrow>
          <IconButton size="small" onClick={() => this.setState(s => ({ open: !s.open }))}
            sx={{ borderRadius: 1, p: 0.5, color: open ? 'primary.main' : 'text.secondary', bgcolor: open ? 'primary.lighter' : 'transparent' }}>
            <TableChartIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {open && (
          <Paper elevation={4} style={this.calcStyle()} sx={{ p: 1.5, minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {hoverR > 0 && hoverC > 0 ? `${hoverR} × ${hoverC} táblázat` : 'Húzd ki a méretet'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 22px)`, gap: '2px' }}>
              {Array.from({ length: ROWS * COLS }).map((_, i) => {
                const row = Math.floor(i / COLS) + 1;
                const col = (i % COLS) + 1;
                const active = row <= hoverR && col <= hoverC;
                return (
                  <Box key={i}
                    onMouseEnter={() => this.setState({ hoverR: row, hoverC: col })}
                    onMouseLeave={() => this.setState({ hoverR: 0, hoverC: 0 })}
                    onClick={() => this.handleInsert(row, col)}
                    sx={{ width: 20, height: 20, border: '1px solid', borderColor: active ? 'primary.main' : 'divider',
                      bgcolor: active ? 'primary.lighter' : 'transparent', cursor: 'pointer', borderRadius: 0.5,
                      '&:hover': { borderColor: 'primary.main' } }}
                  />
                );
              })}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Button size="small" fullWidth variant="text" onClick={() => {
              const input = window.prompt('Sorok × Oszlopok (pl. 4x6)', '3x3');
              if (!input) return;
              const [r, c] = input.split(/[x×,;]/).map(Number);
              if (r > 0 && c > 0) this.handleInsert(r, c);
            }}>Egyéni méret...</Button>
          </Paper>
        )}
      </Box>
    );
  }
}