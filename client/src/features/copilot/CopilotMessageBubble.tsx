/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Copilot Message Bubble Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { AIMessage, AICopilotAction } from '@hbd/shared';
import { Bot, User, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { CopilotBudgetCard } from './CopilotBudgetCard';
import { CopilotProductCard } from './CopilotProductCard';
import { CopilotFitCard } from './CopilotFitCard';
import { CopilotAlternativeCard } from './CopilotAlternativeCard';
import { CopilotActionBanner } from './CopilotActionBanner';

interface Props {
  message: AIMessage;
  onConfirmAction?: (actionId: string) => void;
  onCancelAction?: (actionId: string) => void;
  onApplyAlternative?: (action: AICopilotAction) => void;
}

export const CopilotMessageBubble: React.FC<Props> = ({
  message,
  onConfirmAction,
  onCancelAction,
  onApplyAlternative,
}) => {
  const isUser = message.sender === 'USER';
  const payload = message.structuredPayload;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} text-sm`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-1 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[88%] space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`p-3.5 rounded-2xl ${
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
              : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-sm'
          }`}
        >
          <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
            {message.content}
          </div>

          {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
              <Wrench className="w-3 h-3 text-slate-400" />
              <span>Herramientas consultadas:</span>
              {message.toolCalls.map((tc, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-slate-900/60 rounded font-mono text-emerald-400 border border-slate-700/50"
                >
                  {tc.toolName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Structured Payloads */}
        {!isUser && payload && (
          <div className="text-left">
            {payload.budgetBreakdown && (
              <CopilotBudgetCard payload={payload.budgetBreakdown} />
            )}

            {payload.products && payload.products.length > 0 && (
              <CopilotProductCard products={payload.products} />
            )}

            {payload.fitCheckResult && (
              <CopilotFitCard result={payload.fitCheckResult} />
            )}

            {payload.alternatives && payload.alternatives.length > 0 && (
              <CopilotAlternativeCard
                alternatives={payload.alternatives}
                onApplyAlternative={onApplyAlternative}
              />
            )}

            {payload.actions && payload.actions.length > 0 && onConfirmAction && onCancelAction && (
              <div className="space-y-2">
                {payload.actions.map((act) => (
                  <CopilotActionBanner
                    key={act.id}
                    action={act}
                    onConfirm={onConfirmAction}
                    onCancel={onCancelAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] text-slate-500 px-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {!isUser && message.confidence && (
            <span className="ml-2 text-emerald-500 font-medium font-mono">
              CONFIDENCE: {message.confidence}
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0 mt-1 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
