import { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  arrowBackOutline,
  closeOutline,
  checkmarkCircle,
  trophyOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { formatGHS } from '../../lib/formatters';
import BottomNav from '../../components/BottomNav';
import { WelfareTrustFooter } from '../../components/common/WelfareTrustFooter';

/* ── AUDIO SYNTHESIZER FOR CRISP SPINNING TICKS & WIN CHIME ── */
const playAudioTick = (pitch = 750) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.038);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.038);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {}
};

const playFanfare = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.29);
    });
  } catch {}
};

/* ── 3X3 BOARD ITEM DEFINITIONS (EXACT 66EX.VIP SCREEN 070-072) ── */
interface BoardSlot {
  id: number;
  rate: string;
  title: string;
  subtitle: string;
  type: 'coupon' | 'center';
}

const BOARD_ITEMS: BoardSlot[] = [
  { id: 0, rate: '10%', title: '10%', subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 1, rate: '20%', title: '20%', subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 2, rate: '30%', title: '30%', subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 3, rate: '5%',  title: '5%',  subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 4, rate: 'Open', title: 'Open', subtitle: 'Center', type: 'center' },
  { id: 5, rate: '5%',  title: '5%',  subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 6, rate: '30%', title: '30%', subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 7, rate: '20%', title: '20%', subtitle: 'Interest Coupon', type: 'coupon' },
  { id: 8, rate: '10%', title: '10%', subtitle: 'Interest Coupon', type: 'coupon' },
];

/* Perimeter clockwise rotation:
   [0, 1, 2]
   [3, 4, 5]
   [6, 7, 8]
   Clockwise sequence around perimeter: 0 -> 1 -> 2 -> 5 -> 8 -> 7 -> 6 -> 3
*/
const PERIMETER_INDICES = [0, 1, 2, 5, 8, 7, 6, 3];

export default function CheckinPage() {
  const history = useHistory();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();

  const [currentView, setCurrentView] = useState<'main' | 'details'>('main');
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isWinningFlash, setIsWinningFlash] = useState(false);

  // Modals
  const [prizeModal, setPrizeModal] = useState<{
    couponRate: string;
    cashReward: number;
    title: string;
  } | null>(null);
  const [cooldownModal, setCooldownModal] = useState<{ message: string; remainingText: string } | null>(null);

  // Interest Coupon Tracking (persisted)
  const [totalCoupons, setTotalCoupons] = useState<number>(() => {
    const saved = localStorage.getItem(`vipearner_total_coupons_${profile?.id || 'guest'}`);
    return saved ? parseInt(saved, 10) : 2;
  });
  const [usedCoupons] = useState<number>(() => {
    const saved = localStorage.getItem(`vipearner_used_coupons_${profile?.id || 'guest'}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const availableCoupons = Math.max(0, totalCoupons - usedCoupons);

  useEffect(() => {
    if (profile?.id) {
      localStorage.setItem(`vipearner_total_coupons_${profile.id}`, String(totalCoupons));
      localStorage.setItem(`vipearner_used_coupons_${profile.id}`, String(usedCoupons));
    }
  }, [totalCoupons, usedCoupons, profile?.id]);

  // Check-in status query
  const { data: checkinData } = useQuery({
    queryKey: ['checkin-status'],
    queryFn: () => callEdgeFunction<{ has_checked_in: boolean; streak: number; today_reward?: number }>('get-checkin-status'),
  });

  // Lucky bag status query
  const { data: luckyBagStatus } = useQuery({
    queryKey: ['lucky-bag-status'],
    queryFn: () => callEdgeFunction<{ can_claim: boolean; reward_min: number; reward_max: number; next_claim_time: string | null }>('get-lucky-bag-status'),
  });

  const isCheckedIn = checkinData?.has_checked_in ?? false;
  const currentStreak = checkinData?.streak ?? profile?.checkin_streak ?? 0;
  const canClaimLuckyBag = luckyBagStatus?.can_claim ?? true;

  // Countdown to next reset
  const [countdownText, setCountdownText] = useState('00:00:00');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Next UTC midnight
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diffMs = tomorrow.getTime() - now.getTime();
      if (diffMs <= 0) {
        setCountdownText('Available Now');
        return;
      }
      const hrs = Math.floor(diffMs / (1000 * 60 * 60)).toString().padStart(2, '0');
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setCountdownText(`${hrs}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mutations
  const checkinMutation = useMutation({
    mutationFn: () => callEdgeFunction<{ reward: number; streak: number; new_balance: number }>('daily-checkin', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const luckyBagMutation = useMutation({
    mutationFn: () => callEdgeFunction<{ reward: number; new_balance: number }>('claim-lucky-bag', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lucky-bag-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const spinTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  /* ── CIRCULAR PERIMETER SPINNING RUNNER ── */
  const runSpinAnimation = (winningSlotIndex: number, rewardGHS: number, source: 'lucky_box' | 'signin') => {
    setIsSpinning(true);
    setIsWinningFlash(false);

    const targetPerimeterPos = PERIMETER_INDICES.indexOf(winningSlotIndex);
    const validTargetPos = targetPerimeterPos >= 0 ? targetPerimeterPos : 1; // default to slot 1 (20%)

    // Total steps = 3 complete rotations (24 steps) + target offset
    const totalSteps = 3 * PERIMETER_INDICES.length + validTargetPos;
    let currentStep = 0;

    const executeStep = () => {
      const perimeterIndex = currentStep % PERIMETER_INDICES.length;
      const slotId = PERIMETER_INDICES[perimeterIndex];
      setActiveHighlightIndex(slotId);
      playAudioTick(650 + perimeterIndex * 35);

      if (currentStep >= totalSteps) {
        // Landed!
        playFanfare();
        setIsWinningFlash(true);

        setTimeout(() => {
          setIsSpinning(false);
          setIsWinningFlash(false);

          // Update coupon inventory
          setTotalCoupons((prev) => prev + 1);

          const wonSlot = BOARD_ITEMS[slotId];
          setPrizeModal({
            couponRate: wonSlot.rate,
            cashReward: rewardGHS,
            title: source === 'signin' ? 'Daily Sign-in Reward' : 'Daily Welfare Benefit',
          });
        }, 800);
        return;
      }

      currentStep++;

      // Easing speed calculation (acceleration -> top speed -> deceleration)
      let delay = 50;
      const remaining = totalSteps - currentStep;
      if (currentStep < 5) {
        delay = 140 - currentStep * 18;
      } else if (remaining <= 8) {
        const decelCurve = [75, 100, 140, 200, 280, 380, 500, 680];
        delay = decelCurve[8 - remaining] || 450;
      }

      spinTimeoutRef.current = setTimeout(executeStep, delay);
    };

    executeStep();
  };

  /* ── TRIGGER DRAW ── */
  const handleOpenDraw = async (source: 'lucky_box' | 'signin') => {
    if (isSpinning) return;

    if (source === 'lucky_box' && !canClaimLuckyBag) {
      setCooldownModal({
        message: "You have already claimed today's daily sign-in reward. Please return after the countdown.",
        remainingText: countdownText,
      });
      return;
    }

    if (source === 'signin' && isCheckedIn) {
      setCurrentView('details');
      return;
    }

    // Winning candidates on board (20%, 30%, 10%)
    const WINNING_CANDIDATES = [1, 2, 6, 7, 0, 8];
    const pickedSlot = WINNING_CANDIDATES[Math.floor(Math.random() * WINNING_CANDIDATES.length)];

    let earnedCash = 0.5;

    try {
      if (source === 'signin') {
        const res = await checkinMutation.mutateAsync();
        earnedCash = res.reward || 0.5;
      } else {
        const res = await luckyBagMutation.mutateAsync();
        earnedCash = res.reward || 0.75;
      }
    } catch {
      earnedCash = Math.round((0.35 + Math.random() * 0.8) * 100) / 100;
    }

    runSpinAnimation(pickedSlot, earnedCash, source);
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#FFFFFF' }}>
        {/* ════════════════════════════════════════════════════════════
            VIEW 1: WELFARE CENTER MAIN (Exact 66ex.vip Screens 070-072)
        ════════════════════════════════════════════════════════════ */}
        {currentView === 'main' && (
          <div style={{ paddingBottom: 85, background: '#FFFFFF', minHeight: '100%' }}>
            {/* Top Dark Chocolate / Espresso Header Section */}
            <div
              style={{
                background: 'linear-gradient(180deg, #1C1715 0%, #130F0E 100%)',
                padding: '24px 18px 28px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Floating Gold Coin Glow Artwork (Reference Screen 070) */}
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 18,
                  pointerEvents: 'none',
                  opacity: 0.9,
                }}
              >
                <svg width="115" height="90" viewBox="0 0 115 90" fill="none">
                  <circle cx="65" cy="45" r="38" fill="#F59E0B" opacity="0.22" filter="blur(14px)" />
                  <circle cx="40" cy="18" r="9" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.8" />
                  <circle cx="75" cy="22" r="10" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1.8" />
                  <circle cx="95" cy="45" r="8" fill="#D97706" stroke="#FDE68A" strokeWidth="1.8" />
                  {/* Glowing Box Chest */}
                  <path
                    d="M20 48 C20 34, 95 34, 95 48 L91 76 C91 78, 24 78, 24 76 Z"
                    fill="url(#welfareGoldGrad)"
                    stroke="#FDE68A"
                    strokeWidth="1.8"
                  />
                  <ellipse cx="57" cy="48" rx="37" ry="9" fill="#78350F" stroke="#FDE68A" strokeWidth="1.8" />
                  <defs>
                    <linearGradient id="welfareGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="40%" stopColor="#F59E0B" />
                      <stop offset="80%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Title & Subtitle */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 25,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Welfare Center
                </h1>
                <p
                  style={{
                    margin: '4px 0 16px',
                    fontSize: 13,
                    color: '#E5D5C5',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Here, get your exclusive benefits
                </p>

                {/* 'Sign In' Button (Pill matching Exact Reference Screenshot 070) */}
                <button
                  onClick={() => handleOpenDraw('signin')}
                  disabled={isSpinning}
                  style={{
                    background: isCheckedIn ? '#F5EBE1' : '#FCE4D0',
                    border: 'none',
                    borderRadius: 24,
                    padding: '7px 22px',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#26160F',
                    cursor: isSpinning ? 'default' : 'pointer',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCheckedIn ? (
                    <>
                      <IonIcon icon={checkmarkCircle} style={{ color: '#059669', fontSize: 16 }} />
                      <span>Checked In (Details)</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>

              {/* Coupon Summary Card (Exact Warm Peach Box from Reference Screenshot 070) */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #FDF2E7 0%, #FBE5D2 100%)',
                  borderRadius: 18,
                  marginTop: 20,
                  padding: '16px 18px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  position: 'relative',
                  zIndex: 2,
                  border: '1px solid #F5D3B8',
                }}
              >
                {/* Top Row: Total Interest Coupon */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(43, 24, 16, 0.09)',
                    paddingBottom: 12,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2B1810' }}>
                    Total Interest Coupon
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#2B1810' }}>
                    <span style={{ fontSize: 19, color: '#1A1412' }}>{totalCoupons}</span>{' '}
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6E4E37' }}>Sheet</span>
                  </div>
                </div>

                {/* Bottom Row: Available vs Used Coupons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2B1810' }}>
                      Available Interest Coupon
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#2B1810', marginTop: 4 }}>
                      <span style={{ fontSize: 18, color: '#059669' }}>{availableCoupons}</span>{' '}
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6E4E37' }}>Sheet</span>
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid rgba(43, 24, 16, 0.09)', paddingLeft: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2B1810' }}>
                      Used Interest Coupon
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#2B1810', marginTop: 4 }}>
                      <span style={{ fontSize: 18, color: '#78716C' }}>{usedCoupons}</span>{' '}
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6E4E37' }}>Sheet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lucky Box Section (Curved White Container matching Reference Screenshot 070) */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '26px 26px 0 0',
                marginTop: -14,
                position: 'relative',
                zIndex: 3,
                padding: '22px 16px 14px',
                boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  marginBottom: 16,
                  padding: '0 4px',
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#1E293B',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Lucky Box
                </h2>
              </div>

              {/* 3x3 Grid (The Lucky Draw Board) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  maxWidth: 420,
                  margin: '0 auto',
                  userSelect: 'none',
                }}
              >
                {BOARD_ITEMS.map((item) => {
                  const isHighlighted = activeHighlightIndex === item.id;

                  // ── Center Card: Red/Coral 'Open' Box with X2 Badge ──
                  if (item.type === 'center') {
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenDraw('lucky_box')}
                        style={{
                          background: 'linear-gradient(145deg, #FF5B4D 0%, #EE382B 100%)',
                          borderRadius: 16,
                          padding: '12px 6px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          cursor: isSpinning ? 'default' : 'pointer',
                          minHeight: 114,
                          boxShadow: '0 8px 20px rgba(238, 56, 43, 0.42)',
                          transform: isSpinning ? 'scale(0.97)' : 'scale(1.02)',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        {/* X2 Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 8,
                            fontSize: 10,
                            fontWeight: 900,
                            color: '#FFFFFF',
                            background: 'rgba(0,0,0,0.22)',
                            borderRadius: 10,
                            padding: '1px 7px',
                            letterSpacing: '0.02em',
                          }}
                        >
                          X2
                        </div>

                        {/* Gift Box SVG Art */}
                        <div style={{ marginBottom: 4 }}>
                          <svg width="46" height="46" viewBox="0 0 100 100" fill="none">
                            <rect x="20" y="38" width="60" height="50" rx="8" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="3" />
                            <rect x="15" y="28" width="70" height="15" rx="4" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="2.5" />
                            <rect x="44" y="28" width="12" height="60" fill="#FFFFFF" />
                            <rect x="20" y="58" width="60" height="10" fill="#FFFFFF" />
                            <circle cx="38" cy="20" r="10" stroke="#FFFFFF" strokeWidth="5" fill="none" />
                            <circle cx="62" cy="20" r="10" stroke="#FFFFFF" strokeWidth="5" fill="none" />
                          </svg>
                        </div>

                        {/* 'Open' Pill Button */}
                        <div
                          style={{
                            background: '#FFFFFF',
                            borderRadius: 14,
                            padding: '4px 16px',
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#DC2626',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {isSpinning ? 'Spinning...' : 'Open'}
                        </div>
                      </div>
                    );
                  }

                  // ── Surrounding 8 Coupon Cards (Screens 070-072) ──
                  return (
                    <div
                      key={item.id}
                      onClick={() => !isSpinning && handleOpenDraw('lucky_box')}
                      style={{
                        background: isHighlighted ? '#FEF3C7' : '#FFF6EE',
                        borderRadius: 16,
                        padding: '10px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isSpinning ? 'default' : 'pointer',
                        minHeight: 114,
                        border: isHighlighted
                          ? '3px solid #F59E0B'
                          : isWinningFlash
                          ? '3px solid #10B981'
                          : '1.5px solid #FCE5D4',
                        boxShadow: isHighlighted
                          ? '0 0 22px rgba(245, 158, 11, 0.85), inset 0 0 10px rgba(254, 240, 138, 0.65)'
                          : '0 2px 6px rgba(0,0,0,0.02)',
                        transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
                        zIndex: isHighlighted ? 10 : 1,
                        transition: 'all 0.08s ease',
                        position: 'relative',
                      }}
                    >
                      {/* Ticket Badge Shape with % Icon & Semicircle Side Notches (Exact 66ex Screenshot) */}
                      <div
                        style={{
                          position: 'relative',
                          width: 42,
                          height: 26,
                          background: 'linear-gradient(135deg, #FF6060 0%, #EE3838 100%)',
                          borderRadius: 5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 6,
                          boxShadow: '0 2px 6px rgba(238, 56, 56, 0.28)',
                        }}
                      >
                        {/* Left notch */}
                        <div
                          style={{
                            position: 'absolute',
                            left: -4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isHighlighted ? '#FEF3C7' : '#FFF6EE',
                            transition: 'background 0.08s ease',
                          }}
                        />
                        {/* Right notch */}
                        <div
                          style={{
                            position: 'absolute',
                            right: -4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isHighlighted ? '#FEF3C7' : '#FFF6EE',
                            transition: 'background 0.08s ease',
                          }}
                        />
                        <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 900 }}>%</span>
                      </div>

                      {/* Percentage Rate */}
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 900,
                          color: '#DC2626',
                          lineHeight: 1.1,
                        }}
                      >
                        {item.rate}
                      </div>

                      {/* Subtitle */}
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#8C7E74',
                          marginTop: 3,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Hint / Status Indicator */}
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  {isSpinning
                    ? '⚡ Selecting your exclusive welfare reward...'
                    : 'Tap "Open" or "Sign In" above to spin the Lucky Box'}
                </span>
              </div>
            </div>

            <WelfareTrustFooter />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            VIEW 2: SIGN IN ATTENDANCE DETAILS VIEW
        ════════════════════════════════════════════════════════════ */}
        {currentView === 'details' && (
          <div style={{ paddingBottom: 85, background: '#F8FAFC', minHeight: '100%' }}>
            {/* Top Bar with Back Arrow */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                onClick={() => setCurrentView('main')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IonIcon icon={arrowBackOutline} style={{ fontSize: 22, color: '#0F172A' }} />
              </button>

              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                Sign In Attendance
              </h1>

              <div style={{ width: 22 }} />
            </div>

            {/* Streak Ladder Details */}
            <div style={{ padding: '16px' }}>
              <div
                style={{
                  background: 'linear-gradient(145deg, #1C1715 0%, #151110 100%)',
                  borderRadius: 18,
                  padding: '20px',
                  color: '#FFFFFF',
                  marginBottom: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FCE4D0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Consecutive Sign-in Streak
                    </span>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', margin: '4px 0 0' }}>
                      {currentStreak} Days
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('main');
                      handleOpenDraw('signin');
                    }}
                    disabled={isCheckedIn || isSpinning}
                    style={{
                      background: isCheckedIn ? 'rgba(255,255,255,0.12)' : '#FCE4D0',
                      border: 'none',
                      borderRadius: 20,
                      padding: '8px 18px',
                      fontSize: 13,
                      fontWeight: 900,
                      color: isCheckedIn ? '#94A3B8' : '#26160F',
                      cursor: isCheckedIn ? 'default' : 'pointer',
                    }}
                  >
                    {isCheckedIn ? 'Checked In ✓' : 'Sign In Now'}
                  </button>
                </div>

                {/* 7-Day Visual Progress Track */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {[
                    { day: 1, reward: 'GH₵0.10', coupon: '5%' },
                    { day: 2, reward: 'GH₵0.20', coupon: '10%' },
                    { day: 3, reward: 'GH₵0.30', coupon: '15%' },
                    { day: 4, reward: 'GH₵0.40', coupon: '20%' },
                    { day: 5, reward: 'GH₵0.50', coupon: '25%' },
                    { day: 6, reward: 'GH₵0.60', coupon: '30%' },
                    { day: 7, reward: 'GH₵1.00', coupon: 'VIP' },
                  ].map((item) => {
                    const isCompleted = item.day <= currentStreak;
                    return (
                      <div
                        key={item.day}
                        style={{
                          background: isCompleted ? '#FCE4D0' : 'rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          padding: '8px 2px',
                          textAlign: 'center',
                          color: isCompleted ? '#26160F' : 'rgba(255,255,255,0.7)',
                          border: isCompleted ? '1px solid #F5D3B8' : '1px solid transparent',
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 800 }}>D{item.day}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 2px' }}>
                          {isCompleted ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/></svg>
                          )}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2, opacity: 0.9 }}>
                          {item.coupon}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rules Description */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: '18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <IonIcon icon={trophyOutline} style={{ color: '#F59E0B', fontSize: 20 }} />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                    Welfare Rules &amp; Benefits
                  </h3>
                </div>

                <ol style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.7 }}>
                  <li>Sign in continuously every 24 hours to earn escalating cash rewards credited directly to your Mobile Money wallet.</li>
                  <li>Every daily sign-in awards an Open Box chance to receive up to **+30% Interest Coupons** and cash bonuses.</li>
                  <li>Interest coupons can be applied during Crypto Staking Plan activation to substantially increase your daily yield.</li>
                  <li>Reach Day 7 consecutive check-in to unlock the exclusive VIP Blind Box!</li>
                </ol>
              </div>

              <WelfareTrustFooter />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            WINNING PRIZE CELEBRATION MODAL
        ════════════════════════════════════════════════════════════ */}
        {prizeModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                padding: '28px 22px 24px',
                maxWidth: 340,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 40px -10px rgba(0, 0, 0, 0.4)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setPrizeModal(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: 20, color: '#64748B' }} />
              </button>

              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  border: '2px solid #F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H8" />
                  <path d="M14 14.66V17c0 .55.45 1 1 1h1" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Congratulations!
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '6px 0 16px' }}>
                {prizeModal.title}
              </p>

              {/* Prize Badge Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFF1F2 0%, #FEF2F2 100%)',
                  border: '2px dashed #EF4444',
                  borderRadius: 16,
                  padding: '16px 14px',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'inline-block', background: '#EF4444', color: '#FFFFFF', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                  + {prizeModal.couponRate} BOOST
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#DC2626' }}>
                  {prizeModal.couponRate} Interest Coupon
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginTop: 6 }}>
                  + {formatGHS(prizeModal.cashReward)} Instant Cash Bonus
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 18px', lineHeight: 1.4 }}>
                Your coupon has been added to your wallet! It automatically applies higher returns when activating staking plans.
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    setPrizeModal(null);
                    history.push('/vip');
                  }}
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  Use Coupon in Staking →
                </button>

                <button
                  onClick={() => setPrizeModal(null)}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 12,
                    background: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            COOLDOWN DIALOG
        ════════════════════════════════════════════════════════════ */}
        {cooldownModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 22,
                padding: '24px 20px',
                maxWidth: 320,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#2563EB',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Already Claimed Today
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '8px 0 16px', lineHeight: 1.5 }}>
                {cooldownModal.message}
              </p>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '12px',
                  marginBottom: 18,
                }}
              >
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Next Available In</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#2563EB', marginTop: 2 }}>
                  {cooldownModal.remainingText}
                </div>
              </div>

              <button
                onClick={() => setCooldownModal(null)}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
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
        <div style={{ height: 75 }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
