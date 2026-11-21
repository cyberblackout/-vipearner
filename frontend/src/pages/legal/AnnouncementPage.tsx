import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  refreshOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  timeOutline,
} from 'ionicons/icons';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';

interface Announcement {
  id: string;
  title: string;
  content: string;
  banner_url?: string | null;
  is_pinned?: boolean;
  created_at: string;
}

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch announcements from database:', error.message);
        setAnnouncements([]);
      } else {
        setAnnouncements(data || []);
      }
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" color="dark" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>
            Announcements
          </IonTitle>
          <IonButtons slot="end">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {refreshing ? (
                <IonSpinner name="crescent" style={{ width: 18, height: 18, color: '#2563EB' }} />
              ) : (
                <IonIcon icon={refreshOutline} style={{ fontSize: 20 }} />
              )}
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <div style={{ padding: '16px 16px 90px', width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {/* ── 1. HEADER BANNER ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 65%, #2563EB 100%)',
              borderRadius: 18,
              padding: '18px 16px',
              color: '#FFFFFF',
              marginBottom: 16,
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Official Bulletin
              </span>
              <span style={{ fontSize: 11, color: '#93C5FD', fontWeight: 600 }}>
                Administration Broadcast
              </span>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 900, letterSpacing: '-0.01em' }}>
              Platform Announcements
            </h2>
            <p style={{ margin: 0, fontSize: 12.5, color: '#E2E8F0', lineHeight: 1.5 }}>
              All official platform statements, scheduled maintenance windows, and policy updates are issued directly by the system administrator.
            </p>
          </div>

          {/* ── 2. ADMIN AUTHORIZATION NOTICE ── */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11.5,
              color: '#1E40AF',
            }}
          >
            <IonIcon icon={lockClosedOutline} style={{ fontSize: 16, color: '#2563EB', flexShrink: 0 }} />
            <span>
              <strong>Admin Broadcast Only:</strong> System announcements can only be posted by authorized platform administrators.
            </span>
          </div>

          {/* ── 3. ANNOUNCEMENT LIST / EMPTY STATE ── */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <IonSpinner name="crescent" style={{ color: '#2563EB' }} />
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>Checking for announcements...</div>
            </div>
          ) : announcements.length === 0 ? (
            /* ── AUTHENTIC "NO ANNOUNCEMENT" EMPTY STATE ── */
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 18,
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              {/* Sleek Megaphone Graphic in Circle */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M7 15l1 5" />
                </svg>
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                No Announcements Yet
              </h3>
              <p style={{ margin: '0 auto 20px', fontSize: 12.5, color: '#64748B', lineHeight: 1.55, maxWidth: 360 }}>
                There are currently no new announcements from the administrator. When official notices, maintenance updates, or reward events are published by the admin, they will appear here.
              </p>

              <button
                onClick={handleRefresh}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#1E293B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 0.15s ease',
                }}
              >
                <IonIcon icon={refreshOutline} style={{ fontSize: 15 }} />
                <span>Refresh Announcements</span>
              </button>
            </div>
          ) : (
            /* ── ADMIN ANNOUNCEMENTS LIST (WHEN ADMIN POSTS) ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    padding: '16px',
                    border: item.is_pinned ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.is_pinned && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: '#2563EB', color: '#FFFFFF', padding: '1px 6px', borderRadius: 4 }}>
                          PINNED
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IonIcon icon={timeOutline} style={{ fontSize: 13 }} />
                        {new Date(item.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: 4 }}>
                      Verified Admin
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 8px', fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 4. OFFICIAL TRUST FOOTER ── */}
          <div
            style={{
              marginTop: 20,
              textAlign: 'center',
              fontSize: 11,
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 14, color: '#2563EB' }} />
            <span>Official Announcements • VipEarner Administration Desk</span>
          </div>

          {/* Mobile bottom clearance spacer for fixed BottomNav */}
          <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
        </div>
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
