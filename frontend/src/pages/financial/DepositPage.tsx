import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  arrowBackOutline,
  copyOutline,
  checkmarkCircle,
  cloudUploadOutline,
  closeCircleOutline,
  shieldCheckmarkOutline,
  chevronForwardOutline,
  timeOutline,
  refreshOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { formatGHS } from '../../lib/formatters';
import { callEdgeFunction, supabase } from '../../lib/supabase';
import CryptoCoinIcon from '../../components/common/CryptoCoinIcon';

// ── OFFICIAL TELECEL CASH LOGO ───────────────────────────────────────────────
const TelecelLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
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

// ── TELECEL CASH RECIPIENT ACCOUNT (EXCLUSIVE DEPOSIT NETWORK) ────────────────
const TELECEL_ACCOUNT = {
  network: 'Telecel',
  name: 'TELECEL CASH',
  phone: '0201634748',
  accountHolder: 'GBETI GODSWAY',
};

const QUICK_AMOUNTS = [250, 500, 1000, 2000, 3500, 5000];

export default function DepositPage() {
  const history = useHistory();
  const location = useLocation();
  const { profile } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const planCoin = queryParams.get('coin');
  const planAmount = queryParams.get('amount');

  const [amount, setAmount] = useState(planAmount || '');
  const [senderPhone, setSenderPhone] = useState(profile?.phone || '');

  useEffect(() => {
    if (planAmount) {
      setAmount(planAmount);
    }
  }, [planAmount]);
  const [reference, setReference] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ── PAYMENT SESSION COUNTDOWN (15:00 = 900 seconds) ────────────────────────
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setTimeLeft(900);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync phone from profile when loaded
  useEffect(() => {
    if (profile?.phone && !senderPhone) {
      setSenderPhone(profile.phone);
    }
  }, [profile]);

  // Copy phone number to clipboard
  const handleCopy = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Handle image upload & create thumbnail preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size must be less than 8MB');
      return;
    }

    setScreenshotName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setScreenshotPreview(compressed);
        } else {
          setScreenshotPreview(e.target?.result as string);
        }
      };
      img.onerror = () => {
        setScreenshotPreview(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch recent deposit transactions
  const fetchDepositHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: txErr } = await supabase
        .from('transactions')
        .select('id, amount, direction, type, status, paystack_reference, metadata, created_at')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!txErr && data) {
        setHistoryList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch deposit history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    fetchDepositHistory();
    setShowHistoryModal(true);
  };

  // Submit manual deposit via Telecel Cash
  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 250) {
      setError('Minimum deposit is GH₵ 250.00');
      return;
    }

    if (!senderPhone || senderPhone.trim().length < 8) {
      setError('Please enter the Telecel phone number you sent the money from');
      return;
    }

    if (!screenshotPreview) {
      setError('Please attach a screenshot of your payment receipt');
      return;
    }

    setLoading(true);
    setError('');

    const depositRef = reference.trim() || `DEP-${Date.now().toString(36).toUpperCase()}`;

    try {
      // 1. Attempt submitting via edge function
      await callEdgeFunction('submit-manual-deposit', {
        method: 'POST',
        body: {
          amount: numAmount,
          network: 'Telecel',
          senderPhone: senderPhone.trim(),
          reference: depositRef,
          screenshotUrl: screenshotPreview,
        },
      });

      setShowSuccessModal(true);
      setAmount('');
      setReference('');
      handleRemoveScreenshot();
    } catch (err: any) {
      console.warn('Edge function failed, falling back to direct insert:', err);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User session not found. Please log in again.');

        const { error: insertErr } = await supabase.from('transactions').insert({
          user_id: user.id,
          amount: numAmount,
          direction: '+',
          type: 'deposit',
          status: 'pending',
          paystack_reference: depositRef,
          metadata: {
            payment_method: 'telecel_cash',
            network: 'Telecel',
            sender_phone: senderPhone.trim(),
            recipient_phone: TELECEL_ACCOUNT.phone,
            reference: depositRef,
            screenshot_url: screenshotPreview,
            submitted_at: new Date().toISOString(),
          },
        });

        if (insertErr) throw insertErr;

        setShowSuccessModal(true);
        setAmount('');
        setReference('');
        handleRemoveScreenshot();
      } catch (innerErr: any) {
        setError(innerErr.message || 'Failed to submit deposit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        {/* ══════════════════════════════════════════════════════
            TOP NAVIGATION BAR
        ══════════════════════════════════════════════════════ */}
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
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
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
                color: '#0F172A',
                padding: 0,
              }}
            >
              <IonIcon icon={arrowBackOutline} />
            </button>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              Deposit Telecel Cash
            </h1>
          </div>

          {/* User Balance Badge */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              padding: '4px 10px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Balance:</span>
            <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 800 }}>
              {formatGHS(profile?.balance ?? 0)}
            </span>
          </div>
        </div>

        <div style={{ padding: '16px 14px 90px', width: '100%', boxSizing: 'border-box' }}>
          {/* ══════════════════════════════════════════════════════
              PAYMENT SESSION COUNTDOWN (Recolored to match default royal blue site theme)
          ══════════════════════════════════════════════════════ */}
          <div
            style={{
              background: timeLeft < 120 ? '#FEF2F2' : '#EFF6FF',
              border: timeLeft < 120 ? '1px solid #FECACA' : '1px solid #BFDBFE',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: timeLeft < 120 ? '#FEE2E2' : '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: timeLeft < 120 ? '#DC2626' : '#2563EB',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <IonIcon icon={timeOutline} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: timeLeft < 120 ? '#B91C1C' : '#1D4ED8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Payment Session Active
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                  {timeLeft > 0
                    ? 'Transfer & upload receipt before session expires'
                    : 'Session timed out. Tap refresh to renew'}
                </div>
              </div>
            </div>

            {timeLeft > 0 ? (
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: timeLeft < 120 ? '#DC2626' : '#2563EB',
                  letterSpacing: '0.05em',
                }}
              >
                {formatCountdown(timeLeft)}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResetTimer}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                }}
              >
                <IonIcon icon={refreshOutline} style={{ fontSize: 13 }} />
                Refresh
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 1: OFFICIAL TELECEL CASH RECIPIENT ACCOUNT
          ══════════════════════════════════════════════════════ */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '20px 18px',
              marginBottom: 16,
              color: '#0F172A',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Header with Telecel Logo & Verified Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TelecelLogo size={32} />
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 800,
                      color: '#0F172A',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Telecel Cash
                  </h2>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    Official Payment Channel
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>✓ Verified</span>
              </div>
            </div>

            {/* Instruction description */}
            <p
              style={{
                margin: '0 0 16px',
                fontSize: 13,
                lineHeight: 1.55,
                color: '#475569',
              }}
            >
              Transfer your deposit amount to the official Telecel Cash receiver number below. Then upload
              your transaction screenshot to credit your account immediately upon confirmation.
            </p>

            {/* Telecel Recipient Account Box */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 14,
                padding: '16px',
                border: '1.5px solid #E2E8F0',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Telecel Cash Number
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '0.05em',
                  fontFamily: 'monospace',
                  marginBottom: 4,
                }}
              >
                {TELECEL_ACCOUNT.phone}
              </div>

              <div style={{ fontSize: 13, color: '#334155', fontWeight: 700, marginBottom: 12 }}>
                Account Name: <span style={{ color: '#0F172A' }}>{TELECEL_ACCOUNT.accountHolder}</span>
              </div>

              {/* Copy Number Action Button */}
              <button
                type="button"
                onClick={() => handleCopy(TELECEL_ACCOUNT.phone)}
                style={{
                  width: '100%',
                  height: 42,
                  background: copiedPhone ? '#EFF6FF' : '#FFFFFF',
                  border: copiedPhone ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  color: copiedPhone ? '#2563EB' : '#1E293B',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <IonIcon
                  icon={copiedPhone ? checkmarkCircle : copyOutline}
                  style={{ fontSize: 16, color: copiedPhone ? '#2563EB' : '#64748B' }}
                />
                <span>{copiedPhone ? 'Number Copied to Clipboard!' : 'Copy Telecel Number'}</span>
              </button>
            </div>

            {/* Quick Dial Instructions */}
            <div
              style={{
                background: '#F1F5F9',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 11.5,
                color: '#475569',
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              <strong>Quick Steps:</strong> Dial <code style={{ color: '#2563EB', fontWeight: 800 }}>*110#</code> &gt; 
              Select <strong>Send Money</strong> &gt; Enter <strong>{TELECEL_ACCOUNT.phone}</strong> &gt; Confirm <strong>{TELECEL_ACCOUNT.accountHolder}</strong>.
            </div>

            {/* Minimum Deposit Footer Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#64748B',
                paddingTop: 10,
                borderTop: '1px solid #F1F5F9',
              }}
            >
              <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#2563EB', fontSize: 16 }} />
              <span>
                Minimum deposit: <strong style={{ color: '#0F172A' }}>GH₵ 250.00</strong>
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 2: SUBMIT DEPOSIT FORM
          ══════════════════════════════════════════════════════ */}
          <form
            onSubmit={handleSubmitDeposit}
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '20px 18px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Header */}
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
              Confirm Your Deposit
            </h3>

            {/* Plan Activation Banner if routed from coin plan */}
            {planCoin && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  border: '1.5px solid #3B82F6',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <CryptoCoinIcon coin={planCoin} size={46} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#1E40AF' }}>
                      Activating {planCoin.toUpperCase()} Plan
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, background: '#2563EB', color: '#FFFFFF', padding: '1px 6px', borderRadius: 4 }}>
                      Exact Amount
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#1E3A8A', marginTop: 2, lineHeight: 1.4 }}>
                    Deposit exact amount <strong>GH₵ {planAmount || amount}</strong> via Telecel Cash to activate your <strong>{planCoin.toUpperCase()}</strong> daily earnings contract.
                  </div>
                </div>
              </div>
            )}

            {/* 1. Amount (GHS) */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 8,
                }}
              >
                Deposit Amount (GHS)
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#64748B',
                  }}
                >
                  GH₵
                </span>
                <input
                  type="number"
                  min="250"
                  step="any"
                  placeholder="250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    padding: '0 14px 0 46px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Quick Amount Chips */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                  marginTop: 10,
                }}
              >
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    style={{
                      background: amount === String(val) ? '#EFF6FF' : '#F1F5F9',
                      border: amount === String(val) ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                      color: amount === String(val) ? '#2563EB' : '#475569',
                      fontWeight: 700,
                      fontSize: 11.5,
                      padding: '5px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    GH₵ {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Network Confirmation Badge */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 8,
                }}
              >
                Deposit Network
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #E20613',
                  background: '#FEF2F2',
                }}
              >
                <TelecelLogo size={26} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>
                    Telecel Cash (Exclusive)
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Receiver: {TELECEL_ACCOUNT.phone} ({TELECEL_ACCOUNT.accountHolder})
                  </div>
                </div>
                <IonIcon icon={checkmarkCircle} style={{ color: '#16A34A', fontSize: 18 }} />
              </div>
            </div>

            {/* 3. Telecel Phone Number you sent from */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 8,
                }}
              >
                Your Telecel Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 020XXXXXXX"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  padding: '0 14px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 4. Transaction Reference ID (Optional) */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 8,
                }}
              >
                Telecel Transaction ID / Reference{' '}
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 24891028491"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  padding: '0 14px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 5. Payment Screenshot Upload */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 8,
                }}
              >
                Payment Receipt Screenshot
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!screenshotPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: 12,
                    padding: '20px 14px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontSize: 22,
                    }}
                  >
                    <IonIcon icon={cloudUploadOutline} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Tap to upload payment screenshot
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                    PNG, JPG, or JPEG up to 8MB
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '10px 12px',
                    background: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <img
                    src={screenshotPreview}
                    alt="Receipt Preview"
                    style={{
                      width: 54,
                      height: 54,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {screenshotName || 'receipt_screenshot.png'}
                    </div>
                    <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 2 }}>
                      ✓ Screenshot attached
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: 22,
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IonIcon icon={closeCircleOutline} />
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#B91C1C',
                  fontSize: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 14,
                background: loading ? '#94A3B8' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
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
                  <span>Submitting Deposit...</span>
                </>
              ) : (
                'Submit Deposit'
              )}
            </button>

            {/* View Deposit History Link */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button"
                onClick={handleOpenHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                }}
              >
                <span>View deposit history</span>
                <IonIcon icon={chevronForwardOutline} style={{ fontSize: 13 }} />
              </button>
            </div>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════
            SUCCESS MODAL
        ══════════════════════════════════════════════════════ */}
        {showSuccessModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px 20px',
                width: '100%',
                maxWidth: 360,
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  margin: '0 auto 16px',
                }}
              >
                <IonIcon icon={checkmarkCircle} />
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                Deposit Submitted!
              </h3>

              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                Your Telecel Cash payment proof has been received. Your wallet balance will be
                updated automatically upon confirmation.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleOpenHistory();
                  }}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 10,
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View Deposit History
                </button>

                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 10,
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            DEPOSIT HISTORY MODAL / DRAWER
        ══════════════════════════════════════════════════════ */}
        {showHistoryModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
            onClick={() => setShowHistoryModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                width: '100%',
                borderRadius: '24px 24px 0 0',
                padding: '20px 18px 32px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Pill */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: '#CBD5E1',
                  margin: '0 auto 16px',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Deposit History
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>

              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <IonSpinner name="crescent" style={{ color: '#2563EB' }} />
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
                    Loading history...
                  </div>
                </div>
              ) : historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    No deposits found
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    Your submitted Telecel Cash deposits will appear here.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {historyList.map((item) => {
                    const status = item.status?.toLowerCase();
                    const isProcessing = status === 'pending' || status === 'processing';
                    const isApproved = status === 'completed' || status === 'approved';

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#F8FAFC',
                          borderRadius: 12,
                          padding: '12px 14px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                              +GH₵ {Number(item.amount).toFixed(2)}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: 6,
                                background: isProcessing
                                  ? 'rgba(37, 99, 235, 0.12)'
                                  : isApproved
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : 'rgba(239, 68, 68, 0.12)',
                                color: isProcessing
                                  ? '#2563EB'
                                  : isApproved
                                  ? '#059669'
                                  : '#DC2626',
                                textTransform: 'uppercase',
                              }}
                            >
                              {isProcessing ? 'Processing' : item.status}
                            </span>
                          </div>

                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                            {item.metadata?.network || 'Telecel Cash'} •{' '}
                            {new Date(item.created_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {item.metadata?.screenshot_url && (
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 6,
                              overflow: 'hidden',
                              border: '1px solid #CBD5E1',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={item.metadata.screenshot_url}
                              alt="Receipt"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
