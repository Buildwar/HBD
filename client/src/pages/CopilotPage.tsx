/**
 * HBD — FASE V24 / 1.24.2: HBD AI COPILOT
 * Dedicated Copilot Workspace & Tools Hub Page
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AIMessage,
  AIConversation,
  AIToolDefinition,
  AIInteractionLog,
} from '@hbd/shared';
import { copilotService } from '../services/copilot.service.js';
import { CopilotMessageBubble } from '../features/copilot/CopilotMessageBubble.js';
import {
  Bot,
  Send,
  Wrench,
  Activity,
  Plus,
  Trash2,
  Shield,
} from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'audit'>('chat');
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<AIToolDefinition[]>([]);
  const [interactions, setInteractions] = useState<AIInteractionLog[]>([]);

  useEffect(() => {
    loadConversations();
    loadTools();
    loadInteractions();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await copilotService.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        selectConversation(convs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTools = async () => {
    try {
      const tDef = await copilotService.getTools();
      setTools(tDef);
    } catch (err) {
      console.error(err);
    }
  };

  const loadInteractions = async () => {
    try {
      const inter = await copilotService.getInteractions();
      setInteractions(inter);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (id: string) => {
    try {
      setActiveConvId(id);
      const conv = await copilotService.getConversation(id);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await copilotService.createConversation(undefined, undefined, t('copilot.newConversation'));
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([
        {
          id: 'welcome_direct',
          conversationId: newConv.id,
          sender: 'COPILOT',
          content: t('copilot.welcomeMessage'),
          confidence: 'HIGH',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copilotService.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const query = inputMessage;
    setInputMessage('');
    setLoading(true);

    const tempUserMsg: AIMessage = {
      id: `temp_${Date.now()}`,
      conversationId: activeConvId || 'default',
      sender: 'USER',
      content: query,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await copilotService.chat({
        message: query,
        conversationId: activeConvId || undefined,
      });
      setMessages((prev) => [...prev, response.message]);
      if (response.conversation?.id && !activeConvId) {
        setActiveConvId(response.conversation.id);
        loadConversations();
      }
    } catch (err: any) {
      console.error(err);
      const errMsg: AIMessage = {
        id: `err_${Date.now()}`,
        conversationId: activeConvId || 'default',
        sender: 'COPILOT',
        content: `Error: ${err.message || t('common.error')}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (actionId: string) => {
    try {
      await copilotService.confirmAction(actionId);
      if (activeConvId) selectConversation(activeConvId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelAction = async (actionId: string) => {
    try {
      await copilotService.cancelAction(actionId);
      if (activeConvId) selectConversation(activeConvId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('copilot.title')}</h1>
            <p className="text-slate-400 text-sm">
              {t('copilot.subtitle')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t('copilot.tabChat')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tools'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t('copilot.tabTools')} ({tools.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t('copilot.tabAudit')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
          {/* Conversation Sidebar */}
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleNewConversation}
                className="w-full py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t('copilot.newConversation')}</span>
              </button>

              <div className="space-y-1 mt-3 overflow-y-auto max-h-[480px]">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer group transition-colors ${
                      activeConvId === c.id
                        ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
              <span>{t('copilot.privacyNotice')}</span>
            </div>
          </div>

          {/* Chat Timeline & Input */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px]">
              {messages.map((msg) => (
                <CopilotMessageBubble
                  key={msg.id}
                  message={msg}
                  onConfirmAction={handleConfirmAction}
                  onCancelAction={handleCancelAction}
                />
              ))}
              {loading && (
                <div className="text-xs text-emerald-400 p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center gap-2 animate-pulse">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>{t('copilot.thinking')}</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('copilot.inputPlaceholder')}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('copilot.sendButton')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tools Registry Tab */}
      {activeTab === 'tools' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              <span>{t('copilot.toolsTitle')} ({tools.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((item) => (
              <div
                key={item.name}
                className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">{item.name}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold text-[10px]">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <span>{t('copilot.riskLevel')} <strong className="text-slate-200">{item.riskLevel}</strong></span>
                  <span>{t('copilot.confirmation')} <strong className={item.requiresConfirmation ? 'text-amber-400' : 'text-emerald-400'}>{item.requiresConfirmation ? t('copilot.required') : t('copilot.notRequired')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>{t('copilot.auditTitle')}</span>
          </h3>

          <div className="space-y-2">
            {interactions.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-semibold text-emerald-400">{log.intent || log.toolName || 'INTERACTION'}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.status} {log.toolName ? `— ${log.toolName}` : ''}</p>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
