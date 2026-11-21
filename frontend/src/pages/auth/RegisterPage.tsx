import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  personOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  giftOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { supabase, fnBase, supabaseAnonKey } from '../../lib/supabase';
import { registerSchema } from '../../lib/validation';
import { useAuthStore } from '../../stores/auth';
import { VipEarnerLogo } from '../../components/common/VipEarnerLogo';
import LanguageFlag from '../../components/common/LanguageFlag';

export default function RegisterPage() {
  const history = useHistory();
  const { setUser, setProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!agreeTerms) {
      setError('Please agree to the User Agreement & Privacy Policy to continue');
      return;
    }

    const result = registerSchema.safeParse({
      phone,
      password,
      confirmPassword,
      display_name: displayName,
      referral_code: referralCode || undefined,
    });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${fnBase}/register-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          phone,
          password,
          display_name: displayName,
          referral_code: referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Establish session with token
      if (data.token && data.refresh_token) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token,
        });

        if (sessionErr) {
          setError('Registration successful! Please proceed to login.');
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }

      if (data.user) {
        setProfile(data.user);
      }

      history.push('/home');
    } catch {
      setError('Connection error. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ '--background': 'var(--ve-bg, #F8FAFC)' }}>
        <div
          style={{
            width: '100%',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: 'env(safe-area-inset-top, 24px)',
            paddingBottom: 'env(safe-area-inset-bottom, 32px)',
          }}
        >
          {/* Top Brand Header */}
          {/* Top Language Pill */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, paddingRight: 4 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <LanguageFlag language="English" size={16} />
              <span>English</span>
            </div>
          </div>

          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <VipEarnerLogo size={52} showText={false} />
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  margin: 0,
                  color: '#1E3A8A',
                  letterSpacing: '-0.02em',
                  fontStyle: 'italic',
                }}
              >
                vipearner<span style={{ color: '#2563EB', fontStyle: 'normal' }}>.com</span>
              </h1>
              <p
                style={{
                  color: 'var(--ve-text-secondary, #475569)',
                  fontSize: 13,
                  margin: '6px 0 0',
                  fontWeight: 500,
                }}
              >
                Create Account & Claim Blind Box Rewards
              </p>
            </div>

            {/* Register Surface Card */}
            <div
              style={{
                background: 'var(--ve-surface, #FFFFFF)',
                borderRadius: 'var(--ve-radius-lg, 16px)',
                padding: '24px 20px',
                border: '1px solid var(--ve-border, #E2E8F0)',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: 'var(--ve-text-primary, #0F172A)',
                    margin: 0,
                  }}
                >
                  Create Account
                </h2>
                <p
                  style={{
                    color: 'var(--ve-text-secondary, #475569)',
                    fontSize: 13,
                    margin: '4px 0 0',
                  }}
                >
                  Fill in your details to start investing and earning
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Full Name */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ve-text-secondary, #475569)',
                      display: 'block',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Full Name
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--ve-bg, #F8FAFC)',
                      borderRadius: 'var(--ve-radius-md, 12px)',
                      border: '1.5px solid var(--ve-border, #E2E8F0)',
                      padding: '0 12px',
                    }}
                  >
                    <IonIcon
                      icon={personOutline}
                      style={{ color: '#64748B', fontSize: 18, marginRight: 8 }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Kwame Mensah"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '12px 0',
                        fontSize: 15,
                        outline: 'none',
                        color: 'var(--ve-text-primary, #0F172A)',
                      }}
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ve-text-secondary, #475569)',
                      display: 'block',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Phone Number
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--ve-bg, #F8FAFC)',
                      borderRadius: 'var(--ve-radius-md, 12px)',
                      border: '1.5px solid var(--ve-border, #E2E8F0)',
                      padding: '0 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        paddingRight: 8,
                        marginRight: 8,
                        borderRight: '1px solid var(--ve-border, #CBD5E1)',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--ve-text-primary, #0F172A)',
                      }}
                    >
                      <span>🇬🇭</span>
                      <span>+233</span>
                    </div>
                    <IonIcon
                      icon={callOutline}
                      style={{ color: '#64748B', fontSize: 18, marginRight: 8 }}
                    />
                    <input
                      type="tel"
                      placeholder="0544269465"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '12px 0',
                        fontSize: 15,
                        outline: 'none',
                        color: 'var(--ve-text-primary, #0F172A)',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ve-text-secondary, #475569)',
                      display: 'block',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--ve-bg, #F8FAFC)',
                      borderRadius: 'var(--ve-radius-md, 12px)',
                      border: '1.5px solid var(--ve-border, #E2E8F0)',
                      padding: '0 12px',
                    }}
                  >
                    <IonIcon
                      icon={lockClosedOutline}
                      style={{ color: '#64748B', fontSize: 18, marginRight: 8 }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '12px 0',
                        fontSize: 15,
                        outline: 'none',
                        color: 'var(--ve-text-primary, #0F172A)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ve-text-secondary, #475569)',
                      display: 'block',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Confirm Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--ve-bg, #F8FAFC)',
                      borderRadius: 'var(--ve-radius-md, 12px)',
                      border: '1.5px solid var(--ve-border, #E2E8F0)',
                      padding: '0 12px',
                    }}
                  >
                    <IonIcon
                      icon={lockClosedOutline}
                      style={{ color: '#64748B', fontSize: 18, marginRight: 8 }}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '12px 0',
                        fontSize: 15,
                        outline: 'none',
                        color: 'var(--ve-text-primary, #0F172A)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Referral Code (Optional) */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ve-text-secondary, #475569)',
                      display: 'block',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Referral Code (Optional)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--ve-bg, #F8FAFC)',
                      borderRadius: 'var(--ve-radius-md, 12px)',
                      border: '1.5px solid var(--ve-border, #E2E8F0)',
                      padding: '0 12px',
                    }}
                  >
                    <IonIcon
                      icon={giftOutline}
                      style={{ color: '#2563EB', fontSize: 18, marginRight: 8 }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. VE8888"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '12px 0',
                        fontSize: 15,
                        outline: 'none',
                        color: 'var(--ve-text-primary, #0F172A)',
                        textTransform: 'uppercase',
                      }}
                    />
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{
                      marginTop: 3,
                      accentColor: '#2563EB',
                      width: 16,
                      height: 16,
                      cursor: 'pointer',
                    }}
                  />
                  <label htmlFor="agreeTerms" style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, cursor: 'pointer' }}>
                    I have read and agree to the{' '}
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>User Agreement</span> &{' '}
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>Privacy Policy</span>.
                  </label>
                </div>

                {error && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 10,
                    }}
                  >
                    <IonText color="danger" style={{ fontSize: 13, fontWeight: 500 }}>
                      {error}
                    </IonText>
                  </div>
                )}

                {/* Submit Register Button */}
                <IonButton
                  expand="block"
                  onClick={handleRegister}
                  disabled={loading}
                  style={{
                    '--background': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                    '--border-radius': '12px',
                    '--box-shadow': '0 8px 16px -4px rgba(37, 99, 235, 0.4)',
                    height: 48,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <IonSpinner name="crescent" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Create Account</span>
                      <IonIcon icon={arrowForwardOutline} />
                    </div>
                  )}
                </IonButton>
              </div>
            </div>

            {/* Bottom Login Link */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <p style={{ color: 'var(--ve-text-secondary, #475569)', fontSize: 14, margin: 0 }}>
                Already have an account?{' '}
                <a
                  href="/login"
                  style={{
                    color: '#2563EB',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Log in
                </a>
              </p>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: 'var(--ve-text-muted, #94A3B8)',
                fontSize: 12,
              }}
            >
              <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 14, color: '#2563EB' }} />
              <span>256-bit SSL encrypted • Instant MoMo payouts</span>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
