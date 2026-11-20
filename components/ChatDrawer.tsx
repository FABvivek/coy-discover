'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, CheckCheck, Loader2 } from 'lucide-react';
import { Profile, ChatMessage } from '@/lib/types';

interface ChatDrawerProps {
  match: Profile & { matchedAt: string };
  onClose: () => void;
}

export function ChatDrawer({ match, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMatchTyping, setIsMatchTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1-Click quick icebreaker suggestions tailored to the match
  const quickIcebreakers = [
    `Hey ${match.name}! So glad we matched :)`,
    `Chai and book browsing this weekend?`,
    `Loved your bio! What are you working on currently?`,
  ];

  // Fetch existing message history
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?targetId=${match.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat messages', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [match.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMatchTyping]);

  // Check if match has replied
  const hasUserSentMessage = messages.some((m) => m.senderId === 'me');
  const hasMatchReplied = messages.some((m) => m.senderId === match.id);
  const isWaitingForReply = hasUserSentMessage && !hasMatchReplied && !isMatchTyping;
  const isChatUnlocked = hasMatchReplied;

  // Send message function (1-click or typed)
  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      targetId: match.id,
      senderId: 'me',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Simulate realistic network & reading delay
      setIsMatchTyping(true);

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: match.id, text }),
      });

      if (res.ok) {
        const data = await res.json();
        // Give a realistic 1.2s typing pause for the other person
        setTimeout(() => {
          setIsMatchTyping(false);
          setMessages(data.messages || []);
          setIsSending(false);
        }, 1200);
      } else {
        setIsMatchTyping(false);
        setIsSending(false);
      }
    } catch (err) {
      console.error('Error sending message', err);
      setIsMatchTyping(false);
      setIsSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-bg-primary text-ink-primary max-w-md mx-auto h-full border-x border-line animate-fade-in"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-bg-card/95 border-b border-line backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to matches"
            className="p-2 -ml-2 rounded-full hover:bg-bg-secondary text-ink-secondary hover:text-ink-primary transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-line flex-shrink-0">
            <img
              src={match.photo}
              alt={match.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-lg font-medium tracking-tight text-ink-primary leading-tight">
                {match.name}
              </h3>
              <span className="text-xs text-ink-muted">{match.age}</span>
            </div>
            <p className="text-[11px] text-ink-secondary truncate max-w-[180px]">
              {match.city}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">
          Mutual
        </div>
      </header>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-xs">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state: 1-Click Custom Icebreakers */
          <div className="py-6 flex flex-col items-center text-center animate-fade-in">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-accent/20 mb-3 shadow-card">
              <img
                src={match.photo}
                alt={match.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h4 className="font-serif text-2xl font-normal text-ink-primary mb-1">
              You and {match.name} liked each other
            </h4>
            <p className="text-xs text-ink-secondary max-w-[260px] mb-6 leading-relaxed">
              Send a custom icebreaker in one click. Once {match.name} replies, live messaging unlocks!
            </p>

            <div className="w-full space-y-2 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted px-1">
                One-click icebreakers
              </span>
              {quickIcebreakers.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(starter)}
                  disabled={isSending}
                  className="w-full text-left p-3.5 rounded-2xl bg-bg-card hover:bg-bg-secondary border border-line text-xs text-ink-primary transition-all active:scale-[0.99] flex items-center justify-between group shadow-sm"
                >
                  <span className="pr-2 leading-relaxed">&ldquo;{starter}&rdquo;</span>
                  <span className="text-[10px] font-medium text-accent whitespace-nowrap opacity-80 group-hover:opacity-100 flex items-center gap-1">
                    Send <Sparkles className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Message Thread */
          <>
            {messages.map((msg) => {
              const isMe = msg.senderId === 'me';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-accent text-white rounded-br-xs'
                        : 'bg-bg-card text-ink-primary border border-line rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 px-1 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isMe && <CheckCheck className="w-3 h-3 text-accent" />}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isMatchTyping && (
              <div className="flex items-center gap-2 text-xs text-ink-muted animate-pulse py-1">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-line">
                  <img src={match.photo} alt="" className="w-full h-full object-cover" />
                </div>
                <span>{match.name} is typing...</span>
              </div>
            )}

            {/* Status notice when waiting for first reply */}
            {isWaitingForReply && (
              <div className="py-2 px-3 rounded-xl bg-bg-secondary/70 border border-line text-center text-[11px] text-ink-secondary">
                Waiting for {match.name} to reply. Once they reply, you can start messaging freely.
              </div>
            )}

            {/* Status notice when unlocked */}
            {isChatUnlocked && messages.length === 2 && (
              <div className="py-2 px-3 rounded-xl bg-accent/10 border border-accent/20 text-center text-[11px] text-accent font-medium">
                {match.name} replied! You can now message freely.
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3 bg-bg-card border-t border-line safe-pb">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending || isWaitingForReply}
            placeholder={
              isWaitingForReply
                ? `Waiting for ${match.name}'s reply...`
                : hasUserSentMessage
                ? 'Type a message...'
                : 'Send custom icebreaker in one click...'
            }
            className="flex-1 bg-bg-secondary text-ink-primary placeholder:text-ink-muted text-xs sm:text-sm px-4 py-2.5 rounded-full border border-line focus:outline-none focus:border-accent disabled:opacity-60 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending || isWaitingForReply}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-40 hover:bg-accent-hover active:scale-95 transition-all shadow-button flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
