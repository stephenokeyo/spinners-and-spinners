import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Lock, ShieldCheck, Sparkles, User } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const {
    activeChatThreadId,
    closeChat,
    chatThreads,
    currentUser,
    sendChatMessage,
    partners
  } = useApp();

  const [messageText, setMessageText] = useState('');

  if (!activeChatThreadId) return null;

  const currentThread = chatThreads.find(t => t.id === activeChatThreadId);
  if (!currentThread) return null;

  const partner = partners.find(p => p.id === currentThread.partnerId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendChatMessage(currentThread.id, messageText);
    setMessageText('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md bg-neutral-950 border border-white/20 rounded shadow-2xl flex flex-col h-[500px] overflow-hidden text-xs">
      {/* Header */}
      <div className="p-3.5 bg-neutral-900 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold font-editorial text-sm border border-[#c5a059]/30">
              {partner?.name.charAt(0) || 'A'}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-neutral-900" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{currentThread.partnerName}</span>
              <span className="text-[10px] text-neutral-400 font-mono">({partner?.location.split(',')[0]})</span>
            </div>
            <span className="text-[10px] text-neutral-400 block font-light">
              Director: {partner?.leadDesigner}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentThread.hasPurchase && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Sealed</span>
            </span>
          )}

          <button
            onClick={closeChat}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Context Banner (if inquiring about a specific product) */}
      {currentThread.productTitle && (
        <div className="px-3.5 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 truncate">
            {currentThread.productImage && (
              <img
                src={currentThread.productImage}
                alt=""
                className="w-5 h-5 rounded object-cover border border-white/10 shrink-0"
              />
            )}
            <span className="text-neutral-300 font-editorial truncate">
              Piece: <strong className="text-white">{currentThread.productTitle}</strong>
            </span>
          </div>
          {currentThread.orderId && (
            <span className="text-[10px] font-mono text-[#c5a059] shrink-0">
              #{currentThread.orderId}
            </span>
          )}
        </div>
      )}

      {/* Privacy Isolation Alert Banner */}
      {currentThread.hasPurchase ? (
        <div className="px-3 py-1.5 bg-emerald-950/30 border-b border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Confidential Order Channel:</strong> Quarantined from all competing partners. Only you, {currentThread.partnerName}, and Platform Admins can see this thread.
          </span>
        </div>
      ) : (
        <div className="px-3 py-1 bg-white/[0.02] border-b border-white/5 text-[10px] text-neutral-400 flex items-center gap-1">
          <Lock className="w-3 h-3 text-[#c5a059] shrink-0" />
          <span>Direct confidential spinner communication</span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentThread.messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.isSystemNotice
                ? 'items-center my-2'
                : msg.senderId === currentUser.id
                ? 'items-end'
                : 'items-start'
            }`}
          >
            {msg.isSystemNotice ? (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] rounded text-center max-w-[90%] leading-relaxed font-light">
                {msg.content}
              </div>
            ) : (
              <div
                className={`max-w-[85%] rounded px-3 py-2 text-xs leading-relaxed ${
                  msg.senderId === currentUser.id
                    ? 'bg-[#c5a059] text-black font-medium'
                    : 'bg-white/10 text-neutral-200 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[9px] opacity-75 mb-0.5 font-mono">
                  <span>{msg.senderName.split(' ')[0]}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p>{msg.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2.5 bg-neutral-900 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          placeholder={`Message ${currentThread.partnerName}...`}
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
        />
        <button
          type="submit"
          disabled={!messageText.trim()}
          className="p-2 bg-[#c5a059] hover:bg-[#d4b069] disabled:opacity-40 text-black font-semibold rounded transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
