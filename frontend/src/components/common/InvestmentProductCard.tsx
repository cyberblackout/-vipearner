import CryptoCoinIcon from './CryptoCoinIcon';

export interface InvestmentProductCardData {
  id: string;
  coin: 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'TRX' | 'BNB' | 'SOL' | 'XRP' | 'DOGE' | 'LTC' | 'ADA' | 'MATIC';
  title: string; // e.g. "TRX Periodically R0892"
  subtitle: string; // e.g. "Invest GH₵ 250.00, earn GH₵ 13.50 daily • 180 Days"
  accentColor: string; // e.g. "#EF4444"
  annualizedRate: string; // e.g. "+487.2%"
  minAmount: string; // e.g. "GH₵ 250.00"
  priceGHS?: string; // e.g. "GH₵ 250.00"
  dailyIncomeGHS?: string; // e.g. "GH₵ 13.50"
  totalIncomeGHS?: string; // e.g. "GH₵ 2,430.00"
  dailyRateNum?: number;
  priceNum?: number;
  duration?: string; // "180 Days" or "360 Days"
  durationDays?: number; // 180 or 360
  durations?: string[];
  selectedDuration?: string;
  category?: string;
  name?: string;
  fullName?: string;
  apy?: string;
  dailyRate?: string;
  availableTotal?: string;
}

export function InvestmentProductCard({
  product,
  onPledge,
}: {
  product: InvestmentProductCardData;
  onPledge: (prod: InvestmentProductCardData, duration: string) => void;
}) {
  const contractDuration = product.duration || `${product.durationDays || 180} Days`;
  const daysNum = product.durationDays || parseInt(contractDuration) || 180;
  const basePriceNum =
    product.priceNum ||
    parseFloat((product.priceGHS || product.minAmount || '0').replace(/[^0-9.]/g, '')) ||
    250;
  const dailyAmount =
    product.dailyRateNum ||
    (product.dailyIncomeGHS ? parseFloat(product.dailyIncomeGHS.replace(/[^0-9.]/g, '')) : 13.50);

  const formatGHS = (value: number) =>
    `GH₵ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const priceDisplay = product.priceGHS || formatGHS(basePriceNum);
  const dailyIncomeDisplay = product.dailyIncomeGHS || formatGHS(dailyAmount);
  const subtitleDisplay = `Invest ${priceDisplay}, earn ${dailyIncomeDisplay} daily • ${contractDuration}`;
  const totalIncomeDisplay = product.totalIncomeGHS || formatGHS(dailyAmount * daysNum);

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '16px 18px 14px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        position: 'relative',
      }}
    >
      {/* Top Header Row: Accent Vertical Bar + Title + Coin Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Left Accent Bar */}
            <div
              style={{
                width: 3.5,
                height: 16,
                borderRadius: 2,
                background: product.accentColor,
              }}
            />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: '#1E293B',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {product.title}
            </h3>
          </div>

          {/* Subtitle Investment Example */}
          <div
            style={{
              fontSize: 11,
              color: '#94A3B8',
              fontWeight: 500,
              marginTop: 4,
              paddingLeft: 11.5,
            }}
          >
            {subtitleDisplay}
          </div>
        </div>

        {/* Coin Round Icon */}
        <div>
          <CryptoCoinIcon coin={product.coin} size={34} />
        </div>
      </div>

      {/* Fixed Contract Term Badge (Strictly 180 Days or 360 Days) */}
      <div style={{ marginBottom: 14, paddingLeft: 2 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 8,
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#475569',
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          <span>Contract Term:</span>
          <strong style={{ color: product.accentColor || '#2563EB' }}>
            {contractDuration} (Fixed Period)
          </strong>
        </span>
      </div>

      {/* 3 Metric Columns: Price | Daily Income | Total Income (in Ghana Currency) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.1fr 1.2fr',
          gap: 6,
          marginBottom: 14,
          paddingLeft: 2,
        }}
      >
        {/* Col 1: Price */}
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#0F172A',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {priceDisplay}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
            Required Deposit
          </div>
        </div>

        {/* Col 2: Daily Income */}
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#10B981',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {dailyIncomeDisplay}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
            Daily Return
          </div>
        </div>

        {/* Col 3: Total Income */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: product.accentColor || '#2563EB',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {totalIncomeDisplay}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
            Total Payout ({contractDuration})
          </div>
        </div>
      </div>

      {/* Center "Activate Plan" Action Text / Button */}
      <div
        style={{
          textAlign: 'center',
          paddingTop: 8,
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <button
          onClick={() =>
            onPledge(
              {
                ...product,
                priceGHS: priceDisplay,
                minAmount: priceDisplay,
                priceNum: basePriceNum,
                subtitle: subtitleDisplay,
                duration: contractDuration,
                durationDays: daysNum,
                totalIncomeGHS: totalIncomeDisplay,
              },
              contractDuration
            )
          }
          style={{
            background: 'transparent',
            border: 'none',
            color: '#2563EB',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            padding: '4px 16px',
            outline: 'none',
            letterSpacing: '0.01em',
          }}
        >
          Activate Plan
        </button>
      </div>
    </div>
  );
}

export default InvestmentProductCard;
