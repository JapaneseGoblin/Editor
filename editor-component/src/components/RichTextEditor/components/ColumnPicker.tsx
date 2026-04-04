import { Component, createRef } from 'react';
import { Box, Paper, Typography, IconButton, Divider, Button, TextField, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Col2Icon } from './toolbarIcons';

interface ColumnPickerProps {
  inColumns: boolean;
  columnCount: number;
  onApply: (count: number) => void;
}

interface ColumnPickerState {
  open: boolean;
  input: string;
}

export default class ColumnPicker extends Component<ColumnPickerProps, ColumnPickerState> {
  ref = createRef<HTMLDivElement>();

  constructor(props: ColumnPickerProps) {
    super(props);
    this.state = { open: false, input: '' };
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidUpdate(_: ColumnPickerProps, prevState: ColumnPickerState) {
    if (this.state.open && !prevState.open) document.addEventListener('mousedown', this.handleOutsideClick);
    else if (!this.state.open && prevState.open) document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  componentWillUnmount() { document.removeEventListener('mousedown', this.handleOutsideClick); }

  calcStyle(): React.CSSProperties {
    const el = this.ref.current;
    if (!el) return { position: 'absolute', top: '100%', left: 0, zIndex: 200 };
    const rect = el.getBoundingClientRect();
    const panelW = 180;
    const left = rect.left + panelW > window.innerWidth - 8 ? rect.right - panelW : rect.left;
    return { position: 'fixed', top: rect.bottom + 4, left: Math.max(8, left), zIndex: 9999 };
  }

  handleOutsideClick(e: MouseEvent) {
    if (this.ref.current && !this.ref.current.contains(e.target as Node)) this.setState({ open: false });
  }

  apply(n: number) { this.props.onApply(n); this.setState({ open: false, input: '' }); }

  render() {
    const { inColumns, columnCount } = this.props;
    const { open, input } = this.state;

    return (
      <Box ref={this.ref} sx={{ position: 'relative', display: 'flex' }}>
        <Tooltip title={inColumns ? 'Hasábok feloldása' : '2 hasáb beillesztése'} placement="top" arrow>
          <IconButton size="small" onClick={() => this.apply(inColumns ? columnCount : 2)}
            sx={{ borderRadius: 1, p: 0.5, color: inColumns ? 'primary.main' : 'text.secondary',
              bgcolor: inColumns ? 'primary.lighter' : 'transparent' }}>
            <Col2Icon />
            {inColumns && <Typography variant="caption" sx={{ ml: 0.25, fontSize: 10 }}>{columnCount}</Typography>}
          </IconButton>
        </Tooltip>

        <Tooltip title="Egyéni hasábszám" placement="top" arrow>
          <IconButton size="small" onClick={() => this.setState(s => ({ open: !s.open, input: '' }))}
            sx={{ borderRadius: 1, p: 0.25, color: 'text.secondary' }}>
            <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

        {open && (
          <Paper elevation={4} style={this.calcStyle()} sx={{ p: 1.5, minWidth: 160 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Hasábok száma</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
              {[1, 2, 3, 4].map(n => (
                <Button key={n} size="small" variant={inColumns && columnCount === n ? 'contained' : 'outlined'}
                  onClick={() => this.apply(n)} sx={{ minWidth: 32, p: 0.5 }}>{n}</Button>
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <TextField size="small" type="number" inputProps={{ min: 1, max: 12 }} placeholder="Egyéni..."
                value={input} onChange={(e) => this.setState({ input: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { const n = parseInt(input); if (n >= 1 && n <= 12) this.apply(n); }}}
                sx={{ width: 90 }} autoFocus />
              <Button size="small" variant="contained" onClick={() => { const n = parseInt(input); if (n >= 1 && n <= 12) this.apply(n); }}>OK</Button>
            </Box>
            {inColumns && (
              <>
                <Divider sx={{ my: 1 }} />
                <Button size="small" fullWidth color="error" variant="text" onClick={() => this.apply(columnCount)}>Hasábok feloldása</Button>
              </>
            )}
          </Paper>
        )}
      </Box>
    );
  }
}