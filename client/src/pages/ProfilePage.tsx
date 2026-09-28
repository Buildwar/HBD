import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Lock, Check, Shield } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';
import { authService } from '../services/auth.service.js';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name, email });
      setProfileMessage('Perfil actualizado correctamente.');
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err: any) {
      setProfileMessage(err.message || 'Error al actualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Error al cambiar contraseña' });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('nav.profile')}
        subtitle="Gestiona tu información de usuario y seguridad"
      />

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Cabecera del Perfil */}
        <Card className="flex items-center gap-5 p-6 bg-gradient-to-r from-dark-surface to-dark-card">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-black text-2xl uppercase">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">{user?.name}</h3>
              <Badge variant="brand">{user?.role?.name || 'USER'}</Badge>
            </div>
            <p className="text-xs text-gray-400">@{user?.username} • {user?.email}</p>
          </div>
        </Card>

        {/* Datos Personales */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-border/50 pb-3">
            <UserIcon size={18} className="text-brand-400" />
            <h4 className="text-sm font-bold text-white">Datos Personales</h4>
          </div>

          {profileMessage && (
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold flex items-center gap-2">
              <Check size={14} />
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Nombre de Usuario"
              value={user?.username || ''}
              disabled
              helperText="Identificador de usuario único."
            />
            <Button type="submit">Guardar Cambios</Button>
          </form>
        </Card>

        {/* Cambio de Contraseña */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-border/50 pb-3">
            <Lock size={18} className="text-amber-400" />
            <h4 className="text-sm font-bold text-white">Seguridad & Contraseña</h4>
          </div>

          {passwordMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold ${
                passwordMessage.type === 'success'
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Contraseña Actual"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Nueva Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="secondary">
              Actualizar Contraseña
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
