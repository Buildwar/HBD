import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { authService } from '../../services/auth.service.js';

interface SettingsPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SettingsPasswordModal: React.FC<SettingsPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(t("settings.password.errors.minLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("settings.password.errors.mismatch"));
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t("settings.password.errors.changeError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("settings.password.modal.title")}
      description={t("settings.password.modal.description")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <Input
            type={showCurrent ? 'text' : 'password'}
            label={t("settings.password.modal.currentLabel")}
            placeholder={t("settings.password.modal.currentPlaceholder")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-8 text-gray-400 hover:text-white"
          >
            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showNew ? 'text' : 'password'}
            label={t("settings.password.modal.newLabel")}
            placeholder={t("settings.password.modal.newPlaceholder")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-8 text-gray-400 hover:text-white"
          >
            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <div>
          <Input
            type="password"
            label={t("settings.password.modal.confirmLabel")}
            placeholder={t("settings.password.modal.confirmPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t("common.saving") : t("settings.password.modal.submitButton")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
