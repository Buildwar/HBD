import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Sparkles, Key, Eye, EyeOff, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { settingsService } from '../../services/settings.service.js';
import type { AISettingsDto } from '@hbd/shared';

interface SettingsAITabProps {
  isAdmin: boolean;
  onShowSavedToast: () => void;
}

export const SettingsAITab: React.FC<SettingsAITabProps> = ({
  isAdmin,
  onShowSavedToast,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AISettingsDto>({
    provider: 'mock',
    visionProvider: 'mock',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
    isMockMode: true,
    hasCustomApiKey: false,
    hasCustomVisionApiKey: false,
  });

  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [inputVisionApiKey, setInputVisionApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [showVisionApiKey, setShowVisionApiKey] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.getAISettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      setSaving(true);
      setError(null);
      const updatePayload: any = {
        provider: settings.provider,
        visionProvider: settings.visionProvider,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      };

      if (inputApiKey.trim()) {
        updatePayload.apiKey = inputApiKey.trim();
      }
      if (inputVisionApiKey.trim()) {
        updatePayload.visionApiKey = inputVisionApiKey.trim();
      }

      const res = await settingsService.updateAISettings(updatePayload);
      if (res.success && res.data) {
        setSettings(res.data);
        setInputApiKey('');
        setInputVisionApiKey('');
        onShowSavedToast();
      }
    } catch (err: any) {
      setError(err.message || 'Error saving AI settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!isAdmin) return;
    try {
      setResetting(true);
      setError(null);
      await settingsService.resetSection('ai');
      await loadSettings();
      setInputApiKey('');
      setInputVisionApiKey('');
      onShowSavedToast();
    } catch (err: any) {
      setError(err.message || 'Error resetting AI settings');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">{t('settings.ai.title')}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {t('settings.ai.title')}
                </h3>
                {settings.provider === 'mock' ? (
                  <Badge variant="warning" className="text-[10px]">
                    MOCK / LOCAL
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px]">
                    LIVE API
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {t('settings.ai.subtitle')}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={resetting || saving}
              className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white"
            >
              <RotateCcw size={14} />
              {resetting ? '...' : t('settings.ai.reset')}
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                HBD AI Core Engine
              </p>
              <p className="text-[11px] text-gray-400">
                {settings.provider === 'mock'
                  ? 'Mock simulation provider active (Zero cost / Local offline).'
                  : `Connected to ${settings.provider.toUpperCase()} (${settings.model}).`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% OPERATIONAL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Motor de Diseño e Interiorismo */}
          <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Brain size={14} className="text-purple-400" />
              {t('settings.ai.designHeading')}
            </h4>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.ai.provider')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.provider}
                onChange={(e) =>
                  setSettings({ ...settings, provider: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="mock">Mock Simulator (Local / Zero cost)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="gemini">Google DeepMind (Gemini 1.5 Pro / Flash)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.ai.model')}
              </label>
              <input
                disabled={!isAdmin}
                type="text"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                placeholder="gpt-4o"
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-gray-300">
                  {t('settings.ai.temperature')}: {settings.temperature}
                </label>
              </div>
              <input
                disabled={!isAdmin}
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-dark-card rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          </div>

          {/* Visión Artificial */}
          <div className="space-y-4 p-4 rounded-xl bg-dark-bg/40 border border-dark-border/40">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              {t('settings.ai.visionHeading')}
            </h4>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.ai.provider')}
              </label>
              <select
                disabled={!isAdmin}
                value={settings.visionProvider}
                onChange={(e) =>
                  setSettings({ ...settings, visionProvider: e.target.value as any })
                }
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="mock">Mock Simulator (Local / Zero cost)</option>
                <option value="openai">OpenAI Vision (GPT-4o)</option>
                <option value="gemini">Google DeepMind Vision (Gemini 1.5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t('settings.ai.apiKey')}
              </label>
              <div className="relative">
                <input
                  disabled={!isAdmin}
                  type={showApiKey ? 'text' : 'password'}
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder={settings.hasCustomApiKey ? '••••••••••••••••' : 'sk-...'}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-primary-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end pt-4 border-t border-dark-border/60">
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6"
            >
              <Save size={16} />
              {saving ? '...' : t('settings.ai.save')}
            </Button>
          </div>
        )}
      </Card>
    </form>
  );
};
