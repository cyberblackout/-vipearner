import { useState, useRef, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/react';
import {
  chevronForwardOutline,
  logoWhatsapp,
  paperPlaneOutline,
  headsetOutline,
  send,
  closeOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import BottomNav from '../../components/BottomNav';

interface LiveMsg {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

const INITIAL_LIVE_MESSAGES: LiveMsg[] = [
  {
    id: 'l-1',
    sender: 'agent',
    text: 'Hello! Welcome to VIP Earner Live Concierge. How can our online specialist help you today?',
    time: '14:40',
  },
];

export default function CustomerServicePage() {
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [liveMessages, setLiveMessages] = useState<LiveMsg[]>(INITIAL_LIVE_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLiveChat) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveMessages, isAgentTyping, showLiveChat]);

  const handleOpenWhatsApp = () => {
    window.open('https://wa.me/233544269465?text=Hello%20VIP%20Earner%20Support,%20I%20need%20assistance.', '_blank');
  };

  const handleOpenTelegram = () => {
    window.open('https://t.me/vipearner_support', '_blank');
  };

  const handleSendLiveMessage = () => {
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const newMsg: LiveMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLiveMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
    setIsAgentTyping(true);

    setTimeout(() => {
      let reply = 'Thank you for your message. An online support officer is reviewing your account details.';
      const lower = userText.toLowerCase();

      if (lower.includes('deposit') || lower.includes('momo') || lower.includes('telecel')) {
        reply = 'Deposits via Telecel Cash (0201634748 - GBETI GODSWAY) are credited within 1–3 minutes. If you completed a payment, kindly paste your transaction ID or MoMo reference here.';
      } else if (lower.includes('withdraw')) {
        reply = 'Withdrawals to Ghanaian Mobile Money wallets (MTN MoMo, Telecel Cash, AT Money) are processed in 5–15 minutes. Check that your registered MoMo number and name match.';
      } else if (lower.includes('account') || lower.includes('login') || lower.includes('password')) {
        reply = 'For Ghana account security, our desk can verify your +233 mobile number and reset your credentials securely.';
      }

      setLiveMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsAgentTyping(false);
    }, 1200);
  };

  return (
    <IonPage>
      {/* ══════════════════════════════════════════════════════
          1. TOP NAVBAR (Clean White with Back Arrow)
      ══════════════════════════════════════════════════════ */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="dark" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>
            Online consultation
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#FFFFFF' }}>
        <div style={{ width: '100%', paddingBottom: 85 }}>
          {/* ══════════════════════════════════════════════════════
              2. ISOMETRIC ILLUSTRATION (Exact Reference Design)
          ══════════════════════════════════════════════════════ */}
          <div
            style={{
              padding: '24px 20px 10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <svg width="280" height="190" viewBox="0 0 280 190" fill="none">
              {/* Isometric Base Tablet / Mobile Screen */}
              <polygon points="140,55 250,115 140,175 30,115" fill="#E0E7FF" />
              <polygon points="30,115 140,175 140,183 30,123" fill="#C7D2FE" />
              <polygon points="250,115 140,175 140,183 250,123" fill="#A5B4FC" />

              {/* Tablet Screen Surface */}
              <polygon points="140,65 240,118 140,170 40,118" fill="#FFFFFF" />

              {/* Chat bubbles & rows on tablet screen */}
              <polygon points="140,88 200,120 170,136 110,104" fill="#EEF2FF" />
              <polygon points="80,110 140,142 120,152 60,120" fill="#E0E7FF" />

              {/* Floating Profile Monitor / ID Card on Left */}
              <g transform="translate(60, 20)">
                <rect x="0" y="0" width="55" height="70" rx="6" fill="#818CF8" opacity="0.9" />
                <rect x="6" y="6" width="43" height="58" rx="4" fill="#C7D2FE" />
                <circle cx="27.5" cy="28" r="10" fill="#4F46E5" />
                <rect x="14" y="44" width="27" height="4" rx="2" fill="#818CF8" />
                <rect x="18" y="52" width="19" height="4" rx="2" fill="#818CF8" />
              </g>

              {/* Floating Shield & Notification Badges on Right */}
              <g transform="translate(180, 35)">
                <rect x="0" y="0" width="36" height="44" rx="6" fill="#F43F5E" opacity="0.85" />
                <circle cx="18" cy="22" r="8" fill="#FFFFFF" />
                <path d="M15 22 L17 24 L22 19" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Person 1 (Customer Support Agent seated on tablet typing) */}
              <g transform="translate(100, 75)">
                <circle cx="20" cy="10" r="7" fill="#7C3AED" />
                <path d="M14 20 Q20 18 26 20 L28 42 L12 42 Z" fill="#EC4899" />
                <rect x="8" y="32" width="14" height="10" rx="2" fill="#6366F1" />
              </g>

              {/* Person 2 (User sitting on the tablet edge with laptop) */}
              <g transform="translate(190, 85)">
                <circle cx="14" cy="8" r="6" fill="#1E293B" />
                <path d="M9 16 Q14 14 19 16 L22 36 L6 36 Z" fill="#3B82F6" />
                <polygon points="12,26 24,26 22,32 10,32" fill="#94A3B8" />
              </g>

              {/* Subtle floating glow nodes */}
              <circle cx="45" cy="95" r="12" fill="#34D399" opacity="0.3" filter="blur(4px)" />
              <circle cx="225" cy="140" r="10" fill="#F43F5E" opacity="0.3" filter="blur(4px)" />
            </svg>
          </div>

          {/* ══════════════════════════════════════════════════════
              3. THREE CONSULTATION CHANNELS
          ══════════════════════════════════════════════════════ */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Channel 1: Online Service (Opens in-app Live Chat Modal) */}
            <div
              onClick={() => setShowLiveChat(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 14px',
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #F1F5F9',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Dark circular avatar icon with headphones */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#1E293B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IonIcon icon={headsetOutline} style={{ fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    Online service
                  </div>
                  <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 1 }}>
                    Instant Chat • Dedicated Officer
                  </div>
                </div>
              </div>

              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 18 }} />
            </div>

            {/* Channel 2: WhatsApp */}
            <div
              onClick={handleOpenWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 14px',
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #F1F5F9',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Green WhatsApp circular emblem */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#25D366',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IonIcon icon={logoWhatsapp} style={{ fontSize: 22 }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    WhatsApp
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    Direct Ghanaian MoMo Support
                  </div>
                </div>
              </div>

              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 18 }} />
            </div>

            {/* Channel 3: Telegram */}
            <div
              onClick={handleOpenTelegram}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 14px',
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #F1F5F9',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Blue Telegram circular emblem */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#229ED9',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IonIcon icon={paperPlaneOutline} style={{ fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    Telegram
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    Official VIP Earner Channel
                  </div>
                </div>
              </div>

              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 18 }} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            4. IN-APP ONLINE SERVICE LIVE CHAT MODAL
        ══════════════════════════════════════════════════════ */}
        {showLiveChat && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 16px',
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#1E293B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <IonIcon icon={headsetOutline} style={{ fontSize: 18 }} />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                    Officer Daniel
                  </div>
                  <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                    Active • VIP Earner Helpdesk
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowLiveChat(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 6,
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 24 }} />
              </button>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 14px',
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Security Shield Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  background: '#EFF6FF',
                  borderRadius: 10,
                  fontSize: 11,
                  color: '#1E40AF',
                  border: '1px solid #DBEAFE',
                }}
              >
                <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 15 }} />
                <span>End-to-end encrypted VIP member conversation</span>
              </div>

              {liveMessages.map((msg) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAgent ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '82%',
                        background: isAgent ? '#FFFFFF' : '#2563EB',
                        color: isAgent ? '#1E293B' : '#FFFFFF',
                        borderRadius: isAgent ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                        padding: '12px 14px',
                        fontSize: 13,
                        lineHeight: 1.5,
                        boxShadow: isAgent ? '0 1px 4px rgba(0,0,0,0.04)' : '0 3px 10px rgba(37,99,235,0.25)',
                        border: isAgent ? '1px solid #E2E8F0' : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                      {msg.time}
                    </span>
                  </div>
                );
              })}

              {isAgentTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#FFFFFF', borderRadius: 14, width: 'fit-content', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Officer is typing</span>
                  <span style={{ display: 'inline-flex', gap: 3 }}>
                    <span style={{ width: 4, height: 4, background: '#2563EB', borderRadius: '50%' }} />
                    <span style={{ width: 4, height: 4, background: '#2563EB', borderRadius: '50%' }} />
                    <span style={{ width: 4, height: 4, background: '#2563EB', borderRadius: '50%' }} />
                  </span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '12px 16px',
                background: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendLiveMessage()}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 22,
                  border: '1.5px solid #E2E8F0',
                  outline: 'none',
                  fontSize: 14,
                  background: '#F8FAFC',
                }}
              />

              <button
                onClick={handleSendLiveMessage}
                disabled={!inputMsg.trim()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: inputMsg.trim() ? '#2563EB' : '#E2E8F0',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputMsg.trim() ? 'pointer' : 'default',
                  boxShadow: inputMsg.trim() ? '0 3px 8px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                <IonIcon icon={send} style={{ fontSize: 17, marginLeft: 2 }} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile bottom clearance spacer for fixed BottomNav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
