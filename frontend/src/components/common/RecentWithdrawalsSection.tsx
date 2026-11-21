import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DEMO_PAYOUTS } from '../../data/demoPayouts';
import type { PayoutRecord } from '../../data/demoPayouts';

// 'demo' = generated sample payouts (matching reference), 'live' = real get_public_recent_payouts records
const DATA_MODE = 'demo' as 'demo' | 'live';

interface RecentWithdrawalsSectionProps {
  compact?: boolean;
  limit?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Fintech withdrawal / payout watermark icon
const WithdrawalWatermark: React.FC = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    style={{
      position: 'absolute',
      right: 4,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      opacity: 0.12,
    }}
  >
    <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="1.8" />
    <path
      d="M8 16L16 8M16 8H10M16 8V14"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RecentWithdrawalsSection: React.FC<RecentWithdrawalsSectionProps> = ({
  compact = false,
  limit = 140,
  className = '',
  style = {},
}) => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>(
    DATA_MODE === 'demo' ? DEMO_PAYOUTS.slice(0, limit) : []
  );
  const [tickTime, setTickTime] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  // Smooth slow auto-scroll loop (0.35px/frame with float accumulation)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pos = el.scrollLeft;
    let animId: number;
    const step = () => {
      if (!isPaused.current && el) {
        pos += 0.35; // gentle, readable slow speed
        el.scrollLeft = pos;
        // Infinite seamless loop: reset if reached halfway
        if (el.scrollLeft >= el.scrollWidth / 2) {
          pos = 0;
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [payouts]);

  // Fetch real database records if in live mode
  const fetchPayouts = async () => {
    if (DATA_MODE === 'demo') return;

    try {
      const { data, error } = await supabase.rpc('get_public_recent_payouts', {
        limit_count: limit,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        setPayouts(data as PayoutRecord[]);
      } else {
        setPayouts(DEMO_PAYOUTS.slice(0, limit));
      }
    } catch (err) {
      console.warn('Failed to fetch recent payouts:', err);
      setPayouts(DEMO_PAYOUTS.slice(0, limit));
    }
  };

  useEffect(() => {
    fetchPayouts();

    // Advance spinning minutes every 5 seconds
    const timer = setInterval(() => {
      setTickTime(Date.now());
    }, 5000);

    return () => clearInterval(timer);
  }, [limit]);

  // Format relative minutes like in the user screenshot: "2 min ago", "1 min ago", "Just now"
  const formatTimeAgo = (isoString: string) => {
    try {
      const past = new Date(isoString).getTime();
      const diffSecs = Math.max(1, Math.floor((tickTime - past) / 1000));
      if (diffSecs < 60) return `Just now`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins === 1) return `1 min ago`;
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return `1 hr ago`;
      if (diffHours < 24) return `${diffHours} hr ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '2 min ago';
    }
  };

  // Mask phone number matching user screenshot: "*********2"
  const formatMaskedPhone = (phone: string) => {
    if (!phone) return '*********2';
    const cleaned = phone.replace(/[^0-9]/g, '');
    const lastDigit = cleaned.length > 0 ? cleaned.slice(-1) : '2';
    return `*********${lastDigit}`;
  };

  // Double the list for seamless continuous infinite horizontal scroll
  const displayPayouts = [...payouts, ...payouts];

  return (
    <div
      className={className}
      style={{
        background: '#121620',
        borderRadius: 16,
        padding: compact ? '14px 12px 14px' : '16px 14px 16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        border: '1px solid #1E2433',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        {/* Pulsing Green Live Dot */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 10,
            height: 10,
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#00E676',
              opacity: 0.75,
              animation: 'ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00E676',
            }}
          />
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: compact ? 13 : 15,
            fontWeight: 800,
            color: '#F1F5F9',
            letterSpacing: '-0.01em',
          }}
        >
          Recent Withdrawals
        </h3>
      </div>

      {/* ══════════════════════════════════════════════════════
          HORIZONTAL STREAM:
          - Top: *********2 withdrew
          - Middle: GHS4,152.98 (bright neon green italic)
          - Bottom: Kwame A. (person name)
          - Watermark: Withdrawal payout icon
          - Under card: 2 min ago
      ══════════════════════════════════════════════════════ */}
      <div
        ref={scrollRef}
        onMouseEnter={() => {
          isPaused.current = true;
        }}
        onMouseLeave={() => {
          isPaused.current = false;
        }}
        onTouchStart={() => {
          isPaused.current = true;
        }}
        onTouchEnd={() => {
          isPaused.current = false;
        }}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 4,
          cursor: 'grab',
        }}
      >
        {displayPayouts.map((item, idx) => {
          const maskedPhone = formatMaskedPhone(item.masked_phone);
          const timeAgo = formatTimeAgo(item.created_at);
          const amountFormatted = `GHS${Number(item.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;

          return (
            <div
              key={`${item.id}-${idx}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}
            >
              {/* Card Container */}
              <div
                style={{
                  width: 172,
                  height: 76,
                  background: '#1F2430',
                  borderRadius: 12,
                  padding: '9px 12px 7px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Withdrawal Watermark */}
                <WithdrawalWatermark />

                {/* Line 1: Phone + "withdrew" */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#F8FAFC',
                    letterSpacing: '0.01em',
                    position: 'relative',
                    zIndex: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {maskedPhone} withdrew
                </div>

                {/* Line 2: Amount in Vibrant Neon Green Italic Bold */}
                <div
                  style={{
                    fontSize: 15.5,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#00E676',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    zIndex: 2,
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {amountFormatted}
                </div>

                {/* Line 3: Person's Name */}
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: '#94A3B8',
                    position: 'relative',
                    zIndex: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.masked_name}
                </div>
              </div>

              {/* Outside Card: Timestamp ("2 min ago") */}
              <div
                style={{
                  fontSize: 11,
                  color: '#64748B',
                  marginTop: 6,
                  paddingLeft: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span>{timeAgo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentWithdrawalsSection;
