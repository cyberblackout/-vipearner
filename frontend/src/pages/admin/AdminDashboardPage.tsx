import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { callEdgeFunction } from '../../lib/supabase';
import { formatGHS } from '../../lib/formatters';
import { RefresherEventDetail } from '@ionic/core';

export default function AdminDashboardPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => callEdgeFunction<any>('get-admin-stats'),
  });

  async function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    await refetch();
    event.detail.complete();
  }

  return (
    <IonPage>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', padding: '32px 16px 48px', borderRadius: '0 0 24px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'white' }}>
          Admin Dashboard
        </h1>
        <p style={{ opacity: 0.7, fontSize: 14, margin: '4px 0 0', color: 'white' }}>
          Manage your platform
        </p>
      </div>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="stat-card">
                  <div style={{ fontSize: 12, color: '#64748B' }}>Total Users</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 24 }}>
                    {data?.total_users ?? 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ fontSize: 12, color: '#64748B' }}>Total Balance</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>
                    {formatGHS(data?.total_balance ?? 0)}
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ fontSize: 12, color: '#64748B' }}>Pending Withdrawals</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 24, color: '#F59E0B' }}>
                    {data?.pending_withdrawals ?? 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ fontSize: 12, color: '#64748B' }}>Today's Tasks</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 24 }}>
                    {data?.today_tasks ?? 0}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href="/admin/users" style={{ flex: 1 }}>
                    <IonButton expand="block" style={{ '--background': '#3B82F6' }}>
                      Users
                    </IonButton>
                  </a>
                  <a href="/admin/withdrawals" style={{ flex: 1 }}>
                    <IonButton expand="block" style={{ '--background': '#8B5CF6' }}>
                      Withdrawals
                    </IonButton>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
