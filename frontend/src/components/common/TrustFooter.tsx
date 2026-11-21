import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  shieldCheckmarkOutline,
  lockClosedOutline,
  cashOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

interface TrustFooterProps {
  className?: string;
  style?: React.CSSProperties;
}

export const TrustFooter: React.FC<TrustFooterProps> = ({
  className = '',
  style = {},
}) => {
  return (
    <footer
      className={className}
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)',
        color: '#F8FAFC',
        borderRadius: 14,
        margin: '16px 12px 14px',
        padding: '14px 16px 12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 6px 18px -2px rgba(0, 0, 0, 0.35)',
        ...style,
      }}
    >
      {/* ── COMPACT HEADER: BITCOIN & SECURITY ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 10,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            ₿
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              Bitcoin &amp; Multi-Sig Security
            </div>
            <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
              100% Backed Proof of Reserves • Cold Custody
            </div>
          </div>
        </div>

        <span
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: 10,
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 6,
            textTransform: 'uppercase',
          }}
        >
          Audited
        </span>
      </div>

      {/* ── 4 COMPACT MICRO TRUST BADGES (2x2 Grid) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
          marginBottom: 10,
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
          <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#10B981', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap' }}>
            Multi-Sig Vaults
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
          <IonIcon icon={cashOutline} style={{ color: '#38BDF8', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap' }}>
            Direct MoMo Payout
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
          <IonIcon icon={lockClosedOutline} style={{ color: '#FBBF24', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap' }}>
            256-Bit SSL Secured
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
          <IonIcon icon={checkmarkCircleOutline} style={{ color: '#A855F7', fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap' }}>
            SAFU Protection
          </span>
        </div>
      </div>

      {/* ── PARTNER & ASSET PILLS ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          paddingBottom: 8,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: '#FBBF24' }}>₿ BTC</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#34D399' }}>₮ USDT</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#FDE68A' }}>MTN MoMo</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#FCA5A5' }}>Telecel</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#93C5FD' }}>AT Money</span>
      </div>

      {/* ── COPYRIGHT FOOTER ── */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: 8,
          textAlign: 'center',
          fontSize: 10.5,
          color: '#64748B',
        }}
      >
        © 2026 VIP Earner Technologies Ltd. All Rights Reserved.
      </div>
    </footer>
  );
};

export default TrustFooter;
