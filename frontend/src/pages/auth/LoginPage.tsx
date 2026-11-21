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
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { supabase, fnBase, supabaseAnonKey } from '../../lib/supabase';
import { loginSchema } from '../../lib/validation';
import { useAuthStore } from '../../stores/auth';
import { VipEarnerLogo } from '../../components/common/VipEarnerLogo';
import LanguageFlag from '../../components/common/LanguageFlag';

export default function LoginPage() {
  const history = useHistory();
  const { setUser, setProfile } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const result = loginSchema.safeParse({ phone, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${fnBase}/login-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid phone number or password');
        return;
      }

      const token = data.token || data.access_token || data.session?.access_token;
      const refreshToken = data.refresh_token || data.session?.refresh_token;

      if (token && refreshToken) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken,
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }

      if (token) {
        try {
          const profileResponse = await fetch(`${fnBase}/get-profile`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfile(profileData);
          } else if (data.profile) {
            setProfile(data.profile);
          }
        } catch {
          if (data.profile) setProfile(data.profile);
        }
      } else if (data.profile) {
        setProfile(data.profile);
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
            paddingTop: 'env(safe-area-inset-top, 32px)',
            paddingBottom: 'env(safe-area-inset-bottom, 32px)',
          }}
        >
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

          {/* Top Brand Header */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              {/* Premium Logo */}
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
                Exclusive Crypto & Payout Platform
              </p>
            </div>

            {/* Login Surface Card */}
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
                    margin: 0,
                    color: 'var(--ve-text-primary, #0F172A)',
                  }}
                >
                  Welcome Back
                </h2>
                <p
                  style={{
                    color: 'var(--ve-text-secondary, #475569)',
                    fontSize: 13,
                    margin: '4px 0 0',
                  }}
                >
                  Log in with your Ghana mobile number
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Ghana Phone Number Input */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--ve-text-secondary, #475569)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Password
                    </label>
                    <a
                      href="https://wa.me/233544269465?text=Hello%20support,%20I%20need%20to%20reset%20my%20password."
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: '#2563EB',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Forgot?
                    </a>
                  </div>
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
                      placeholder="Password"
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
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#64748B',
                      }}
                    >
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 10,
                      padding: '10px 14px',
                    }}
                  >
                    <IonText color="danger" style={{ fontSize: 13, fontWeight: 500 }}>
                      {error}
                    </IonText>
                  </div>
                )}

                {/* Primary Action Button */}
                <IonButton
                  expand="block"
                  onClick={handleLogin}
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
                    <IonSpinner name="crescent" color="light" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Sign In to Account</span>
                      <IonIcon icon={arrowForwardOutline} />
                    </div>
                  )}
                </IonButton>
              </div>

              {/* Trust Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 18,
                  fontSize: 12,
                  color: 'var(--ve-text-muted, #94A3B8)',
                }}
              >
                <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#2563EB' }} />
                <span>256-Bit Encrypted Session • MoMo Ready</span>
              </div>
            </div>

            {/* Registration Redirection */}
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <span style={{ color: 'var(--ve-text-secondary, #475569)', fontSize: 14 }}>
                New to VIP Earner?{' '}
              </span>
              <a
                href="/register"
                style={{
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Create Free Account
              </a>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
