export type TileSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface TileItem {
  tileId: string;
  articleId: string;
  size: TileSize;
}

export interface SizeConfig {
  colSpan: number;
  rowSpan: number;
  label: string;
  desc: string;
}

export const TILE_SIZES: Record<TileSize, SizeConfig> = {
  S:   { colSpan: 1, rowSpan: 1, label: 'Kis',        desc: '1 oszlop' },
  M:   { colSpan: 2, rowSpan: 1, label: 'Közepes',    desc: '2 oszlop' },
  L:   { colSpan: 2, rowSpan: 2, label: 'Nagy',        desc: '2 oszlop, dupla magas' },
  XL:  { colSpan: 4, rowSpan: 1, label: 'Széles',      desc: 'Teljes sáv' },
  XXL: { colSpan: 4, rowSpan: 2, label: 'Nagy sáv',    desc: 'Teljes sáv, dupla magas' },
};

export const TILE_SIZE_ORDER: TileSize[] = ['S', 'M', 'L', 'XL', 'XXL'];
