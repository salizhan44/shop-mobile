import type { CustomerPublic } from "../lib/api";

export type ProfileScreenProps = {
  customer: CustomerPublic;
  pending: boolean;
  error: string;
  onSaveProfile: (input: {
    name: string;
    homeAddress: string;
  }) => Promise<void>;
  onChangeAvatar: () => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onLogout: () => void;
};
