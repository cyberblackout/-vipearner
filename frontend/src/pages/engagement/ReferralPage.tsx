import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  copyOutline,
  checkmarkOutline,
  closeOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../stores/auth';
import { callEdgeFunction } from '../../lib/supabase';
import { formatGHS, formatDate } from '../../lib/formatters';
import BottomNav from '../../components/BottomNav';
import AppBackButton from '../../components/AppBackButton';

interface ReferralStats {
  referral_code: string;
  total: number;
  rewarded: number;
  pending: number;
  total_earned: number;
  referrals: Array<{
    id: string;
    reward_amount: number;
    reward_paid: boolean;
    paid_at: string | null;
    created_at: string;
    referred?: {
      id: string;
      display_name: string;
      created_at: string;
    };
  }>;
}

export default function ReferralPage() {
  const { profile } = useAuthStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data: any = await callEdgeFunction('get-referral-stats');
        if (data && data.referral_code) {
          setStats(data);
        }
      } catch (e) {
        console.warn('Could not fetch referral stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Dynamic user data
  const referralCode = profile?.referral_code || stats?.referral_code || '';
  const referralLink = referralCode ? `https://vipearner.com/#/register?ref=${referralCode}` : 'https://vipearner.com/#/register';

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard?.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSaveQR = () => {
    alert('QR Code saved to gallery!');
  };

  return (
    <IonPage>
      {/* ══════════════════════════════════════════════════════
          1. TOP NAVIGATION BAR (Clean White with Back Arrow)
      ══════════════════════════════════════════════════════ */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <AppBackButton fallback="/home" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>
            Share and earn coins
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <div style={{ paddingBottom: 85, width: '100%' }}>
          {/* ══════════════════════════════════════════════════════
              2. TOP HERO COMMISSION BANNER (Dark Obsidian + Yellow)
          ══════════════════════════════════════════════════════ */}
          <div
            style={{
              background: '#1A1412',
              padding: '24px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Geometric Gold Glow */}
            <div
              style={{
                position: 'absolute',
                right: -20,
                top: -20,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: '0 0 6px',
                  lineHeight: 1.25,
                }}
              >
                Share and earn coins{' '}
                <span style={{ color: '#FBBF24' }}>Get 30%+15% commission instantly</span>
              </h1>

              {/* Yellow "View" Pill Button */}
              <button
                onClick={() => setShowBonusModal(true)}
                style={{
                  background: '#F59E0B',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 24px',
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#1A1412',
                  cursor: 'pointer',
                  marginTop: 10,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                }}
              >
                View
              </button>
            </div>
          </div>

          <div style={{ padding: '14px 14px 0' }}>
            {/* ══════════════════════════════════════════════════════
                3. COMMISSION RATE & QR CARD
            ══════════════════════════════════════════════════════ */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '20px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 10px',
                }}
              >
                Commission rate
              </h2>

              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 6px' }}>
                Invite friends and earn 45% commission. Example: A-B-C
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 4px' }}>
                1. A can receive a 30% commission from B's investment returns;
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                2. A can receive a 15% commission from C's investment returns;
              </p>

              {/* QR Code and Save Button Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  paddingBottom: 16,
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: 16,
                }}
              >
                {/* SVG Rendered QR Code */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: 8,
                    display: 'inline-flex',
                  }}
                >
                  <svg width="88" height="88" viewBox="0 0 100 100" fill="none">
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="30" height="30" rx="4" stroke="#0F172A" strokeWidth="6" />
                    <rect x="14" y="14" width="12" height="12" fill="#0F172A" />
                    {/* Corner 2 */}
                    <rect x="65" y="5" width="30" height="30" rx="4" stroke="#0F172A" strokeWidth="6" />
                    <rect x="74" y="14" width="12" height="12" fill="#0F172A" />
                    {/* Corner 3 */}
                    <rect x="5" y="65" width="30" height="30" rx="4" stroke="#0F172A" strokeWidth="6" />
                    <rect x="14" y="74" width="12" height="12" fill="#0F172A" />
                    {/* Data modules */}
                    <rect x="44" y="10" width="8" height="8" fill="#0F172A" />
                    <rect x="44" y="24" width="8" height="8" fill="#0F172A" />
                    <rect x="12" y="44" width="8" height="8" fill="#0F172A" />
                    <rect x="28" y="44" width="8" height="8" fill="#0F172A" />
                    <rect x="44" y="44" width="12" height="12" fill="#2563EB" />
                    <rect x="64" y="44" width="8" height="8" fill="#0F172A" />
                    <rect x="80" y="44" width="8" height="8" fill="#0F172A" />
                    <rect x="44" y="64" width="8" height="8" fill="#0F172A" />
                    <rect x="44" y="80" width="8" height="8" fill="#0F172A" />
                    <rect x="65" y="65" width="10" height="10" fill="#0F172A" />
                    <rect x="82" y="78" width="10" height="10" fill="#0F172A" />
                  </svg>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveQR}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #94A3B8',
                    borderRadius: 6,
                    padding: '6px 18px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#2563EB',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>

              {/* Referral Code Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#F8FAFC',
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  My referral code <strong style={{ color: '#0F172A', marginLeft: 6, fontSize: 14 }}>{referralCode}</strong>
                </div>

                <button
                  onClick={() => copyToClipboard(referralCode, false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedCode ? '#10B981' : '#64748B',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IonIcon icon={copiedCode ? checkmarkOutline : copyOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              {/* Referral Link Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#F8FAFC',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '85%',
                  }}
                >
                  Referral link <span style={{ color: '#2563EB', marginLeft: 6 }}>{referralLink}</span>
                </div>

                <button
                  onClick={() => copyToClipboard(referralLink, true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedLink ? '#10B981' : '#64748B',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IonIcon icon={copiedLink ? checkmarkOutline : copyOutline} style={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                4. HOW TO GET COMMISSION STEPPER
            ══════════════════════════════════════════════════════ */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '20px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 16px',
                }}
              >
                How to get commission
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    🤝
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                      ① Become a partner
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Copy the exclusive referral link &amp; invite your network.
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    📈
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                      ② Friends invest and earn
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Your invitees stake crypto or GHS into yield products.
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#D1FAE5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    💰
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                      ③ Instant 30%+15% cash payout
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Commissions are credited in real-time and withdrawable directly to your MoMo or crypto wallet.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                5. LIVE TEAM STATS & INVITED MEMBERS
            ══════════════════════════════════════════════════════ */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '20px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  My Referral Team
                </h2>
                {loading && <IonSpinner name="crescent" color="primary" style={{ width: 18, height: 18 }} />}
              </div>

              {/* 3 Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: '#F8FAFC',
                  borderRadius: 12,
                  padding: '12px 6px',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Invited</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginTop: 3 }}>
                    {stats?.total ?? 0}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Rewarded</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', marginTop: 3 }}>
                    {stats?.rewarded ?? 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Earned</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#2563EB', marginTop: 3 }}>
                    {formatGHS(stats?.total_earned ?? 0)}
                  </div>
                </div>
              </div>

              {/* Team List or Empty State */}
              {(!stats?.referrals || stats.referrals.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#94A3B8', fontSize: 12.5 }}>
                  No members joined using your referral link yet. Share your code to earn 45% team commissions!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.referrals.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                          {item.referred?.display_name || 'VIP Member'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                          Joined {formatDate(item.created_at)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>
                          +{formatGHS(Number(item.reward_amount))}
                        </div>
                        <div style={{ fontSize: 10.5, color: item.reward_paid ? '#10B981' : '#F59E0B', fontWeight: 700 }}>
                          {item.reward_paid ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            5. MULTI-TIER ACHIEVEMENT BONUS POPUP (From Frame 0330s)
        ══════════════════════════════════════════════════════ */}
        {showBonusModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '22px 18px',
                maxWidth: 420,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowBonusModal(false)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 22, color: '#64748B' }} />
              </button>

              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 12px' }}>
                Commission &amp; Bonus Table
              </h3>

              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
                This will be your long-term income, as you will receive a corresponding commission every time the users you referred earn profits.
              </p>

              {/* Cumulative Traded Users Bonus Table */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    background: '#F1F5F9',
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: 12,
                    color: '#0F172A',
                  }}
                >
                  <span>Cumulative Traded Users</span>
                  <span style={{ textAlign: 'right' }}>Bonus (USDT)</span>
                </div>

                {[
                  { users: 5, bonus: 10 },
                  { users: 20, bonus: 40 },
                  { users: 50, bonus: 80 },
                  { users: 100, bonus: 160 },
                  { users: 200, bonus: 300 },
                  { users: 500, bonus: 1000 },
                  { users: 1000, bonus: 2000 },
                  { users: 2000, bonus: 4000 },
                  { users: 5000, bonus: 12000 },
                  { users: 10000, bonus: 20000 },
                  { users: 50000, bonus: 140000 },
                  { users: 100000, bonus: 260000 },
                  { users: 200000, bonus: 600000 },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr',
                      padding: '8px 12px',
                      fontSize: 12,
                      borderTop: '1px solid #F1F5F9',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#334155' }}>{row.users.toLocaleString()}</span>
                    <span style={{ textAlign: 'right', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>
                      {row.bonus.toLocaleString()} USDT
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowBonusModal(false)}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* Space for bottom nav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))' }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
