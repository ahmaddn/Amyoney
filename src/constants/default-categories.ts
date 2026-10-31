export interface DefaultCategoryDef {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  defaultBudget?: number;
}

export const EXPANDED_DEFAULT_EXPENSES: DefaultCategoryDef[] = [
  { name: 'Belanja', type: 'expense', icon: 'cart-outline', color: '#EC4899', defaultBudget: 500000 },
  { name: 'Makanan', type: 'expense', icon: 'restaurant-outline', color: '#EF4444', defaultBudget: 1500000 },
  { name: 'Telepon', type: 'expense', icon: 'call-outline', color: '#3B82F6', defaultBudget: 150000 },
  { name: 'Hiburan', type: 'expense', icon: 'game-controller-outline', color: '#8B5CF6', defaultBudget: 300000 },
  { name: 'Pendidikan', type: 'expense', icon: 'school-outline', color: '#06B6D4', defaultBudget: 500000 },
  { name: 'Kecantikan', type: 'expense', icon: 'cut-outline', color: '#F43F5E', defaultBudget: 250000 },
  { name: 'Olahraga', type: 'expense', icon: 'fitness-outline', color: '#10B981', defaultBudget: 200000 },
  { name: 'Sosial', type: 'expense', icon: 'people-outline', color: '#6366F1', defaultBudget: 300000 },
  { name: 'Transportasi', type: 'expense', icon: 'bus-outline', color: '#F97316', defaultBudget: 500000 },
  { name: 'Pakaian', type: 'expense', icon: 'shirt-outline', color: '#D946EF', defaultBudget: 350000 },
  { name: 'Mobil', type: 'expense', icon: 'car-sport-outline', color: '#0EA5E9', defaultBudget: 600000 },
  { name: 'Minuman', type: 'expense', icon: 'wine-outline', color: '#A855F7', defaultBudget: 200000 },
  { name: 'Rokok', type: 'expense', icon: 'flame-outline', color: '#64748B', defaultBudget: 300000 },
  { name: 'Elektronik', type: 'expense', icon: 'tv-outline', color: '#3B82F6', defaultBudget: 400000 },
  { name: 'Bepergian', type: 'expense', icon: 'airplane-outline', color: '#14B8A6', defaultBudget: 500000 },
  { name: 'Kesehatan', type: 'expense', icon: 'medkit-outline', color: '#E11D48', defaultBudget: 300000 },
  { name: 'Peliharaan', type: 'expense', icon: 'paw-outline', color: '#F59E0B', defaultBudget: 200000 },
  { name: 'Perbaikan', type: 'expense', icon: 'build-outline', color: '#78716C', defaultBudget: 250000 },
  { name: 'Perumahan', type: 'expense', icon: 'business-outline', color: '#475569', defaultBudget: 1000000 },
  { name: 'Rumah', type: 'expense', icon: 'home-outline', color: '#059669', defaultBudget: 500000 },
  { name: 'Hadiah', type: 'expense', icon: 'gift-outline', color: '#F472B6', defaultBudget: 200000 },
  { name: 'Donasi', type: 'expense', icon: 'heart-outline', color: '#FB7185', defaultBudget: 200000 },
  { name: 'Lotre', type: 'expense', icon: 'dice-outline', color: '#EAB308', defaultBudget: 100000 },
  { name: 'Makanan ringan', type: 'expense', icon: 'cafe-outline', color: '#F59E0B', defaultBudget: 200000 },
  { name: 'Anak-anak', type: 'expense', icon: 'happy-outline', color: '#38BDF8', defaultBudget: 500000 },
  { name: 'Sayur-mayur', type: 'expense', icon: 'nutrition-outline', color: '#84CC16', defaultBudget: 300000 },
  { name: 'Buah', type: 'expense', icon: 'leaf-outline', color: '#10B981', defaultBudget: 250000 },
];

export const EXPANDED_DEFAULT_INCOMES: DefaultCategoryDef[] = [
  { name: 'Gaji', type: 'income', icon: 'briefcase-outline', color: '#10B981', defaultBudget: 0 },
  { name: 'Investasi', type: 'income', icon: 'trending-up-outline', color: '#3B82F6', defaultBudget: 0 },
  { name: 'Paruh waktu', type: 'income', icon: 'cash-outline', color: '#06B6D4', defaultBudget: 0 },
  { name: 'Bonus', type: 'income', icon: 'trophy-outline', color: '#F59E0B', defaultBudget: 0 },
  { name: 'Lain-lain', type: 'income', icon: 'layers-outline', color: '#8B5CF6', defaultBudget: 0 },
];

export const AVAILABLE_CATEGORY_ICONS = [
  'cart-outline',
  'restaurant-outline',
  'call-outline',
  'game-controller-outline',
  'school-outline',
  'cut-outline',
  'fitness-outline',
  'people-outline',
  'bus-outline',
  'shirt-outline',
  'car-sport-outline',
  'wine-outline',
  'flame-outline',
  'tv-outline',
  'airplane-outline',
  'medkit-outline',
  'paw-outline',
  'build-outline',
  'business-outline',
  'home-outline',
  'gift-outline',
  'heart-outline',
  'dice-outline',
  'cafe-outline',
  'happy-outline',
  'nutrition-outline',
  'leaf-outline',
  'briefcase-outline',
  'trending-up-outline',
  'cash-outline',
  'trophy-outline',
  'layers-outline',
  'wallet-outline',
  'card-outline',
  'receipt-outline',
  'book-outline',
  'bicycle-outline',
  'musical-notes-outline',
  'camera-outline',
  'color-palette-outline',
];

export const AVAILABLE_CATEGORY_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#64748B', // Slate
  '#173D32', // Forest
];

