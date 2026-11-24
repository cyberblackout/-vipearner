import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  volumeMediumOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import { formatGHS } from '../../lib/formatters';
import BottomNav from '../../components/BottomNav';
import { VipEarnerLogo } from '../../components/common/VipEarnerLogo';
import { QuickActionIcon } from '../../components/common/QuickActionIcon';
import { RecentWithdrawalsSection } from '../../components/common/RecentWithdrawalsSection';
import { TrustFooter } from '../../components/common/TrustFooter';
import LanguageFlag from '../../components/common/LanguageFlag';
import { InvestmentProductCard } from '../../components/common/InvestmentProductCard';
import { VipIncomeTable } from '../../components/common/VipIncomeTable';
import { PRODUCTS_CATALOG, CryptoStakingProduct, COIN_CHIPS as COIN_TABS } from '../../data/cryptoProducts';
import { useNavigationStore } from '../../stores/navigationStore';

/* ── 1. CAROUSEL BANNERS (FEATURING USER CRYPTO ASSETS) ───────────── */
const BANNERS = [
  {
    id: 1,
    type: 'newUser' as const,
    image: '/images/banners/banner1.jpg',
    accentTag: '#38BDF8',
    mainTitle: 'Exclusive for',
    mainTitleSub: 'New Users',
    rateBadge: '365% Rate of Return',
    durationBadge: '2 Day Trial Experience Principal',
    link: '/vip',
  },
  {
    id: 2,
    type: 'invite' as const,
    image: '/images/banners/banner2.jpg',
    accentTag: '#FBBF24',
    mainTitle: 'Invite Friends',
    mainTitleSub: '45% Commission',
    rateBadge: 'Level 1: 30% • Level 2: 15% Bonus',
    durationBadge: 'Instant MoMo & Crypto Commission Payouts',
    link: '/referral',
  },
  {
    id: 3,
    type: 'welfare' as const,
    image: '/images/banners/banner3.png',
    accentTag: '#34D399',
    mainTitle: 'Crypto Staking',
    mainTitleSub: 'Quantitative Yields',
    rateBadge: 'Highest Rate of Return +30%',
    durationBadge: '100% Principal Returned on Maturity',
    link: '/welfare',
  },
];

/* ── 2. QUICK ACTION GRID (8 EXACT ICONS FROM REFERENCE) ──────── */
const QUICK_ACTIONS: { label: string; href: string; icon: string; color: string; external?: boolean }[] = [
  { label: 'Deposit', href: '/deposit', icon: '📥', color: '#3B82F6' },
  { label: 'Withdraw', href: '/withdraw', icon: '📤', color: '#10B981' },
  { label: 'Message', href: '/notifications', icon: '💬', color: '#8B5CF6' },
  { label: 'License', href: '/license', icon: '📜', color: '#F59E0B' },
  { label: 'FAQ', href: '#faq', icon: '❓', color: '#2563EB' },
  { label: 'Invite Friends', href: '/referral', icon: '👥', color: '#EC4899' },
  { label: 'Download App', href: '/profile', icon: '📲', color: '#6366F1' },
  { label: 'Customer Svc', href: '/customer-service', icon: '🎧', color: '#14B8A6' },
];

/* ── 3. CRYPTO PRODUCTS (BTC, ETH, USDT, USDC, TRX, etc.) ───────────── */
type CryptoProduct = CryptoStakingProduct;
const PRODUCTS: CryptoProduct[] = PRODUCTS_CATALOG;


export default function HomePage() {
  const history = useHistory();
  const { profile, setProfile } = useAuthStore();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'Regular Products' | 'Current Products'>('Regular Products');
  const [selectedCoin, setSelectedCoin] = useState('ALL');
  const [pledgeModal, setPledgeModal] = useState<CryptoProduct | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  // Android back button: close pledge modal if open
  useEffect(() => {
    if (pledgeModal) {
      return useNavigationStore.getState().registerModal('pledgeModal', () => setPledgeModal(null));
    }
  }, [pledgeModal]);

  const handleActivatePlan = async () => {
    if (!pledgeModal) return;
    const cost = pledgeModal.priceNum || parseFloat((pledgeModal.priceGHS || pledgeModal.minAmount || '120').replace(/[^0-9.]/g, '')) || 120;
    const currentBalance = profile?.balance ?? 0;

    if (currentBalance < cost) {
      if (confirm(`Insufficient balance (${formatGHS(currentBalance)}). This VIP contract requires ${formatGHS(cost)}. Would you like to deposit now?`)) {
        setPledgeModal(null);
        history.push(`/deposit?amount=${cost}`);
      }
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const newBalance = currentBalance - cost;
        const newWorkDeposit = (profile?.work_deposit ?? 0) + cost;
        const targetVip = pledgeModal.name || 'VIP 1';

        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({
            balance: newBalance,
            work_deposit: newWorkDeposit,
            vip_level: targetVip,
            vip_upgraded_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (err) {
      console.error('Plan activation error:', err);
    }
    setPledgeSuccess(true);
  };

  // Auto-scroll banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCategory = p.category === selectedCategory;
    const matchCoin = selectedCoin === 'ALL' || p.coin === selectedCoin;
    return matchCategory && matchCoin;
  });

  const handleOpenPledge = (prod: CryptoProduct) => {
    setPledgeModal(prod);
    setPledgeAmount('');
    setPledgeSuccess(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#F4F6F9' }}>
        {/* ══════════════════════════════════════════════════════
            1. TOP NAVBAR (Logo + Domain + Language Selector)
        ══════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <VipEarnerLogo size={28} showText={true} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Language Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <LanguageFlag language="English" size={17} />
              <span>English</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            2. NOTICE MARQUEE / TICKER
        ══════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#EFF6FF',
            borderBottom: '1px solid #DBEAFE',
            padding: '7px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#1D4ED8',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <IonIcon
            icon={volumeMediumOutline}
            style={{
              fontSize: 16,
              flexShrink: 0,
              color: '#2563EB',
              zIndex: 2,
              background: '#EFF6FF',
              paddingRight: 4,
            }}
          />
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              position: 'relative',
              display: 'flex',
            }}
          >
            <div className="notice-marquee-content">
              <span style={{ paddingRight: 48, fontWeight: 500 }}>
                📢 Notice: For registration or MoMo deposit issues, contact our Ghana support team on WhatsApp (+233 544 269 465).
              </span>
              <span style={{ paddingRight: 48, fontWeight: 500 }}>
                📢 Notice: For registration or MoMo deposit issues, contact our Ghana support team on WhatsApp (+233 544 269 465).
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            3. HERO BANNER CAROUSEL (FEATURING CRYPTO ASSETS)
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '12px 14px 6px' }}>
          <div
            onClick={() => history.push(BANNERS[bannerIdx].link)}
            style={{
              position: 'relative',
              borderRadius: 18,
              overflow: 'hidden',
              minHeight: 154,
              background: '#0B111E',
              boxShadow: '0 8px 24px -4px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.4s ease',
            }}
          >
            {/* Real Photographic Background Image */}
            <img
              src={BANNERS[bannerIdx].image}
              alt="Crypto banner visual"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '62%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                filter: 'brightness(0.96) contrast(1.05)',
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 25%, black 65%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 25%, black 65%)',
              }}
            />

            {/* High-contrast gradient scrim for crystal clear readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #0B111E 0%, rgba(11, 17, 30, 0.96) 42%, rgba(11, 17, 30, 0.6) 72%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Banner Left Content Area */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '18px 18px 14px',
                maxWidth: '68%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 154,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: BANNERS[bannerIdx].accentTag,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: 2,
                  }}
                >
                  {BANNERS[bannerIdx].mainTitle}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.15,
                    marginBottom: 8,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {BANNERS[bannerIdx].mainTitleSub}
                </div>

                {/* Highlight Tag */}
                <div
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    color: '#F8FAFC',
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 5,
                    marginBottom: 4,
                  }}
                >
                  {BANNERS[bannerIdx].rateBadge}
                </div>

                {/* Subtitle / Note */}
                <div style={{ fontSize: 10.5, fontWeight: 600, color: '#94A3B8', marginTop: 2 }}>
                  {BANNERS[bannerIdx].durationBadge}
                </div>
              </div>

              {/* Pagination Indicators */}
              <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
                {BANNERS.map((_, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerIdx(i);
                    }}
                    style={{
                      width: i === bannerIdx ? 18 : 6,
                      height: 4,
                      borderRadius: 2,
                      background: i === bannerIdx ? '#38BDF8' : 'rgba(255,255,255,0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            4. 8-ICON QUICK ACTION GRID (Exact 2x4 Layout)
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '6px 14px 10px' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '14px 10px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 14, columnGap: 6 }}>
              {QUICK_ACTIONS.map((action) => {
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    target={action.external ? '_blank' : undefined}
                    rel={action.external ? 'noreferrer' : undefined}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none',
                      gap: 6,
                    }}
                  >
                    <QuickActionIcon name={action.label} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#374151',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {action.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            5. RECENT WITHDRAWAL ACTIVITY (Trust Feed)
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 14px 12px' }}>
          <RecentWithdrawalsSection />
        </div>

        {/* ══════════════════════════════════════════════════════
            6. NEW USER BENEFITS PROGRESS CARD (3 Steps)
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 14px 10px' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                padding: '12px 16px',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>New User Benefits</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Complete beginner journey &amp; claim bonus</div>
              </div>
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                1 / 3 Done
              </span>
            </div>

            {/* Stepper Rows */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: '#10B981' }}>✓</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>1. Sign Up Account</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Account registered &amp; verified</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#D1FAE5', padding: '3px 8px', borderRadius: 6 }}>
                  Completed
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: '#9CA3AF' }}>○</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>2. Deposit Telecel Cash</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Deposit via Telecel Cash (min GHS 20)</div>
                  </div>
                </div>
                <a
                  href="/deposit"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: '#2563EB',
                    padding: '4px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                  }}
                >
                  Deposit →
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: '#9CA3AF' }}>○</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>3. First Trade / Investment</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Earn high daily interest profits</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
                  Locked
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            6. WELFARE BLIND BOX PROMO CARD
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 14px 12px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
              borderRadius: 16,
              padding: '14px 16px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🎁</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Welfare Blind Box</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                  Register and get a chance to win a blind box!
                </div>
              </div>
            </div>
            <a
              href="/welfare"
              style={{
                background: '#F59E0B',
                color: '#78350F',
                fontSize: 12,
                fontWeight: 800,
                padding: '8px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Open Box
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            8. PRODUCTS SECTION (Tabs + Coins + Cards)
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 14px 28px' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            {/* Category Segment Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #E5E7EB',
                background: '#F8FAFC',
              }}
            >
              {(['Regular Products', 'Current Products'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    flex: 1,
                    padding: '13px 0',
                    border: 'none',
                    background: selectedCategory === cat ? '#FFFFFF' : 'transparent',
                    borderBottom: selectedCategory === cat ? '2px solid #2563EB' : '2px solid transparent',
                    color: selectedCategory === cat ? '#2563EB' : '#64748B',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Coin Filter Chips (Horizontal) */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '12px 14px',
                overflowX: 'auto',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              {COIN_TABS.map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: selectedCoin === coin ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    background: selectedCoin === coin ? '#EFF6FF' : '#FFFFFF',
                    color: selectedCoin === coin ? '#2563EB' : '#64748B',
                    fontWeight: selectedCoin === coin ? 700 : 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {coin}
                </button>
              ))}
            </div>

            {/* Product Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
              {filteredProducts.map((prod) => (
                <InvestmentProductCard
                  key={prod.id}
                  product={prod}
                  onPledge={(p, dur) => {
                    const days = parseInt(dur) || (p as any).durationDays || 180;
                    handleOpenPledge({
                      ...p,
                      name: p.title,
                      apy: p.annualizedRate,
                      duration: dur,
                      durationDays: days,
                      totalIncomeGHS: `GH₵ ${((p.dailyRateNum || 6.5) * days).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      minAmount: p.minAmount,
                    } as any);
                  }}
                />
              ))}

              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF' }}>
                  No investment products found for {selectedCoin}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            9. BITCOIN & FINTECH SECURITY TRUST FOOTER
        ══════════════════════════════════════════════════════ */}
        <TrustFooter />

        {/* ══════════════════════════════════════════════════════
            10. PLEDGE / STAKING BOTTOM SHEET MODAL (Screens 058-062)
        ══════════════════════════════════════════════════════ */}
        {pledgeModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setPledgeModal(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                width: '100%',
                borderRadius: '24px 24px 0 0',
                padding: '24px 20px 32px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Drag Handle */}
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: '#E2E8F0',
                  borderRadius: 2,
                  margin: '0 auto 16px',
                }}
              />

              {!pledgeSuccess ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1F2937' }}>
                      {pledgeModal.name}
                    </h3>
                    <span
                      style={{
                        background: '#D1FAE5',
                        color: '#065F46',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {pledgeModal.apy}
                    </span>
                  </div>

                  {/* User Wallet Balance Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#F1F5F9',
                      borderRadius: 10,
                      padding: '8px 14px',
                      marginBottom: 14,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Your Balance</span>
                    <strong style={{ color: '#2563EB', fontSize: 14 }}>{formatGHS(profile?.balance ?? 0)}</strong>
                  </div>

                  {/* Dark VIP Breakdown Table matching Exact Reference Image (Black Card) */}
                  <div style={{ marginBottom: 16 }}>
                    <VipIncomeTable
                      vipLevel={pledgeModal.name || 'VIP1'}
                      investmentAmount={pledgeModal.priceNum || parseFloat((pledgeModal.priceGHS || pledgeModal.minAmount || '120').replace(/[^0-9.]/g, '')) || 120}
                      dailyIncome={pledgeModal.dailyRateNum || parseFloat((pledgeModal.dailyIncomeGHS || '6.5').replace(/[^0-9.]/g, '')) || 6.5}
                      durationDays={parseInt(pledgeModal.duration) || pledgeModal.durationDays || 180}
                    />
                  </div>

                  {/* Amount Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                      Pledge Amount ({pledgeModal.coin})
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: 10,
                        padding: '0 12px',
                        height: 48,
                      }}
                    >
                      <input
                        type="number"
                        placeholder={`Min ${pledgeModal.minAmount}`}
                        value={pledgeAmount}
                        onChange={(e) => setPledgeAmount(e.target.value)}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      />
                      <button
                        onClick={() => setPledgeAmount(String(profile?.balance ?? 100))}
                        style={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ALL
                      </button>
                    </div>
                  </div>

                  {/* Rules Disclosure from reference */}
                  <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4, marginBottom: 20 }}>
                    Fixed deposit is a digital asset yield plan. After depositing,
                    the contract is executed immediately. Earnings are paid daily and automatically credited to your wallet in GHS.
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => setPledgeModal(null)}
                      style={{
                        height: 46,
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleActivatePlan}
                      style={{
                        height: 46,
                        borderRadius: 10,
                        border: 'none',
                        background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      Activate Plan
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1F2937' }}>
                    Plan Successfully Activated!
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>
                    Your {pledgeAmount || pledgeModal.minAmount} {pledgeModal.coin} plan has been successfully activated.
                    Daily returns will be credited automatically.
                  </p>
                  <button
                    onClick={() => setPledgeModal(null)}
                    style={{
                      width: '100%',
                      height: 46,
                      borderRadius: 10,
                      border: 'none',
                      background: '#10B981',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom spacer for tab navigation */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))' }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
