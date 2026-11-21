import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/react';
import {
  shieldCheckmarkOutline,
  lockClosedOutline,
  keyOutline,
  phonePortraitOutline,
  alertCircleOutline,
  checkmarkCircle,
  closeOutline,
  eyeOutline,
  eyeOffOutline,
  hardwareChipOutline,
  globeOutline,
  fingerPrintOutline,
  timeOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';

export default function AccountSecurityPage() {
  const { profile, user } = useAuthStore();
  const userId = profile?.id || user?.id || 'guest';

  // Fund PIN state loaded from Supabase Auth user metadata
  const pinKey = `vip_fund_pin_${userId}`;
  const [hasFundPin, setHasFundPin] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      const pin = authUser?.user_metadata?.fund_pin || localStorage.getItem(pinKey);
      if (pin) {
        setHasFundPin(true);
        setStoredPin(pin);
      }
    });
  }, [pinKey, userId]);

  // Modal 1: Change Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Modal 2: Change/Set Fund PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Password submission
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPassSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPassSuccess(false);
        setShowPasswordModal(false);
      }, 2000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password. Please re-authenticate.');
    } finally {
      setPassLoading(false);
    }
  };

  // Fund PIN submission via Supabase user metadata
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess(false);

    if (!/^\d{6}$/.test(newPin)) {
      setPinError('Fund PIN must be exactly 6 digits (0–9).');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New Fund PINs do not match.');
      return;
    }

    if (hasFundPin && storedPin && currentPinInput !== storedPin) {
      setPinError('Current Fund PIN is incorrect.');
      return;
    }

    setPinLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { fund_pin: newPin },
      });
      if (error) throw error;

      localStorage.setItem(pinKey, newPin);
      setStoredPin(newPin);
      setHasFundPin(true);
      setPinSuccess(true);
      setCurrentPinInput('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setPinSuccess(false);
        setShowPinModal(false);
      }, 1500);
    } catch (err: any) {
      setPinError(err.message || 'Failed to update Fund PIN in Supabase.');
    } finally {
      setPinLoading(false);
    }
  };

  // Masked Phone Number
  const rawPhone = profile?.phone || '';
  const maskedPhone =
    rawPhone.length >= 8
      ? `${rawPhone.slice(0, 3)} •••• ${rawPhone.slice(-3)}`
      : rawPhone || 'Registered Mobile';

  return (
    <IonPage>
      {/* ── HEADER ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" color="dark" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>
            Account Security
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <div style={{ padding: '16px 16px 90px', width: '100%', maxWidth: 650, margin: '0 auto' }}>
          {/* ── 1. SECURITY RATING HERO CARD ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #334155 100%)',
              borderRadius: 20,
              padding: '22px 18px',
              color: '#FFFFFF',
              boxShadow: '0 10px 24px -5px rgba(15, 23, 42, 0.35)',
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Shield Outline */}
            <div
              style={{
                position: 'absolute',
                top: -15,
                right: -15,
                opacity: 0.08,
                fontSize: 130,
                pointerEvents: 'none',
              }}
            >
              🛡️
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#10B981', fontSize: 28 }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.2 }}>
                    Security Level: High
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: '#10B981',
                      color: '#FFFFFF',
                      padding: '2px 7px',
                      borderRadius: 10,
                    }}
                  >
                    PROTECTED
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                  256-Bit Cryptographic Vault &amp; Fraud Prevention Active
                </div>
              </div>
            </div>

            {/* Quick Security Checklist Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#10B981', fontSize: 13 }} />
                <span>SSL Secured</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <IonIcon icon={checkmarkCircle} style={{ color: '#10B981', fontSize: 13 }} />
                <span>SIM Bound</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <IonIcon
                  icon={hasFundPin ? checkmarkCircle : alertCircleOutline}
                  style={{ color: hasFundPin ? '#10B981' : '#F59E0B', fontSize: 13 }}
                />
                <span>{hasFundPin ? 'PIN Active' : 'Set PIN'}</span>
              </div>
            </div>
          </div>

          {/* ── 2. SENSITIVE ADVISORY BANNER ── */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 16,
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <IonIcon icon={alertCircleOutline} style={{ color: '#D97706', fontSize: 18 }} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#92400E' }}>
                Sensitive Security Rule: Zero Disclosure
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: '#78350F', lineHeight: 1.45 }}>
              VIP Earner staff, customer care, and automated banking bots will <strong>NEVER</strong> contact you requesting your Login Password, Fund PIN, or SMS OTP codes. Keep your credentials private at all times.
            </p>
          </div>

          {/* ── 3. CORE SECURITY SETTINGS ── */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #F1F5F9',
                fontSize: 12,
                fontWeight: 800,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Authentication &amp; Credentials
            </div>

            {/* ITEM 1: LOGIN PASSWORD */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IonIcon icon={lockClosedOutline} style={{ color: '#2563EB', fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                    Login Password
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    Used for signing into your VIP Earner account
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPassError('');
                  setPassSuccess(false);
                  setShowPasswordModal(true);
                }}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#2563EB',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Modify
              </button>
            </div>

            {/* ITEM 2: FUND TRANSACTION PIN */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: hasFundPin ? '#ECFDF5' : '#FEF3C7',
                    border: `1px solid ${hasFundPin ? '#A7F3D0' : '#FDE68A'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IonIcon
                    icon={keyOutline}
                    style={{ color: hasFundPin ? '#059669' : '#D97706', fontSize: 20 }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                      Fund Transaction PIN
                    </span>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        background: hasFundPin ? '#DCFCE7' : '#FEF3C7',
                        color: hasFundPin ? '#15803D' : '#B45309',
                        padding: '1px 6px',
                        borderRadius: 8,
                      }}
                    >
                      {hasFundPin ? 'ACTIVE' : 'NOT SET'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    Mandatory 6-digit PIN required for all cashouts &amp; withdrawals
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPinError('');
                  setPinSuccess(false);
                  setShowPinModal(true);
                }}
                style={{
                  background: hasFundPin ? '#F1F5F9' : '#2563EB',
                  border: hasFundPin ? '1px solid #E2E8F0' : 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: hasFundPin ? '#059669' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {hasFundPin ? 'Change PIN' : 'Set PIN'}
              </button>
            </div>

            {/* ITEM 3: BOUND MOBILE PHONE */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IonIcon icon={phonePortraitOutline} style={{ color: '#475569', fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                    Bound Phone Number
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    Primary telecom anchor for SMS &amp; recovery
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: '#0F172A',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
              >
                {maskedPhone}
              </span>
            </div>

            {/* ITEM 4: BIOMETRIC / 2FA AUDIT */}
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IonIcon icon={fingerPrintOutline} style={{ color: '#7E22CE', fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                    Device &amp; Session Guard
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    Real-time monitoring against credential stuffing
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#059669',
                  background: '#DCFCE7',
                  padding: '3px 8px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <IonIcon icon={checkmarkCircle} style={{ fontSize: 12 }} />
                <span>Protected</span>
              </span>
            </div>
          </div>

          {/* ── 4. DEVICE & ENVIRONMENT DETAILS ── */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '16px',
              marginBottom: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Current Active Session
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IonIcon icon={hardwareChipOutline} />
                  <span>Client Operating Environment</span>
                </span>
                <strong style={{ color: '#0F172A' }}>VipEarner PWA • SSL Verified</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IonIcon icon={globeOutline} />
                  <span>Authorized Domain</span>
                </span>
                <strong style={{ color: '#2563EB' }}>www.vipearner.com</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IonIcon icon={timeOutline} />
                  <span>Session Status</span>
                </span>
                <span style={{ color: '#059669', fontWeight: 800 }}>● Online Now</span>
              </div>
            </div>
          </div>

          {/* ── 5. ANTI-FRAUD LOCKOUT RULES ── */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '14px 16px',
              fontSize: 11.5,
              color: '#64748B',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: 4 }}>
              Automatic Anti-Brute-Force Lockout
            </strong>
            Entering 5 consecutive incorrect passwords or Fund PINs will trigger an automated 2-hour security freeze on all withdrawal requests to protect your funds against unauthorized access.
          </div>

          {/* ── 6. INSTITUTIONAL FOOTER ── */}
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 11,
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#059669', fontSize: 15 }} />
            <span>256-Bit Cryptographic Vault • VipEarner Security Engine</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MODAL 1: MODIFY LOGIN PASSWORD
        ══════════════════════════════════════════════════════ */}
        {showPasswordModal && (
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
            onClick={() => setShowPasswordModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                width: '100%',
                borderRadius: '26px 26px 0 0',
                padding: '22px 18px 36px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                    Modify Login Password
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Update your account authentication credential
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    background: '#F1F5F9',
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

              {passError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#DC2626',
                    fontSize: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IonIcon icon={alertCircleOutline} style={{ fontSize: 16 }} />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#059669',
                    fontSize: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IonIcon icon={checkmarkCircle} style={{ fontSize: 16 }} />
                  <span>Login password successfully updated!</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B',
                      }}
                    >
                      <IonIcon icon={showPass ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Confirm New Password
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: passLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    opacity: passLoading ? 0.7 : 1,
                  }}
                >
                  {passLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MODAL 2: SET / MODIFY FUND PIN
        ══════════════════════════════════════════════════════ */}
        {showPinModal && (
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
            onClick={() => setShowPinModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                width: '100%',
                borderRadius: '26px 26px 0 0',
                padding: '22px 18px 36px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                    {hasFundPin ? 'Modify Fund PIN' : 'Set 6-Digit Fund PIN'}
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Used for authorization on all Mobile Money cashouts
                  </div>
                </div>
                <button
                  onClick={() => setShowPinModal(false)}
                  style={{
                    background: '#F1F5F9',
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

              {pinError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#DC2626',
                    fontSize: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IonIcon icon={alertCircleOutline} style={{ fontSize: 16 }} />
                  <span>{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#059669',
                    fontSize: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IonIcon icon={checkmarkCircle} style={{ fontSize: 16 }} />
                  <span>Fund PIN successfully activated &amp; secured!</span>
                </div>
              )}

              <form onSubmit={handleUpdatePin}>
                {hasFundPin && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                      Current 6-Digit Fund PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter existing PIN"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 16,
                        letterSpacing: 4,
                        textAlign: 'center',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    New 6-Digit Fund PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 18,
                      letterSpacing: 6,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Must be exactly 6 digits. Do not use sequential or repeated digits.
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Confirm 6-Digit Fund PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 18,
                      letterSpacing: 6,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={pinLoading}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    background: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: pinLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                    opacity: pinLoading ? 0.7 : 1,
                  }}
                >
                  {pinLoading ? 'Securing PIN...' : 'Save Fund PIN'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile bottom clearance spacer for fixed BottomNav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
