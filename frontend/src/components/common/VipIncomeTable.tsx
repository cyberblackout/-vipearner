import React from 'react';

export interface VipIncomeData {
  vipLevel: string; // e.g. "VIP1" or "TRX Periodically R0892"
  investmentAmount: number; // e.g. 120 or 250
  dailyIncome: number; // e.g. 6.50 or 13.50
  durationDays: number; // e.g. 180 or 360
  customDuration?: number;
}

export interface VipIncomeTableProps {
  data?: VipIncomeData;
  vipLevel?: string;
  investmentAmount?: number;
  dailyIncome?: number;
  durationDays?: number;
  showSelector?: boolean; // allows switching VIP 1 - 12
  onSelectVip?: (level: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ALL_VIP_TIERS: VipIncomeData[] = [
  { vipLevel: 'VIP1', investmentAmount: 120, dailyIncome: 6.50, durationDays: 180 },
  { vipLevel: 'VIP2', investmentAmount: 250, dailyIncome: 13.50, durationDays: 180 },
  { vipLevel: 'VIP3', investmentAmount: 500, dailyIncome: 27.00, durationDays: 180 },
  { vipLevel: 'VIP4', investmentAmount: 1000, dailyIncome: 55.00, durationDays: 180 },
  { vipLevel: 'VIP5', investmentAmount: 2000, dailyIncome: 110.00, durationDays: 360 },
  { vipLevel: 'VIP6', investmentAmount: 3500, dailyIncome: 195.00, durationDays: 360 },
  { vipLevel: 'VIP7', investmentAmount: 5000, dailyIncome: 280.00, durationDays: 360 },
  { vipLevel: 'VIP8', investmentAmount: 8000, dailyIncome: 450.00, durationDays: 360 },
  { vipLevel: 'VIP9', investmentAmount: 12000, dailyIncome: 680.00, durationDays: 360 },
  { vipLevel: 'VIP10', investmentAmount: 20000, dailyIncome: 1150.00, durationDays: 360 },
  { vipLevel: 'VIP11', investmentAmount: 35000, dailyIncome: 2050.00, durationDays: 360 },
  { vipLevel: 'VIP12', investmentAmount: 50000, dailyIncome: 3000.00, durationDays: 360 },
];

export const VipIncomeTable: React.FC<VipIncomeTableProps> = ({
  data,
  vipLevel = 'VIP1',
  investmentAmount = 120,
  dailyIncome = 6.50,
  durationDays = 180,
  showSelector = false,
  onSelectVip,
  className = '',
  style = {},
}) => {
  const [activeTierIdx, setActiveTierIdx] = React.useState<number>(0);

  // If external data or props provided, use them; otherwise use active tier
  const currentTier = data || {
    vipLevel: showSelector ? ALL_VIP_TIERS[activeTierIdx].vipLevel : vipLevel,
    investmentAmount: showSelector ? ALL_VIP_TIERS[activeTierIdx].investmentAmount : investmentAmount,
    dailyIncome: showSelector ? ALL_VIP_TIERS[activeTierIdx].dailyIncome : dailyIncome,
    durationDays: showSelector ? ALL_VIP_TIERS[activeTierIdx].durationDays : durationDays,
  };

  const rawLevelName = currentTier.vipLevel.trim();
  const invest = Number(currentTier.investmentAmount) || 120;
  const daily = Number(currentTier.dailyIncome) || 6.50;
  const duration = currentTier.customDuration || Number(currentTier.durationDays) || 180;

  const weeklyIncome = daily * 7;
  const monthlyIncome = daily * 30;
  const totalIncome = daily * duration;
  const netProfit = Math.max(0, totalIncome - invest);

  const formatGHC = (num: number, includeDecimals = true) => {
    return `GH₵${num.toLocaleString('en-US', {
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: includeDecimals ? 2 : 0,
    })}`;
  };

  const investmentLabel = rawLevelName.toLowerCase().includes('investment')
    ? rawLevelName
    : `${rawLevelName} Investment`;

  return (
    <div
      className={className}
      style={{
        background: '#000000',
        color: '#FFFFFF',
        borderRadius: 16,
        padding: '20px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        border: '1px solid #1E293B',
        ...style,
      }}
    >
      {/* Optional VIP Level Selector Chips */}
      {showSelector && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 14,
            marginBottom: 12,
            borderBottom: '1px solid #1E293B',
            scrollbarWidth: 'none',
          }}
        >
          {ALL_VIP_TIERS.map((tier, idx) => {
            const isSelected = idx === activeTierIdx;
            return (
              <button
                key={tier.vipLevel}
                onClick={() => {
                  setActiveTierIdx(idx);
                  if (onSelectVip) onSelectVip(idx + 1);
                }}
                style={{
                  background: isSelected ? '#2563EB' : '#18181B',
                  color: isSelected ? '#FFFFFF' : '#A1A1AA',
                  border: isSelected ? '1px solid #3B82F6' : '1px solid #27272A',
                  borderRadius: 18,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {tier.vipLevel}
              </button>
            );
          })}
        </div>
      )}

      {/* Header Row: Details & Amount */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 12,
          borderBottom: '1px solid #1F2937',
          fontSize: 15,
          fontWeight: 700,
          color: '#E5E7EB',
          letterSpacing: '0.01em',
        }}
      >
        <span>Details</span>
        <span>Amount</span>
      </div>

      {/* Rows List matching exact reference image */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14, fontSize: 14 }}>
        {/* Row 1: Investment */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F3F4F6' }}>{investmentLabel}</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
            {formatGHC(invest, invest % 1 !== 0)}
          </span>
        </div>

        {/* Row 2: Daily Income */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F3F4F6' }}>Daily Income</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatGHC(daily)}</span>
        </div>

        {/* Row 3: Weekly Income (7 days) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F3F4F6' }}>Weekly Income (7 days)</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatGHC(weeklyIncome)}</span>
        </div>

        {/* Row 4: Monthly Income (30 days) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F3F4F6' }}>Monthly Income (30 days)</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatGHC(monthlyIncome)}</span>
        </div>

        {/* Row 5: Duration */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F3F4F6' }}>Duration</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{duration} days</span>
        </div>

        {/* Row 6: Total Income ({duration} days) - Bold */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 4,
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15 }}>
            Total Income ({duration} days)
          </span>
          <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15 }}>
            {formatGHC(totalIncome)}
          </span>
        </div>

        {/* Row 7: Less Initial Investment */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F3F4F6' }}>Less Initial Investment</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatGHC(invest)}</span>
        </div>

        {/* Row 8: Net Profit - Bold */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 4,
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15 }}>Net Profit</span>
          <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15 }}>
            {formatGHC(netProfit)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VipIncomeTable;
