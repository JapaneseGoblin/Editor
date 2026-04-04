import type { FC } from 'react';
import {
  IconBlockLeft, IconBlockCenter, IconBlockRight,
  IconFloatLeft, IconFloatRight,
} from './icons';

export interface LayoutOption {
  float: string;
  align: string;
  Icon: FC;
  label: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { float: 'none',  align: 'left',   Icon: IconBlockLeft,   label: 'Bal' },
  { float: 'none',  align: 'center', Icon: IconBlockCenter, label: 'Közép' },
  { float: 'none',  align: 'right',  Icon: IconBlockRight,  label: 'Jobb' },
  { float: 'left',  align: 'left',   Icon: IconFloatLeft,   label: 'Bal (körbef.)' },
  { float: 'right', align: 'right',  Icon: IconFloatRight,  label: 'Jobb (körbef.)' },
];