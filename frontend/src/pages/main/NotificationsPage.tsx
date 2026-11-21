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
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import {
  giftOutline,
  walletOutline,
  ribbonOutline,
  megaphoneOutline,
  personAddOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { callEdgeFunction } from '../../lib/supabase';
import { formatDate, formatTime } from '../../lib/formatters';
import BottomNav from '../../components/BottomNav';
import { RefresherEventDetail } from '@ionic/core';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res: any = await callEdgeFunction('get-notifications?page=1&limit=50', {
        method: 'GET',
      });
      if (res && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchNotifications();
    event.detail.complete();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await callEdgeFunction('mark-notification-read', {
        method: 'POST',
        body: { id },
      });
    } catch (e) {
      console.warn('Could not mark notification read:', e);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'withdrawal_update':
        return walletOutline;
      case 'task_reward':
      case 'daily_checkin':
        return checkmarkCircleOutline;
      case 'lucky_bag':
        return giftOutline;
      case 'vip_upgrade':
        return ribbonOutline;
      case 'referral_bonus':
        return personAddOutline;
      case 'announcement':
      default:
        return megaphoneOutline;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'task_reward':
      case 'daily_checkin':
        return { bg: '#ECFDF5', text: '#059669' };
      case 'withdrawal_update':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'vip_upgrade':
        return { bg: '#EFF6FF', text: '#2563EB' };
      case 'lucky_bag':
        return { bg: '#FDF2F8', text: '#DB2777' };
      case 'referral_bonus':
        return { bg: '#F5F3FF', text: '#7C3AED' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="dark" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>
            Notifications
          </IonTitle>
          <IonButtons slot="end">
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 800,
                  marginRight: 12,
                }}
              >
                {unreadCount} new
              </span>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '16px 16px 85px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <IonSpinner name="crescent" color="primary" />
              <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 8 }}>Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '48px 20px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                marginTop: 20,
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 12 }}>🔔</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                No notifications yet
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, maxWidth: 260, margin: '6px auto 0' }}>
                System announcements, deposit confirmations, and task earnings will appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map((item) => {
                const colors = getColorForType(item.type);
                const icon = getIconForType(item.type);

                return (
                  <div
                    key={item.id}
                    onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                    style={{
                      background: item.is_read ? '#FFFFFF' : '#F0F9FF',
                      borderRadius: 14,
                      padding: '14px 16px',
                      border: item.is_read ? '1px solid #E2E8F0' : '1px solid #BAE6FD',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {!item.is_read && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 14,
                          right: 14,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#0284C7',
                        }}
                      />
                    )}

                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: colors.bg,
                        color: colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IonIcon icon={icon} style={{ fontSize: 20 }} />
                    </div>

                    <div style={{ flex: 1, paddingRight: item.is_read ? 0 : 12 }}>
                      <div style={{ fontSize: 14, fontWeight: item.is_read ? 700 : 800, color: '#0F172A' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#475569', marginTop: 4, lineHeight: 1.45 }}>
                        {item.body}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                        {formatDate(item.created_at)} • {formatTime(item.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile bottom clearance spacer for fixed BottomNav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
