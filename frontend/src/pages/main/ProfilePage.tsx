import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  chevronForwardOutline,
  copyOutline,
  checkmarkCircle,
  closeOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import LanguageFlag from '../../components/common/LanguageFlag';
import VipEarnerLogo from '../../components/common/VipEarnerLogo';

export default function ProfilePage() {
  const history = useHistory();
  const { profile, setProfile, logout } = useAuthStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);
  const [hideBalance, setHideBalance] = useState(false);

  // Referral & Financial Stats
  const [invitedCount, setInvitedCount] = useState<number>(0);
  const [investedCount, setInvestedCount] = useState<number>(0);
  const [myRebateUSDT, setMyRebateUSDT] = useState<string>('0.00');
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState<number>(0);

  // FAQ open accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Selected language state (Sticky English with opacity animation)
  const [langPressed, setLangPressed] = useState(false);
  const currentLanguage = 'English';

  const referralCode = profile?.referral_code || '';
  const userPhone = profile?.phone || '';
  const officialDomain = 'www.vipearner.com';

  // Derived financial values
  const withdrawableBalance = profile?.balance ?? 0;
  const displayTotalIncome = profile?.total_income ?? 0;
  const displayTotalWithdrawn = profile?.total_withdrawals ?? totalWithdrawal ?? 0;
  const displayWorkDeposit = profile?.work_deposit ?? totalDeposit ?? 0;

  // STRICT VIP VALIDATION:
  // A new user without deposit or with 0 active work deposit CANNOT be VIP 1+.
  // They are VIP 0 (unactivated/free member) until they deposit/activate a plan.
  const hasActiveDeposit = displayWorkDeposit > 0 || totalDeposit > 0;
  const isVipActive =
    hasActiveDeposit &&
    Boolean(profile?.vip_level) &&
    profile?.vip_level !== 'Intern' &&
    profile?.vip_level !== 'VIP 0';
  const vipTier = isVipActive ? profile!.vip_level : 'VIP 0';

  // Load actual referral stats & transaction metrics if available
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch latest profile state from database
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (dbProfile) {
          setProfile(dbProfile);
        }

        // 1. Fetch deposit & withdrawal totals
        const { data: txs } = await supabase
          .from('transactions')
          .select('amount, type, status')
          .eq('user_id', user.id);

        if (txs && txs.length > 0) {
          const dep = txs
            .filter((t) => t.type === 'deposit' && t.status === 'success')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          const wth = txs
            .filter((t) => t.type === 'withdrawal' && t.status === 'success')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          setTotalDeposit(dep);
          setTotalWithdrawal(wth);
        }

        // 2. Fetch referrals
        const { data: refs } = await supabase
          .from('referrals')
          .select('id, referred_id, reward_amount, reward_paid')
          .eq('referrer_id', user.id);

        if (refs && refs.length > 0) {
          setInvitedCount(refs.length);
          const activeRefs = refs.filter((r) => r.reward_paid || (Number(r.reward_amount) || 0) > 0);
          setInvestedCount(activeRefs.length);
          const totalRebate = refs.reduce((acc, curr) => acc + (Number(curr.reward_amount) || 0), 0);
          setMyRebateUSDT(totalRebate.toFixed(2));
        }
      } catch {
        // Fallback to default zeros
      }
    };
    fetchUserData();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDomain = () => {
    navigator.clipboard?.writeText(officialDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await supabase.auth.signOut();
      logout();
      history.push('/login');
    }
  };

  const FAQ_ITEMS = [
    {
      q: 'How do VipEarner daily staking earnings work?',
      a: 'Once your VIP contract is activated, our automated algorithmic liquidity routing engine begins generating daily yields immediately. Earnings are calculated and credited directly to your available balance every 24 hours at 00:00 UTC.',
      sensitive: false,
    },
    {
      q: 'What is the minimum VIP contract price and duration?',
      a: 'The lowest VIP contract upgrade is GH₵ 10.00 (VIP 1). In strict adherence to institutional stability standards, all contracts run on two fixed terms: 180 Days or 360 Days.',
      sensitive: false,
    },
    {
      q: 'Is my initial principal refunded when the contract ends?',
      a: 'Yes, 100%. Your initial contract principal is fully unlocked and credited back into your withdrawable wallet balance immediately upon completing the 180 or 360-day term.',
      sensitive: false,
    },
    {
      q: 'How do I deposit funds via Telecel Cash (Exclusive)?',
      a: 'Send the exact deposit amount to authorized recipient 0201634748 (GBETI GODSWAY) via Telecel Cash (*110# or App), then input your reference ID and upload your receipt screenshot on the Deposit page. Verified in 2–5 minutes.',
      sensitive: false,
    },
    {
      q: 'What is the minimum deposit allowed on VipEarner?',
      a: 'The platform minimum deposit is GH₵ 250.00. Deposits lower than this threshold cannot be processed.',
      sensitive: false,
    },
    {
      q: 'Which networks are supported for withdrawals?',
      a: 'Automated direct withdrawals are supported to MTN Mobile Money, Telecel Cash, and AT Money (AirtelTigo). Funds typically arrive within 5 to 15 minutes.',
      sensitive: false,
    },
    {
      q: 'Sensitive Security: Protecting your Mobile Money PIN & OTP',
      a: 'VipEarner staff, system bots, and customer support representatives will NEVER ask for your Mobile Money PIN, account password, or SMS OTP code. Never disclose sensitive credentials to anyone.',
      sensitive: true,
    },
    {
      q: 'What is the official domain of the VipEarner platform?',
      a: 'Our sole official, verified domain is www.vipearner.com. Always verify the domain in your browser URL bar before logging in or making deposits.',
      sensitive: false,
    },
  ];

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#070D18' }}>
        {/* ══════════════════════════════════════════════════════
            1. TOP USER IDENTITY HEADER BAR
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '16px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar Circle with Cyan Ring */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                border: '2px solid rgba(56, 189, 248, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                flexShrink: 0,
              }}
            >
              <VipEarnerLogo size={30} showText={false} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {userPhone || 'VipEarner Member'}
                </span>
                <span
                  style={
                    isVipActive
                      ? {
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: 6,
                          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }
                      : {
                          background: 'rgba(148, 163, 184, 0.14)',
                          border: '1px solid rgba(148, 163, 184, 0.28)',
                          color: '#94A3B8',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: 6,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }
                  }
                >
                  {vipTier}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                  ID: {referralCode || profile?.id?.slice(0, 8) || 'User'}
                </span>
                <button
                  onClick={handleCopyCode}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '2px 7px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#38BDF8',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <IonIcon icon={copiedCode ? checkmarkCircle : copyOutline} style={{ fontSize: 11 }} />
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Headset Customer Support Quick Action */}
          <button
            onClick={() => setActiveSubModal('support')}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#38BDF8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            2. MY WALLET TOP CARD (MATCHING USER REFERENCE EXACTLY)
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 14px 12px' }}>
          <div
            style={{
              background: 'linear-gradient(145deg, #0D1626 0%, #09101C 100%)',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px 18px 18px',
              color: '#FFFFFF',
              boxShadow: '0 14px 34px -4px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
            }}
          >
            {/* Top row: My Wallet on left, Hide/Show on right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Electric Cyan Wallet Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="4.5" width="21" height="15" rx="3.5" stroke="#38BDF8" strokeWidth="2.2" />
                    <path d="M15.5 10H21.5C22.0523 10 22.5 10.4477 22.5 11V13C22.5 13.5523 22.0523 14 21.5 14H15.5C14.3954 14 13.5 13.1046 13.5 12C13.5 10.8954 14.3954 10 15.5 10Z" stroke="#38BDF8" strokeWidth="2" fill="#0D1626" />
                    <circle cx="16" cy="12" r="1" fill="#38BDF8" />
                    <path d="M4 4.5V3C4 1.89543 4.89543 1 6 1H18" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  My Wallet
                </span>
              </div>

              {/* Hide / Show Pill Button */}
              <button
                onClick={() => setHideBalance(!hideBalance)}
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 20,
                  padding: '4px 11px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {hideBalance ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
                <span>{hideBalance ? 'Show' : 'Hide'}</span>
              </button>
            </div>

            {/* WITHDRAWABLE BALANCE label */}
            <div
              style={{
                fontSize: 11,
                color: '#64748B',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: 14,
                marginBottom: 4,
              }}
            >
              WITHDRAWABLE BALANCE
            </div>

            {/* Cyan GHS Balance */}
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: '#38BDF8',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {hideBalance ? 'GHS ••••••' : `GHS ${withdrawableBalance.toFixed(2)}`}
            </div>

            {/* Inset 3-column stats box */}
            <div
              style={{
                background: 'rgba(7, 12, 22, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 14,
                padding: '12px 6px',
                margin: '16px 0 18px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                textAlign: 'center',
              }}
            >
              {/* 1. Total Income (Green) */}
              <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 4px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>
                  Total Income
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#22C55E' }}>
                  {hideBalance ? '••••' : `GHS ${displayTotalIncome.toFixed(2)}`}
                </div>
              </div>

              {/* 2. Total Withdrawn (Amber) */}
              <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 4px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>
                  Total Withdrawn
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#F59E0B' }}>
                  {hideBalance ? '••••' : `GHS ${displayTotalWithdrawn.toFixed(2)}`}
                </div>
              </div>

              {/* 3. Work Deposit (Blue) */}
              <div style={{ padding: '0 4px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>
                  Work Deposit
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#38BDF8' }}>
                  {hideBalance ? '••••' : `GHS ${displayWorkDeposit.toFixed(2)}`}
                </div>
              </div>
            </div>

            {/* Bottom Two Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Deposit Funds Button (Vibrant Blue) */}
              <button
                onClick={() => history.push('/deposit')}
                style={{
                  background: '#2563EB',
                  borderRadius: 14,
                  height: 46,
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
                <span>Deposit Funds</span>
              </button>

              {/* Withdraw Button (Dark Slate) */}
              <button
                onClick={() => history.push('/withdraw')}
                style={{
                  background: '#1E293B',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  height: 46,
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3-COLUMN REBATE STATS CARD (MATCHING DARK SLATE PALETTE) ── */}
        <div style={{ padding: '0 14px 10px' }}>
          <div
            style={{
              background: '#0E1726',
              borderRadius: 16,
              padding: '14px 10px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
              border: '1px solid #1B293E',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              textAlign: 'center',
            }}
          >
            {/* 1. Invited people */}
            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 4px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                {invitedCount}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
                Invited people
              </div>
            </div>

            {/* 2. Invested people */}
            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 4px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                {investedCount}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
                Invested people
              </div>
            </div>

            {/* 3. My rebate(GH₵) */}
            <div style={{ padding: '0 4px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#38BDF8', lineHeight: 1.1 }}>
                GH₵ {myRebateUSDT}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
                My rebate(GH₵)
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            3. THE 10 EXACT MENU ROWS IN DARK NAVY CARD
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 14px 0' }}>
          <div
            style={{
              background: '#0E1726',
              borderRadius: 16,
              border: '1px solid #1B293E',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            {/* ROW 1: Language (Sticky English with opacity animation on tap) */}
            <div
              onClick={() => {
                setLangPressed(true);
                setTimeout(() => setLangPressed(false), 220);
              }}
              onMouseDown={() => setLangPressed(true)}
              onMouseUp={() => setLangPressed(false)}
              onTouchStart={() => setLangPressed(true)}
              onTouchEnd={() => setLangPressed(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                opacity: langPressed ? 0.45 : 1,
                transition: 'opacity 0.15s ease',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Language
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LanguageFlag language={currentLanguage} size={18} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {currentLanguage}
                </span>
              </div>
            </div>

            {/* ROW 2: Official domain */}
            <div
              onClick={handleCopyDomain}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Official domain
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                  {copiedDomain ? 'Copied!' : officialDomain}
                </span>
              </div>
            </div>

            {/* ROW 3: Account security */}
            <div
              onClick={() => history.push('/account-security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Account security
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 4: Funds details */}
            <div
              onClick={() => history.push('/funds-details')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M7 8h10M12 8v8M9 16h6" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Funds details
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 5: Payment address */}
            <div
              onClick={() => history.push('/payment-address')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Payment address
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 6: Announcement */}
            <div
              onClick={() => history.push('/announcements')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Announcement
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 7: Online consultation */}
            <div
              onClick={() => setActiveSubModal('support')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Online consultation
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 8: FAQ */}
            <div
              onClick={() => setActiveSubModal('faq')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="11" r="0.6" fill="#334155" />
                  <path d="M12 7a1.5 1.5 0 0 1 1.5 1.5c0 .8-.8 1.2-1.5 1.5" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  FAQ
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 9: About us */}
            <div
              onClick={() => setActiveSubModal('about')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  About us
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>

            {/* ROW 10: Download app */}
            <div
              onClick={() => setActiveSubModal('download')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <polyline points="8 12 12 16 16 12" />
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F5F9' }}>
                  Download app
                </span>
              </div>
              <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8', fontSize: 15 }} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            4. LOGOUT BUTTON
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '16px 14px 8px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: '1px solid rgba(239, 68, 68, 0.35)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#F87171',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* ── FOOTER WATERMARK ── */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#475569',
            fontWeight: 600,
            padding: '6px 0 12px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          VIPEARNER VIP
        </div>



        {/* ══════════════════════════════════════════════════════
            MODAL 3: PAYMENT ADDRESSES
        ══════════════════════════════════════════════════════ */}
        {activeSubModal === 'addresses' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setActiveSubModal(null)}
          >
            <div
              style={{
                background: '#0E1726',
                border: '1px solid #1B293E',
                width: '100%',
                borderRadius: '26px 26px 0 0',
                padding: '22px 18px 36px',
                maxHeight: '65vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#FFFFFF' }}>
                  Payment Address Vault
                </h3>
                <button
                  onClick={() => setActiveSubModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 14,
                  fontSize: 11.5,
                  color: '#92400E',
                  lineHeight: 1.45,
                }}
              >
                <strong>Sensitive Notice:</strong> Ensure all bound receiving Mobile Money phone numbers belong directly to you and match your registered SIM name. Automated cashouts cannot be reversed once dispatched.
              </div>

              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, margin: '0 0 18px' }}>
                Manage your verified Mobile Money (MTN MoMo, Telecel Cash, AT Money) receiving destinations for instant one-tap cashouts.
              </p>

              <button
                onClick={() => {
                  setActiveSubModal(null);
                  history.push('/payment-address');
                }}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>Open Payment Address Manager</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL 4: ONLINE CONSULTATION
        ══════════════════════════════════════════════════════ */}
        {activeSubModal === 'support' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setActiveSubModal(null)}
          >
            <div
              style={{
                background: '#0E1726',
                border: '1px solid #1B293E',
                width: '100%',
                borderRadius: '24px 24px 0 0',
                padding: '22px 18px 32px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>
                  Online Consultation
                </h3>
                <button
                  onClick={() => setActiveSubModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href="https://wa.me/233201634748"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>💬</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#166534' }}>WhatsApp Live Support</div>
                      <div style={{ fontSize: 11, color: '#15803D' }}>24/7 Official Customer Service</div>
                    </div>
                  </div>
                  <IonIcon icon={chevronForwardOutline} style={{ color: '#16A34A' }} />
                </a>

                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>✈️</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1E40AF' }}>Telegram Official</div>
                      <div style={{ fontSize: 11, color: '#2563EB' }}>Community &amp; VIP Group</div>
                    </div>
                  </div>
                  <IonIcon icon={chevronForwardOutline} style={{ color: '#2563EB' }} />
                </a>

                <div
                  onClick={() => alert('Online ticket service connecting...')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🎧</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>Online Service</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Direct Web Ticket Channel</div>
                    </div>
                  </div>
                  <IonIcon icon={chevronForwardOutline} style={{ color: '#94A3B8' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL 5: FAQ
        ══════════════════════════════════════════════════════ */}
        {activeSubModal === 'faq' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setActiveSubModal(null)}
          >
            <div
              style={{
                background: '#0E1726',
                border: '1px solid #1B293E',
                width: '100%',
                borderRadius: '24px 24px 0 0',
                padding: '22px 18px 32px',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>
                    Frequently Asked Questions
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    Official VipEarner Platform Rules &amp; Guidance
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              {/* Sensitive Warning Box */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 14,
                  fontSize: 11.5,
                  color: '#92400E',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span>
                  <strong>Sensitive:</strong> Never share your Mobile Money PIN or SMS OTP. Official domain: <strong>www.vipearner.com</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 12,
                        background: isOpen ? (faq.sensitive ? '#FFFBEB' : '#EFF6FF') : '#F8FAFC',
                        border: isOpen
                          ? faq.sensitive
                            ? '1.5px solid #F59E0B'
                            : '1.5px solid #2563EB'
                          : '1px solid #E2E8F0',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: 13,
                          color: isOpen ? (faq.sensitive ? '#B45309' : '#1E40AF') : '#1E293B',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {faq.sensitive && (
                            <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 9.5, fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>
                              CRUCIAL
                            </span>
                          )}
                          <span>{faq.q}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748B', flexShrink: 0 }}>
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                      {isOpen && (
                        <div
                          style={{
                            padding: '0 14px 14px',
                            fontSize: 12,
                            color: '#334155',
                            lineHeight: 1.5,
                            borderTop: faq.sensitive ? '1px solid #FDE68A' : '1px solid #DBEAFE',
                            paddingTop: 10,
                          }}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Full Help Center Button */}
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => {
                    setActiveSubModal(null);
                    history.push('/faq');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <span>Open Full Help Center &amp; Categories</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL 6: ABOUT US
        ══════════════════════════════════════════════════════ */}
        {activeSubModal === 'about' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setActiveSubModal(null)}
          >
            <div
              style={{
                background: '#0E1726',
                border: '1px solid #1B293E',
                width: '100%',
                borderRadius: '26px 26px 0 0',
                padding: '20px 18px 36px',
                maxHeight: '88vh',
                overflowY: 'auto',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <VipEarnerLogo size={24} showText={false} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#FFFFFF' }}>
                      About VipEarner Platform
                    </h3>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                      Institutional Digital Asset Yield Protocol
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              {/* 1. HERO INSTITUTIONAL TRUST CARD */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 65%, #2563EB 100%)',
                  borderRadius: 16,
                  padding: '16px 16px',
                  color: '#FFFFFF',
                  marginBottom: 16,
                  boxShadow: '0 6px 18px rgba(30, 58, 138, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10B981',
                      color: '#A7F3D0',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 20,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
                    Regulated &amp; Verified Protocol
                  </span>
                  <span style={{ fontSize: 11, color: '#93C5FD', fontWeight: 600 }}>
                    Est. 2024 • Global Operations
                  </span>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.55, color: '#F1F5F9', fontWeight: 500 }}>
                  <strong>VipEarner</strong> is a premier decentralized digital liquidity and staking protocol engineered to bridge institutional blockchain liquidity pools directly to daily local earnings with seamless automated settlement in Ghana.
                </div>

                {/* Key Metrics Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 8,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#60A5FA' }}>$24.5M+</div>
                    <div style={{ fontSize: 9.5, color: '#CBD5E1', marginTop: 1 }}>Total Liquidity</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#34D399' }}>99.98%</div>
                    <div style={{ fontSize: 9.5, color: '#CBD5E1', marginTop: 1 }}>Uptime SLA</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#FCD34D' }}>100%</div>
                    <div style={{ fontSize: 9.5, color: '#CBD5E1', marginTop: 1 }}>Collateral Backed</div>
                  </div>
                </div>
              </div>

              {/* 2. SENSITIVE TRUST & INVESTOR PROTECTION PILLARS */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Our Security &amp; Capital Protection Architecture
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[
                    {
                      iconNode: (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </div>
                      ),
                      title: '1:1 Fully Collateralized Asset Reserves',
                      desc: 'Every active contract and user balance is backed 100% by audited on-chain digital asset reserves, ensuring capital solvency and prompt withdrawal liquidity.',
                    },
                    {
                      iconNode: (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                      ),
                      title: 'Multi-Signature Cold Vault Custody',
                      desc: '95%+ of platform capital is secured in geographically distributed multi-signature offline vaults, eliminating single-point-of-failure vulnerabilities.',
                    },
                    {
                      iconNode: (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                            <path d="M22 12A10 10 0 0 0 12 2" stroke="#B45309" strokeDasharray="2 2" />
                          </svg>
                        </div>
                      ),
                      title: 'Automated Real-Time Daily Settlement',
                      desc: 'Daily earnings and contract dividends are computed algorithmically and settled automatically without manual delay or withdrawal holds.',
                    },
                    {
                      iconNode: (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="m9 15 2 2 4-4" />
                          </svg>
                        </div>
                      ),
                      title: 'Cryptographic Auditing & Verification',
                      desc: 'All yield allocation algorithms undergo continuous security analysis and anti-fraud monitoring to safeguard user principal.',
                    },
                  ].map((pillar) => (
                    <div
                      key={pillar.title}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: 12,
                        padding: '11px 13px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      {pillar.iconNode}
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#FFFFFF' }}>
                          {pillar.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3, lineHeight: 1.45 }}>
                          {pillar.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. OFFICIAL STRATEGIC CRYPTO & FINANCIAL PARTNERS */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Strategic Crypto &amp; Settlement Partners
                  </h4>
                  <span style={{ fontSize: 10, color: '#2563EB', fontWeight: 700, background: '#EFF6FF', padding: '2px 6px', borderRadius: 6 }}>
                    Official Partners
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  {[
                    {
                      name: 'MTN Mobile Money',
                      role: 'Direct Cedi Settlement',
                      tag: 'Official MoMo Rail',
                      imgSrc: '/images/partners/mtn-momo.png',
                      badgeBg: '#FEF9C3',
                      badgeColor: '#854D0E',
                      isCircle: false,
                    },
                    {
                      name: 'Telecel Cash',
                      role: 'Instant Ghana MoMo Gateway',
                      tag: 'Exclusive Partner',
                      imgSrc: '/images/partners/telecel.png',
                      badgeBg: '#FEE2E2',
                      badgeColor: '#991B1B',
                      isCircle: false,
                    },
                    {
                      name: 'Binance',
                      role: 'Liquidity & Market Depth',
                      tag: 'Global Exchange',
                      imgSrc: '/images/partners/binance.png',
                      badgeBg: '#FEF3C7',
                      badgeColor: '#B45309',
                      isCircle: true,
                    },
                    {
                      name: 'TRON DAO',
                      role: 'TRC-20 Staking Protocol',
                      tag: 'Yield Engine',
                      imgSrc: '/images/partners/tron.png',
                      badgeBg: '#FEE2E2',
                      badgeColor: '#B91C1C',
                      isCircle: true,
                    },
                    {
                      name: 'Tether (USDT)',
                      role: 'Collateral Reserve Standard',
                      tag: 'USD Stablecoin',
                      imgSrc: '/images/partners/tether.png',
                      badgeBg: '#D1FAE5',
                      badgeColor: '#047857',
                      isCircle: true,
                    },
                    {
                      name: 'Ethereum',
                      role: 'Decentralized Staking Base',
                      tag: 'Layer 1 Protocol',
                      imgSrc: '/images/partners/ethereum.png',
                      badgeBg: '#E0E7FF',
                      badgeColor: '#4338CA',
                      isCircle: true,
                    },
                    {
                      name: 'CertiK Security',
                      role: 'Smart Contract Verification',
                      tag: 'Security Audited',
                      imgSrc: '/images/partners/certik.png',
                      badgeBg: '#F3E8FF',
                      badgeColor: '#6B21A8',
                      isCircle: true,
                    },
                    {
                      name: 'CoinGecko',
                      role: 'Real-Time Price Oracles',
                      tag: 'Market Data Feed',
                      imgSrc: '/images/partners/coingecko.png',
                      badgeBg: '#ECFDF5',
                      badgeColor: '#065F46',
                      isCircle: false,
                    },
                  ].map((partner) => (
                    <div
                      key={partner.name}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        padding: '11px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: partner.isCircle ? '50%' : 8,
                            background: '#F8FAFC',
                            border: '1px solid #F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={partner.imgSrc}
                            alt={partner.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {partner.name}
                          </div>
                          <div style={{ fontSize: 9.5, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {partner.role}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: partner.badgeBg,
                          color: partner.badgeColor,
                          alignSelf: 'flex-start',
                        }}
                      >
                        {partner.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. COMPLIANCE & LEGAL CERTIFICATION FOOTER */}
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid #CBD5E1',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#059669', fontSize: 16 }} />
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FFFFFF' }}>
                    Compliance &amp; Operational Guarantee
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                  VipEarner operates under strict financial security protocols and international Money Services Business (MSB) frameworks. All smart contracts and automated routing algorithms are audited to maintain continuous user solvency.
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid #E2E8F0',
                    fontSize: 10,
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                >
                  <span>Registration ID: VE-GH-2026-807516</span>
                  <span>•</span>
                  <span>Official Domain: www.vipearner.com</span>
                  <span>•</span>
                  <span>Support: support@vipearner.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL 7: DOWNLOAD APP
        ══════════════════════════════════════════════════════ */}
        {activeSubModal === 'download' && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setActiveSubModal(null)}
          >
            <div
              style={{
                background: '#0E1726',
                border: '1px solid #1B293E',
                width: '100%',
                borderRadius: '24px 24px 0 0',
                padding: '22px 18px 32px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>
                  Download VipEarner App
                </h3>
                <button
                  onClick={() => setActiveSubModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  onClick={() => alert('Starting direct Android APK download...')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🤖</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#166534' }}>Android Direct APK</div>
                      <div style={{ fontSize: 11, color: '#15803D' }}>Fast install for all Android devices</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: 8 }}>
                    Install
                  </span>
                </div>

                <div
                  onClick={() => alert('Tap Safari Share button -> "Add to Home Screen" to install on iOS')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🍎</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1E40AF' }}>iOS Web App (PWA)</div>
                      <div style={{ fontSize: 11, color: '#2563EB' }}>Tap Share → Add to Home Screen</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#2563EB', background: '#DBEAFE', padding: '4px 10px', borderRadius: 8 }}>
                    Guide
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Space for bottom navigation */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))' }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
