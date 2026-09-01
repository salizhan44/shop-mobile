import type { ProductPublic } from "../lib/api";

export type ProductDetailModalProps = {
  product: ProductPublic | null;
  adding: boolean;
  onClose: () => void;
  onAdd: (productId: string) => void;
};
