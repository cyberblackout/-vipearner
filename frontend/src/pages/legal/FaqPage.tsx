import { useState, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import {
  chevronDownOutline,
  chevronUpOutline,
  searchOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  headsetOutline,
  sparklesOutline,
  walletOutline,
  cashOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import AppBackButton from '../../components/AppBackButton';

interface FaqItem {
  id: string;
  category: 'vip' | 'deposit' | 'withdraw' | 'security';
  q: string;
  a: string;
  sensitive?: boolean;
  highlight?: string;
}

const FAQ_DATA: FaqItem[] = [
  // ── VIP & EARNINGS ──
  {
    id: 'vip-1',
    category: 'vip',
    q: 'How do VipEarner daily staking earnings work?',
    a: 'Once your VIP contract is activated, our automated algorithmic liquidity routing engine begins generating daily yields immediately. Earnings are calculated on your active principal and credited directly into your available balance every 24 hours at 00:00 UTC.',
    highlight: 'Daily automated dividend distributions every 24 hours.',
  },
  {
    id: 'vip-2',
    category: 'vip',
    q: 'What is the minimum VIP contract price and duration?',
    a: 'VIP plans start from a minimum of GH₵ 250.00 (e.g. the TRX Periodically plan). In strict adherence to institutional stability standards, contracts are offered exclusively in two fixed, predictable terms: 180 Days and 360 Days.',
    highlight: 'Minimum VIP is GH₵ 250.00 • Terms: 180 Days & 360 Days.',
  },
  {
    id: 'vip-3',
    category: 'vip',
    q: 'Is my principal investment refunded when the contract ends?',
    a: 'Yes, absolutely. 100% of your initial contract principal is fully unlocked and credited back to your withdrawable wallet balance immediately upon the expiration of your 180-day or 360-day staking term.',
    highlight: '100% principal guarantee upon contract maturity.',
  },
  {
    id: 'vip-4',
    category: 'vip',
    q: 'Can I run multiple VIP contracts at the same time?',
    a: 'Yes, members are allowed to hold and activate multiple concurrent VIP contracts across different supported digital assets (TRX, BTC, ETH, USDT, SOL, etc.) to diversify their daily earnings.',
  },

  // ── DEPOSIT & TELECEL CASH ──
  {
    id: 'dep-1',
    category: 'deposit',
    q: 'How do I deposit funds via Telecel Cash (Exclusive Network)?',
    a: '1. Navigate to the Deposit page.\n2. Note the authorized recipient account: 0201634748 (GBETI GODSWAY).\n3. Open your Telecel Cash menu (*110# or Telecel App) and send the exact deposit amount.\n4. Input your phone number and transaction reference ID on the deposit form, upload your receipt screenshot, and tap Confirm Deposit.',
    highlight: 'Authorized Recipient: 0201634748 (GBETI GODSWAY).',
  },
  {
    id: 'dep-2',
    category: 'deposit',
    q: 'What is the minimum deposit allowed on VipEarner?',
    a: 'The platform minimum deposit is GH₵ 250.00. Any deposits lower than this threshold cannot activate a VIP contract and will be placed in pending review.',
    highlight: 'Minimum deposit is GH₵ 250.00.',
  },
  {
    id: 'dep-3',
    category: 'deposit',
    q: 'How long does it take for a Telecel Cash deposit to be approved?',
    a: 'Telecel Cash deposits are typically verified and credited to your wallet balance within 2 to 5 minutes after submission. During peak network hours, telecom network confirmation may take up to 10 minutes.',
  },
  {
    id: 'dep-4',
    category: 'deposit',
    q: 'What should I do if my deposit is delayed or not showing?',
    a: 'Ensure you uploaded a clear payment screenshot displaying the Telecel transaction ID and sender number. You can check the real-time status in Deposit History or contact our 24/7 Online Customer Service with your Transaction ID for immediate priority escalation.',
  },

  // ── WITHDRAWALS & MOMO ──
  {
    id: 'with-1',
    category: 'withdraw',
    q: 'Which networks can I withdraw my funds to?',
    a: 'VipEarner provides direct automated cashouts to all major Ghanaian Mobile Money providers: MTN Mobile Money (MoMo), Telecel Cash, and AT Money (AirtelTigo).',
    highlight: 'Supported: MTN MoMo, Telecel Cash & AT Money.',
  },
  {
    id: 'with-2',
    category: 'withdraw',
    q: 'How fast do withdrawal payouts arrive in my phone wallet?',
    a: 'Withdrawal requests are processed via our high-speed automated telecom gateway within 5 to 15 minutes directly to your Mobile Money account. Peak telecommunication banking hours may occasionally see settlement in 30 to 60 minutes.',
    highlight: 'Average payout arrival time: 5–15 minutes.',
  },
  {
    id: 'with-3',
    category: 'withdraw',
    q: 'What is the withdrawal fee and minimum withdrawal limit?',
    a: 'The minimum withdrawal is GH₵ 50.00, and standard daily maximum is GH₵ 5,000.00. A standard 5% telecom payment switch fee is deducted to cover automated carrier transaction charges and liquidity rail costs.',
  },
  {
    id: 'with-4',
    category: 'withdraw',
    sensitive: true,
    q: 'Crucial: What happens if I enter an incorrect phone number for cashout?',
    a: 'Because mobile money transfers are executed instantaneously and irreversibly through telecom APIs, payouts sent to an incorrect or unregistered number cannot be reversed by telecom operators. Always verify that your account number and registered name match before tapping Submit Withdrawal.',
  },

  // ── SECURITY & SENSITIVE ADVISORIES ──
  {
    id: 'sec-1',
    category: 'security',
    sensitive: true,
    q: 'Sensitive Warning: Protecting your Mobile Money PIN and password',
    a: 'VipEarner administrators, system bots, or customer service representatives will NEVER ask for your Mobile Money PIN, account password, or SMS OTP verification code. Under no circumstances should you ever reveal your PIN or OTP to anyone claiming to be from VipEarner support.',
    highlight: 'NEVER share your MoMo PIN, password, or SMS OTP with anyone.',
  },
  {
    id: 'sec-2',
    category: 'security',
    q: 'What is the official domain of VipEarner platform?',
    a: 'Our sole official, verified domain is www.vipearner.com. Beware of phishing links or fraudulent impersonators on social messaging apps. Always verify the domain in your browser URL bar before logging in or making deposits.',
    highlight: 'Official Domain: www.vipearner.com',
  },
  {
    id: 'sec-3',
    category: 'security',
    q: 'How are platform liquidity reserves and user funds protected?',
    a: 'Over 95% of platform liquidity is held in geographically distributed, multi-signature cold vaults. All smart contracts and daily dividend allocation algorithms are audited in partnership with institutional blockchain custodians, guaranteeing 100% reserve solvency.',
    highlight: '1:1 Audited Collateralization & Multi-Sig Vaults.',
  },
  {
    id: 'sec-4',
    category: 'security',
    q: 'How do referral commissions and rebates work?',
    a: 'When you invite friends using your unique referral link or Invitation Code, you receive multi-tier instant bonuses (Tier 1: 30%, Tier 2: 15%) whenever your invitee activates an investment plan. Rebates are credited instantly to your withdrawable balance.',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All Questions', icon: sparklesOutline },
  { key: 'vip', label: 'VIP & Earnings', icon: walletOutline },
  { key: 'deposit', label: 'Telecel Deposit', icon: cashOutline },
  { key: 'withdraw', label: 'MoMo Cashout', icon: walletOutline },
  { key: 'security', label: 'Security & Safety', icon: lockClosedOutline },
];

export default function FaqPage() {
  const history = useHistory();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'vip-1': true, 'sec-1': true });

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <AppBackButton fallback="/profile" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>
            Help &amp; FAQ
          </IonTitle>
          <IonButtons slot="end">
            <button
              onClick={() => history.push('/customer-service')}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#2563EB',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <IonIcon icon={headsetOutline} style={{ fontSize: 18 }} />
              <span>Help</span>
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <div style={{ padding: '16px 16px 90px', width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {/* ── 1. TOP HEADER BANNER ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)',
              borderRadius: 18,
              padding: '18px 16px',
              color: '#FFFFFF',
              marginBottom: 16,
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Knowledge Center
              </span>
              <span style={{ fontSize: 11, color: '#93C5FD', fontWeight: 600 }}>
                Official Platform Guidance
              </span>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 900, letterSpacing: '-0.01em' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ margin: 0, fontSize: 12.5, color: '#E2E8F0', lineHeight: 1.5 }}>
              Find transparent, verified answers about VIP contract yields, Telecel Cash deposits, MoMo cashouts, and our security architecture.
            </p>
          </div>

          {/* ── 2. SENSITIVE ADVISORY BANNER ── */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 16,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <IonIcon icon={alertCircleOutline} style={{ color: '#D97706', fontSize: 22, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#92400E' }}>
                Sensitive Security Notice
              </div>
              <div style={{ fontSize: 11.5, color: '#78350F', marginTop: 2, lineHeight: 1.45 }}>
                VipEarner will <strong>NEVER</strong> ask for your Mobile Money PIN, wallet OTP, or account password. Only use our official domain <strong>www.vipearner.com</strong>.
              </div>
            </div>
          </div>

          {/* ── 3. SEARCH INPUT BAR ── */}
          <div
            style={{
              position: 'relative',
              marginBottom: 14,
            }}
          >
            <IonIcon
              icon={searchOutline}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                fontSize: 18,
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. deposit, 180 days, Telecel)..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: 12,
                border: '1.5px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: 13,
                color: '#0F172A',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            />
          </div>

          {/* ── 4. CATEGORY PILL TABS ── */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 6,
              marginBottom: 16,
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 20,
                    border: active ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                    background: active ? '#2563EB' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  <IonIcon icon={cat.icon} style={{ fontSize: 14 }} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── 5. FAQ ACCORDION LIST ── */}
          {filteredFaqs.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '32px 16px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>No matching questions found</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                Try adjusting your search terms or contact Customer Support.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredFaqs.map((item) => {
                const isOpen = !!openIds[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      background: item.sensitive && isOpen ? '#FFFBEB' : '#FFFFFF',
                      borderRadius: 14,
                      border: isOpen
                        ? item.sensitive
                          ? '1.5px solid #F59E0B'
                          : '1.5px solid #2563EB'
                        : '1px solid #E2E8F0',
                      boxShadow: isOpen ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      onClick={() => toggleAccordion(item.id)}
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.sensitive && (
                          <span
                            style={{
                              background: '#FEE2E2',
                              color: '#DC2626',
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                              flexShrink: 0,
                            }}
                          >
                            CRUCIAL
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: isOpen ? (item.sensitive ? '#B45309' : '#1D4ED8') : '#0F172A',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.q}
                        </span>
                      </div>
                      <IonIcon
                        icon={isOpen ? chevronUpOutline : chevronDownOutline}
                        style={{
                          fontSize: 18,
                          color: isOpen ? '#2563EB' : '#94A3B8',
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    {isOpen && (
                      <div
                        style={{
                          padding: '0 16px 16px',
                          borderTop: item.sensitive ? '1px solid #FDE68A' : '1px solid #F1F5F9',
                          paddingTop: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#334155',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {item.a}
                        </div>

                        {item.highlight && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: item.sensitive ? '#FEF3C7' : '#EFF6FF',
                              border: item.sensitive ? '1px solid #FCD34D' : '1px solid #DBEAFE',
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: item.sensitive ? '#92400E' : '#1E40AF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 16 }} />
                            <span>{item.highlight}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 6. STILL HAVE QUESTIONS? CALL TO ACTION ── */}
          <div
            style={{
              marginTop: 24,
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                Still have questions?
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                Our 24/7 VIP desk is available to assist you in real time.
              </div>
            </div>
            <button
              onClick={() => history.push('/customer-service')}
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <IonIcon icon={headsetOutline} style={{ fontSize: 15 }} />
              <span>Contact Us</span>
            </button>
          </div>

          {/* Mobile bottom clearance spacer for fixed BottomNav */}
          <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
        </div>
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
