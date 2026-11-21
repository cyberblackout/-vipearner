import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  arrowBackOutline,
  checkmarkCircle,
  closeCircle,
  refreshOutline,
  walletOutline,
  chevronForwardOutline,
  alertCircleOutline,
  helpCircleOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  chevronDownOutline,
  chevronUpOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { callEdgeFunction, supabase } from '../../lib/supabase';
import { RecentWithdrawalsSection } from '../../components/common/RecentWithdrawalsSection';
import CryptoCoinIcon from '../../components/common/CryptoCoinIcon';
import { getSavedAddresses, syncSavedAddressesWithSupabase, SavedPaymentAddress } from '../../lib/paymentAddresses';

// ── BRAND LOGOS FOR GHANA MOBILE MONEY NETWORKS ──────────────────────────────
const MtnLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
    <rect width="36" height="36" rx="8" fill="#FFCC00" />
    <ellipse cx="18" cy="18" rx="14" ry="9" stroke="#000000" strokeWidth="2" fill="none" />
    <text
      x="18"
      y="22"
      textAnchor="middle"
      fill="#000000"
      fontSize="10"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.5px"
    >
      MTN
    </text>
  </svg>
);

const TelecelLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
    <rect width="36" height="36" rx="8" fill="#E20613" />
    <circle cx="18" cy="18" r="10" stroke="#FFFFFF" strokeWidth="2.4" fill="none" />
    <path
      d="M17.5 11.5V20C17.5 21.8 18.7 22.8 20.3 22.8C21.2 22.8 22 22.5 22.4 22.2"
      stroke="#FFFFFF"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M14.5 15.5H21.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const AtMoneyLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
    <rect width="36" height="36" rx="8" fill="#003B99" />
    <circle cx="26" cy="13.5" r="3" fill="#E50019" />
    <text
      x="16.5"
      y="23"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="12.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.4px"
    >
      at
    </text>
  </svg>
);

interface MyWithdrawalItem {
  id: string;
  amount: number;
  channel: string;
  details: any;
  status: string;
  admin_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
}

interface FaqItem {
  q: string;
  a: string;
  sensitive?: boolean;
}

const WITHDRAWAL_FAQ: FaqItem[] = [
  {
    q: 'Sensitive Security Notice: Protecting Your Mobile Money PIN',
    a: 'VIP Earner administrators, customer care representatives, and automated payout systems will NEVER ask for your Mobile Money PIN, account password, or SMS verification codes (OTP). Never disclose sensitive financial information to anyone.',
    sensitive: true,
  },
  {
    q: 'Sensitive Rule: Phone Number & SIM Registration Accuracy',
    a: 'Automated payouts are matched directly to your telecom number. Submitting cashouts to an unregistered or incorrect phone number will result in irreversible loss of funds. Always double-check your recipient number.',
    sensitive: true,
  },
  {
    q: 'How fast do withdrawals arrive in my Mobile Money wallet?',
    a: 'Automated cashouts are dispatched within 5 to 15 minutes directly to your MTN MoMo, Telecel Cash, or AT Money account. During peak telecom banking hours, delays up to 30–60 minutes may occasionally occur.',
    sensitive: false,
  },
  {
    q: 'What is the 5% service charge for?',
    a: 'The 5% service fee covers automated telecommunication gateway charges, payment switch infrastructure, and regulatory electronic transaction fees across MTN, Telecel, and AT Money.',
    sensitive: false,
  },
  {
    q: 'What are the withdrawal limits on VipEarner?',
    a: 'The minimum withdrawal is GH₵ 50.00. Standard withdrawals range up to GH₵ 150,000.00 per transaction depending on your active staking tier and verified telecom network channels.',
    sensitive: false,
  },
  {
    q: 'What happens if a withdrawal fails or is rejected?',
    a: 'If a transaction fails due to network downtime or an inactive recipient wallet, 100% of the funds are immediately refunded back into your wallet balance.',
    sensitive: false,
  },
];

export default function WithdrawPage() {
  const history = useHistory();
  const location = useLocation();
  const { profile, setProfile } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const targetAmount = queryParams.get('amount');
  const targetCoin = queryParams.get('coin');

  const [network, setNetwork] = useState<'MTN' | 'Telecel' | 'AirtelTigo'>('MTN');
  const [accountNumber, setAccountNumber] = useState(profile?.phone || '');
  const [amount, setAmount] = useState(targetAmount || '');

  useEffect(() => {
    if (targetAmount) {
      setAmount(targetAmount);
    }
  }, [targetAmount]);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sensitive Feedback & FAQ Modal State
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [sensitiveNoticeKey, setSensitiveNoticeKey] = useState<number>(0);

  // Modals & History State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState<number>(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState<'mine' | 'platform'>('mine');
  const [myWithdrawals, setMyWithdrawals] = useState<MyWithdrawalItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const availableBalance = Number(profile?.balance ?? 0);
  const numAmount = parseFloat(amount) || 0;
  // 5% service charge
  const serviceChargeFee = numAmount > 0 ? numAmount * 0.05 : 0;
  const actualAmountReceived = Math.max(0, numAmount - serviceChargeFee);

  const [savedAddresses, setSavedAddresses] = useState<SavedPaymentAddress[]>([]);

  // Sync saved payment address or phone if loaded
  useEffect(() => {
    const fetchAddrs = async () => {
      let list = await syncSavedAddressesWithSupabase(profile?.id);
      if (!list || list.length === 0) {
        list = getSavedAddresses(profile?.id);
      }
      setSavedAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault && a.type === 'momo');
      if (defaultAddr) {
        setAccountNumber(defaultAddr.accountNumber);
        if (defaultAddr.network === 'MTN' || defaultAddr.network === 'Telecel' || defaultAddr.network === 'AirtelTigo') {
          setNetwork(defaultAddr.network);
        }
        if (defaultAddr.accountName) {
          setRemark(defaultAddr.accountName);
        }
      } else if (profile?.phone && !accountNumber) {
        setAccountNumber(profile.phone);
      }
    };
    fetchAddrs();
  }, [profile]);

  // Network click handler with sensitive feedback
  const handleSelectNetwork = (net: 'MTN' | 'Telecel' | 'AirtelTigo') => {
    setNetwork(net);
    setSensitiveNoticeKey((prev) => prev + 1);
  };

  // Fetch withdrawal history
  const fetchMyWithdrawals = async () => {
    setLoadingHistory(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_my_withdrawals', { limit_count: 20 });
      if (!rpcErr && Array.isArray(data)) {
        setMyWithdrawals(data);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: directData } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
          if (directData) setMyWithdrawals(directData);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch personal withdrawals:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    fetchMyWithdrawals();
    setShowHistoryModal(true);
  };

  const handleSelectAll = () => {
    if (availableBalance > 0) {
      setAmount(availableBalance.toFixed(2));
      setError('');
    }
  };

  // Submit withdrawal request
  const handleWithdraw = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const minAmount = 50;

    if (isNaN(numAmount) || numAmount < minAmount) {
      setError(`Minimum withdrawal is GH₵ ${minAmount}.00`);
      return;
    }

    if (numAmount > availableBalance) {
      setError('Insufficient balance in your wallet');
      return;
    }

    if (!accountNumber || accountNumber.trim().length < 6) {
      setError('Please enter receiving phone number');
      return;
    }

    const recipientName =
      remark.trim() ||
      profile?.display_name ||
      'VIP Member';

    setLoading(true);
    setError('');

    try {
      await callEdgeFunction('request-withdrawal', {
        method: 'POST',
        body: {
          amount: numAmount,
          channel: 'mobile_money',
          details: {
            account_name: recipientName,
            account_number: accountNumber.trim(),
            network: network,
            currency: 'GHS',
            remark: remark.trim() || undefined,
          },
        },
      });

      // Update local profile balance preview
      if (profile) {
        setProfile({
          ...profile,
          balance: Math.max(0, availableBalance - numAmount),
        });
      }

      setSubmittedAmount(numAmount);
      setShowSuccessModal(true);
      setAmount('');
      fetchMyWithdrawals();
    } catch (err: any) {
      console.warn('Withdrawal failed:', err);
      setError(err.message ?? 'Failed to submit withdrawal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNetworkLabel = (net: string) => {
    if (net === 'MTN') return 'MTN MoMo';
    if (net === 'Telecel') return 'Telecel Cash';
    if (net === 'AirtelTigo') return 'AT Money';
    return net || 'Mobile Money';
  };

  // Sensitive guidance specifics per network
  const getNetworkSensitiveDetails = () => {
    if (network === 'MTN') {
      return {
        title: 'MTN Mobile Money Gateway',
        color: '#854D0E',
        badgeBg: '#FEF08A',
        iconBg: '#FEF9C3',
        simNotice: 'Funds are dispatched directly to your MTN Ghana SIM via MoMo Gateway.',
        securityTips: 'VIP Earner will NEVER ask for your MTN MoMo PIN or OTP. If anyone contacts you requesting your PIN, report them immediately.',
      };
    }
    if (network === 'Telecel') {
      return {
        title: 'Telecel Cash Gateway',
        color: '#991B1B',
        badgeBg: '#FECACA',
        iconBg: '#FEE2E2',
        simNotice: 'Ensure your Telecel Cash wallet is active to accept external electronic transfers.',
        securityTips: 'Transactions sent to an incorrect Telecel number cannot be reversed once approved. Never disclose your Telecel PIN.',
      };
    }
    return {
      title: 'AT Money (AirtelTigo) Gateway',
      color: '#1E3A8A',
      badgeBg: '#BFDBFE',
      iconBg: '#EFF6FF',
      simNotice: 'Automated settlement to your registered AT Money (AirtelTigo) wallet.',
      securityTips: 'Double-check your 10-digit number. Official staff will never request your mobile wallet security codes.',
    };
  };

  const netDetails = getNetworkSensitiveDetails();

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#FFFFFF' }}>
        {/* ── TOP NAV HEADER ────────────────────────────────────────── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: '#FFFFFF',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F3F4F6',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => history.push('/home')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 22,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#111827',
                padding: 0,
              }}
            >
              <IonIcon icon={arrowBackOutline} />
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              Withdraw GHS
            </h1>
          </div>

          {/* Safety & Sensitive FAQ Button in Header (Site UI Royal Blue Theme) */}
          <button
            type="button"
            onClick={() => setShowFaqModal(true)}
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 20,
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              color: '#2563EB',
              fontSize: 12,
              fontWeight: 700,
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 15, color: '#2563EB' }} />
            <span>Safety & FAQ</span>
          </button>
        </div>

        {/* ── FORM CONTAINER ──────────────────────────────────────────── */}
        <div style={{ padding: '20px 16px 80px', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleWithdraw}>
            {/* Target Coin Banner if navigated from Asset List */}
            {targetCoin && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                  border: '1.5px solid #10B981',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <CryptoCoinIcon coin={targetCoin} size={38} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#065F46' }}>
                    Withdrawing Proceeds from {targetCoin}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#047857', marginTop: 2 }}>
                    Proceeding to cash out earnings directly to your Ghana Mobile Money wallet.
                  </div>
                </div>
              </div>
            )}

            {/* Network / Coins Selector (MTN, Telecel, AT Money) */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {/* MTN Tab */}
                <button
                  type="button"
                  onClick={() => handleSelectNetwork('MTN')}
                  style={{
                    height: 50,
                    borderRadius: 12,
                    border: network === 'MTN' ? '2px solid #EAB308' : '1px solid #D1D5DB',
                    background: network === 'MTN' ? '#FEFCE8' : '#FFFFFF',
                    color: network === 'MTN' ? '#854D0E' : '#4B5563',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: network === 'MTN' ? '0 2px 8px rgba(234, 179, 8, 0.25)' : 'none',
                    transform: network === 'MTN' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  <MtnLogo size={20} />
                  <span>MTN</span>
                </button>

                {/* Telecel Tab */}
                <button
                  type="button"
                  onClick={() => handleSelectNetwork('Telecel')}
                  style={{
                    height: 50,
                    borderRadius: 12,
                    border: network === 'Telecel' ? '2px solid #E20613' : '1px solid #D1D5DB',
                    background: network === 'Telecel' ? '#FEF2F2' : '#FFFFFF',
                    color: network === 'Telecel' ? '#991B1B' : '#4B5563',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: network === 'Telecel' ? '0 2px 8px rgba(226, 6, 19, 0.22)' : 'none',
                    transform: network === 'Telecel' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  <TelecelLogo size={20} />
                  <span>Telecel</span>
                </button>

                {/* AT Money Tab */}
                <button
                  type="button"
                  onClick={() => handleSelectNetwork('AirtelTigo')}
                  style={{
                    height: 50,
                    borderRadius: 12,
                    border: network === 'AirtelTigo' ? '2px solid #003B99' : '1px solid #D1D5DB',
                    background: network === 'AirtelTigo' ? '#EFF6FF' : '#FFFFFF',
                    color: network === 'AirtelTigo' ? '#1E3A8A' : '#4B5563',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: network === 'AirtelTigo' ? '0 2px 8px rgba(0, 59, 153, 0.22)' : 'none',
                    transform: network === 'AirtelTigo' ? 'translateY(-1px)' : 'none',
                  }}
                >
                  <AtMoneyLogo size={20} />
                  <span>AT</span>
                </button>
              </div>
            </div>

            {/* ── SENSITIVE INFORMATION ADVISORY CARD (Triggers on coin/network tap) ──── */}
            <div
              key={sensitiveNoticeKey}
              style={{
                marginBottom: 20,
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 14,
                padding: '12px 14px',
                animation: 'fadeIn 0.25s ease-out',
                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#E0F2FE',
                    border: '1px solid #7DD3FC',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <IonIcon icon={shieldCheckmarkOutline} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1' }}>
                      {netDetails.title}
                    </div>
                    <span
                      style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      Sensitive Notice
                    </span>
                  </div>

                  <p style={{ margin: '0 0 6px', fontSize: 11.5, color: '#0C4A6E', lineHeight: 1.5 }}>
                    {netDetails.simNotice}
                  </p>

                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E0F2FE',
                      borderRadius: 8,
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    <IonIcon icon={lockClosedOutline} style={{ color: '#DC2626', fontSize: 14, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: '#475569', lineHeight: 1.45 }}>
                      <strong style={{ color: '#B91C1C' }}>Security Rule:</strong> {netDetails.securityTips}
                    </span>
                  </div>

                  {/* Interactive Trigger Button for Sensitive FAQ */}
                  <button
                    type="button"
                    onClick={() => setShowFaqModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284C7',
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'underline',
                    }}
                  >
                    <span>Read all sensitive financial guidelines & limits</span>
                    <IonIcon icon={chevronForwardOutline} style={{ fontSize: 12 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Phone Number / Receiving Account */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1F2937',
                  }}
                >
                  Phone Number
                </label>

                <button
                  type="button"
                  onClick={() => history.push('/payment-address')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: 0,
                  }}
                >
                  <span>Manage Addresses</span>
                  <span>→</span>
                </button>
              </div>

              {/* Saved Address Quick Select Chips */}
              {savedAddresses.filter((a) => a.type === 'momo').length > 0 && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
                  {savedAddresses
                    .filter((a) => a.type === 'momo')
                    .map((addr) => {
                      const isSelected = accountNumber === addr.accountNumber;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setAccountNumber(addr.accountNumber);
                            if (addr.network === 'MTN' || addr.network === 'Telecel' || addr.network === 'AirtelTigo') {
                              setNetwork(addr.network);
                            }
                            if (addr.accountName) setRemark(addr.accountName);
                            setError('');
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 8,
                            border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                            background: isSelected ? '#EFF6FF' : '#F8FAFC',
                            color: isSelected ? '#1D4ED8' : '#475569',
                            fontSize: 11,
                            fontWeight: isSelected ? 800 : 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>{addr.network}:</span>
                          <span>{addr.accountNumber}</span>
                          {addr.isDefault && <span style={{ fontSize: 9, color: '#2563EB' }}>★</span>}
                        </button>
                      );
                    })}
                </div>
              )}

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 10,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <input
                  type="tel"
                  placeholder="Please enter phone number"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#111827',
                    padding: '13px 0',
                  }}
                />
              </div>
            </div>

            {/* 3. Withdrawal Amount (With Balance on Right & ALL Inside) */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <label
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1F2937',
                  }}
                >
                  Withdrawal Amount
                </label>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  Balance:{' '}
                  <span style={{ fontWeight: 700, color: '#1F2937' }}>
                    {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GHS
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 10,
                  padding: '0 10px 0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <input
                  type="number"
                  step="any"
                  min={50}
                  placeholder="Min GH₵ 50.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#111827',
                    padding: '13px 0',
                  }}
                />

                {/* ALL Button Chip */}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{
                    background: '#EFF6FF',
                    border: 'none',
                    color: '#2563EB',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                  }}
                >
                  ALL
                </button>
              </div>
            </div>

            {/* 4. Name on Account (Optional) */}
            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#1F2937',
                  marginBottom: 8,
                }}
              >
                Name on Account (Optional)
              </label>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 10,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <input
                  type="text"
                  placeholder="Enter name registered on this number"
                  value={remark}
                  onChange={(e) => {
                    setRemark(e.target.value);
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#111827',
                    padding: '13px 0',
                  }}
                />
              </div>
            </div>

            {/* 5. Summary Card (Actual Amount Received & Service Charge 5%) */}
            <div
              style={{
                background: '#F8F9FA',
                border: '1px solid #F1F3F5',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                  Actual Amount Received
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#111827',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {actualAmountReceived.toFixed(2)} GHS
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                  Service Charge (5%)
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>
                  {serviceChargeFee.toFixed(2)} GHS
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <IonIcon icon={alertCircleOutline} style={{ color: '#EF4444', fontSize: 18, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            {/* 6. Big Solid Royal Blue Action Button: Withdraw */}
            <button
              type="submit"
              disabled={loading || !amount}
              style={{
                width: '100%',
                height: 50,
                background: '#1D5BD8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading || !amount ? 'not-allowed' : 'pointer',
                opacity: loading || !amount ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(29, 91, 216, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <IonSpinner name="crescent" style={{ width: 20, height: 20, color: '#FFFFFF' }} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Withdraw</span>
              )}
            </button>
          </form>

          {/* View withdrawal history link */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              type="button"
              onClick={handleOpenHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'color 0.15s ease',
              }}
            >
              <span>View withdrawal history</span>
              <IonIcon icon={chevronForwardOutline} style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MODAL: SENSITIVE INFORMATION & WITHDRAWAL FAQS
        ══════════════════════════════════════════════════════ */}
        {showFaqModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                maxHeight: '85vh',
                background: '#FFFFFF',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.25s ease-out',
                boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    <IonIcon icon={helpCircleOutline} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                      Withdrawal Security & FAQ
                    </h3>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                      Sensitive financial guidelines & safety rules
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#64748B',
                    borderRadius: 20,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 32px' }}>
                {/* Sensitive Security Notice Banner */}
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <IonIcon
                    icon={lockClosedOutline}
                    style={{ color: '#DC2626', fontSize: 20, flexShrink: 0, marginTop: 1 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B' }}>
                      Sensitive Security Advisory
                    </div>
                    <div style={{ fontSize: 12, color: '#B91C1C', lineHeight: 1.5, marginTop: 3 }}>
                      VIP Earner staff will <strong>NEVER</strong> contact you requesting your Mobile Money PIN, OTP, or password. Keep your credentials private at all times.
                    </div>
                  </div>
                </div>

                {/* FAQ Accordion List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {WITHDRAWAL_FAQ.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          background: faq.sensitive ? '#F0FDF4' : '#F8FAFC',
                          border: faq.sensitive ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                          borderRadius: 12,
                          overflow: 'hidden',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {faq.sensitive && (
                              <span
                                style={{
                                  background: '#DCFCE7',
                                  color: '#166534',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  flexShrink: 0,
                                }}
                              >
                                Crucial
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: '#0F172A',
                                lineHeight: 1.4,
                              }}
                            >
                              {faq.q}
                            </span>
                          </div>
                          <IonIcon
                            icon={isOpen ? chevronUpOutline : chevronDownOutline}
                            style={{ color: '#64748B', fontSize: 16, flexShrink: 0 }}
                          />
                        </button>

                        {isOpen && (
                          <div
                            style={{
                              padding: '0 16px 14px',
                              fontSize: 12.5,
                              lineHeight: 1.6,
                              color: '#475569',
                              borderTop: faq.sensitive ? '1px solid #DCFCE7' : '1px solid #F1F5F9',
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

                {/* Close Button in Modal */}
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  style={{
                    width: '100%',
                    height: 46,
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: 20,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  I Understand & Will Protect My PIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL: WITHDRAWAL HISTORY & PLATFORM PAYOUTS
        ══════════════════════════════════════════════════════ */}
        {showHistoryModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                maxHeight: '85vh',
                background: '#FFFFFF',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.25s ease-out',
                boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IonIcon icon={walletOutline} style={{ color: '#2563EB', fontSize: 20 }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                    Withdrawal History
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#64748B',
                    borderRadius: 20,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Segment Toggle */}
              <div style={{ padding: '12px 16px 8px' }}>
                <div
                  style={{
                    display: 'flex',
                    background: '#F1F5F9',
                    borderRadius: 10,
                    padding: 3,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setHistoryTab('mine')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: historyTab === 'mine' ? '#FFFFFF' : 'transparent',
                      color: historyTab === 'mine' ? '#0F172A' : '#64748B',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: historyTab === 'mine' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    My Withdrawals ({myWithdrawals.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('platform')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: historyTab === 'platform' ? '#FFFFFF' : 'transparent',
                      color: historyTab === 'platform' ? '#0F172A' : '#64748B',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: historyTab === 'platform' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Live Platform Payouts
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
                {historyTab === 'mine' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                      <button
                        type="button"
                        onClick={fetchMyWithdrawals}
                        disabled={loadingHistory}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 11,
                          color: '#64748B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <IonIcon icon={refreshOutline} />
                        Refresh
                      </button>
                    </div>

                    {loadingHistory ? (
                      <div style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8' }}>
                        <IonSpinner name="crescent" />
                      </div>
                    ) : myWithdrawals.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>💸</div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                          No withdrawal records yet
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94A3B8' }}>
                          Your requested cashouts will appear here.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {myWithdrawals.map((w) => {
                          const isApproved = w.status === 'approved' || w.status === 'completed';
                          const isRejected = w.status === 'rejected' || w.status === 'failed';
                          const statusText = isApproved ? 'Completed' : isRejected ? 'Failed' : 'Processing';

                          return (
                            <div
                              key={w.id}
                              style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: 12,
                                padding: '12px 14px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                                  GH₵ {Number(w.amount).toFixed(2)}
                                </span>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#FEF3C7',
                                    color: isApproved ? '#166534' : isRejected ? '#991B1B' : '#92400E',
                                  }}
                                >
                                  <IonIcon
                                    icon={isApproved ? checkmarkCircle : isRejected ? closeCircle : refreshOutline}
                                    style={{ fontSize: 13 }}
                                  />
                                  {statusText}
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 8 }}>
                                <span>
                                  {getNetworkLabel(w.details?.network || '')}
                                  {w.details?.account_number ? ` • ${String(w.details.account_number)}` : ''}
                                </span>
                                <span>{new Date(w.created_at).toLocaleDateString()}</span>
                              </div>

                              {statusText === 'Processing' && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    fontSize: 11,
                                    color: '#92400E',
                                    background: '#FEF3C7',
                                    padding: '5px 8px',
                                    borderRadius: 6,
                                  }}
                                >
                                  Automated verification in progress. Direct payout dispatched upon review.
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 12 }}>
                    <RecentWithdrawalsSection compact={true} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL: WITHDRAWAL SUBMITTED CONFIRMATION
        ══════════════════════════════════════════════════════ */}
        {showSuccessModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 20,
                padding: '28px 22px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  border: '2px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <IonIcon icon={checkmarkCircle} style={{ color: '#2563EB', fontSize: 34 }} />
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                Withdrawal Submitted!
              </h3>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#2563EB',
                  margin: '8px 0 12px',
                  fontFamily: 'monospace',
                }}
              >
                GH₵ {submittedAmount.toFixed(2)}
              </div>

              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.55, margin: '0 0 20px' }}>
                Your payout request has been received and is being processed to your{' '}
                <strong style={{ color: '#0F172A' }}>
                  {getNetworkLabel(network)}
                </strong>{' '}
                wallet (<strong style={{ color: '#0F172A' }}>{accountNumber}</strong>).
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                style={{
                  width: '100%',
                  height: 46,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
