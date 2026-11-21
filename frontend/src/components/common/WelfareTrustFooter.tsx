import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  giftOutline,
  shieldCheckmarkOutline,
  walletOutline,
  trendingUpOutline,
  checkmarkCircle,
  calendarOutline,
  timeOutline,
} from 'ionicons/icons';

interface WelfareTrustFooterProps {
  className?: string;
  style?: React.CSSProperties;
}

export const WelfareTrustFooter: React.FC<WelfareTrustFooterProps> = ({
  className = '',
  style = {},
}) => {
  return (
    <footer
      className={className}
      style={{
        margin: '20px 14px 10px',
        padding: '16px 16px 14px',
        borderRadius: 16,
        background: 'linear-gradient(180deg, #1C1917 0%, #0C0A09 100%)',
        border: '1px solid rgba(245, 158, 11, 0.15)',
        color: '#F5F5F4',
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
        ...style,
      }}
    >
      {/* ── 1. HEADER: TRANSPARENCY & FAIR REWARD GUARANTEE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            <IonIcon icon={giftOutline} />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              Welfare Yield Guarantee
            </div>
            <div style={{ fontSize: 10.5, color: '#A8A29E' }}>
              100% Win Rate • Backed by Staking Reserve Pool
            </div>
          </div>
        </div>

        <span
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#FBBF24',
            fontSize: 10,
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 6,
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <IonIcon icon={calendarOutline} style={{ fontSize: 11 }} />
          Daily
        </span>
      </div>

      {/* ── 2. 3-STEP "HOW TO CASH OUT COUPONS" ── */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: '10px 12px',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: '#D6D3D1',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <IonIcon icon={trendingUpOutline} style={{ color: '#F59E0B' }} />
          <span>How Your Coupons Turn Into Real Cash</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center' }}>
          {/* Step 1 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '6px 4px' }}>
            <div style={{ fontSize: 13, marginBottom: 2 }}>🎁</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#F5F5F4' }}>1. Claim</div>
            <div style={{ fontSize: 9.5, color: '#A8A29E', lineHeight: 1.2 }}>Draw coupon daily</div>
          </div>

          {/* Step 2 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '6px 4px' }}>
            <div style={{ fontSize: 13, marginBottom: 2 }}>📈</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#F5F5F4' }}>2. Boost</div>
            <div style={{ fontSize: 9.5, color: '#A8A29E', lineHeight: 1.2 }}>Apply to VIP plans</div>
          </div>

          {/* Step 3 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '6px 4px' }}>
            <div style={{ fontSize: 13, marginBottom: 2 }}>💸</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#F5F5F4' }}>3. Payout</div>
            <div style={{ fontSize: 9.5, color: '#A8A29E', lineHeight: 1.2 }}>Cash out via MoMo</div>
          </div>
        </div>
      </div>

      {/* ── 3. TRUST PILLARS (2x2) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          <IonIcon icon={checkmarkCircle} style={{ color: '#10B981', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E7E5E4', whiteSpace: 'nowrap' }}>
            100% Win Guarantee
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#F59E0B', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E7E5E4', whiteSpace: 'nowrap' }}>
            Audited Drop Odds
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          <IonIcon icon={walletOutline} style={{ color: '#38BDF8', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E7E5E4', whiteSpace: 'nowrap' }}>
            Funded by Node Pool
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          <IonIcon icon={timeOutline} style={{ color: '#A855F7', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E7E5E4', whiteSpace: 'nowrap' }}>
            30-Day Expiry Window
          </span>
        </div>
      </div>

      {/* ── 4. REASSURANCE NOTE & COPYRIGHT ── */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: 8,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 10.5,
            color: '#78716C',
            lineHeight: 1.4,
          }}
        >
          All interest coupon bonuses are automatically credited on contract completion.
          Withdrawable directly via MTN MoMo, Telecel Cash &amp; AT Money.
        </p>
        <div style={{ fontSize: 10, color: '#57534E' }}>
          © 2026 VIP Earner • Rewarding Loyal Ghana Members Daily
        </div>
      </div>
    </footer>
  );
};

export default WelfareTrustFooter;
