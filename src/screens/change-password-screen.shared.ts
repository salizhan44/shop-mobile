export type ChangePasswordScreenProps = {
  hasPassword: boolean;
  pending: boolean;
  onBack: () => void;
  onVerifyCurrent: (currentPassword: string) => Promise<void>;
  onSubmitNew: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
};
