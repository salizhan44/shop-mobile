export type CatalogSearchBarProps = {
  value: string;
  showClear: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};
