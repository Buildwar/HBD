import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { APP_CONFIG } from '../config/app.config.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [emailOrUser, setEmailOrUser] = useState<string>('admin@hbd.local');
  const [password, setPassword] = useState<string>('Admin1234!');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await register(email, username, name, password);
      } else {
        await login(emailOrUser, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setIsRegisterMode(false);
    setEmailOrUser('admin@hbd.local');
    setPassword('Admin1234!');
  };

  return (
    <div className="min-h-screen w-screen flex bg-dark-bg text-gray-100">
      {/* Columna Izquierda: Brand & Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-surface via-dark-card to-dark-bg p-12 flex-col justify-between border-r border-dark-border/50 relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/25">
            <Layers size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white">{APP_CONFIG.name}</h1>
            <p className="text-xs text-brand-400 font-medium">{APP_CONFIG.tagline}</p>
          </div>
        </div>

        <div className="space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            Gemelo Digital & Geometría CAD
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Digitaliza tus planos arquitectónicos con precisión real.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Convierte planos PDF e imágenes en modelos geométricos 2D editables, calcula superficies exactas, comprueba el paso del mobiliario y visualiza en 3D.
          </p>

          <div className="space-y-3 pt-4 border-t border-dark-border/50">
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <CheckCircle2 size={16} className="text-brand-400" />
              <span>Detección y cálculo geométrico desacoplado de la IA</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <CheckCircle2 size={16} className="text-brand-400" />
              <span>Validación espacial "¿Cabe aquí?" con detección de colisiones</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <CheckCircle2 size={16} className="text-brand-400" />
              <span>Arquitectura modular preparada para modelo 3D y render</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>{APP_CONFIG.copyright}</span>
          <span>v{APP_CONFIG.version}</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {isRegisterMode ? t('auth.register') : t('auth.loginTitle')}
            </h3>
            <p className="text-xs text-gray-400">
              {isRegisterMode ? 'Crea una cuenta para empezar a diseñar' : t('auth.loginSubtitle')}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode ? (
              <>
                <Input
                  label="Nombre Completo"
                  placeholder="Ej. Alejandro Palma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<UserIcon size={16} />}
                  required
                />
                <Input
                  label="Nombre de Usuario"
                  placeholder="Ej. apalma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<UserIcon size={16} />}
                  required
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={16} />}
                  required
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  required
                />
              </>
            ) : (
              <>
                <Input
                  label={t('auth.emailOrUser')}
                  placeholder="admin@hbd.local o admin"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  icon={<UserIcon size={16} />}
                  required
                />
                <Input
                  label={t('auth.password')}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  required
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full mt-2 py-3"
              isLoading={isLoading}
              icon={<ArrowRight size={16} />}
            >
              {isRegisterMode ? 'Crear Cuenta' : t('auth.signIn')}
            </Button>
          </form>

          {/* Botón rápido de demo */}
          {!isRegisterMode && (
            <div className="pt-2 border-t border-dark-border/40">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="w-full text-xs text-brand-400 hover:text-brand-300 py-1 font-medium transition-colors text-center block"
              >
                ⚡ Usar credenciales de Administrador por defecto
              </button>
            </div>
          )}

          <div className="text-center text-xs text-gray-400">
            {isRegisterMode ? (
              <span>
                {t('auth.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-brand-400 font-semibold hover:underline"
                >
                  {t('auth.signIn')}
                </button>
              </span>
            ) : (
              <span>
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-brand-400 font-semibold hover:underline"
                >
                  {t('auth.register')}
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
