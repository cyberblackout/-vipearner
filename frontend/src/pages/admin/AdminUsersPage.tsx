import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
} from '@ionic/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction } from '../../lib/supabase';
import { formatGHS, formatPhone } from '../../lib/formatters';
import { RefresherEventDetail } from '@ionic/core';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => callEdgeFunction<any>('get-admin-users'),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      callEdgeFunction(`admin-ban-user/${id}`, {
        method: 'POST',
        body: { reason },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) =>
      callEdgeFunction(`admin-unban-user/${id}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  async function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    await refetch();
    event.detail.complete();
  }

  async function handleBan(id: string) {
    const reason = prompt('Reason for banning:');
    if (reason) {
      await banMutation.mutateAsync({ id, reason });
    }
  }

  async function handleUnban(id: string) {
    if (confirm('Unban this user?')) {
      await unbanMutation.mutateAsync(id);
    }
  }

  const filteredUsers = data?.data?.filter(
    (u: any) =>
      u.phone?.includes(search) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <IonPage>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', padding: '32px 16px 48px', borderRadius: '0 0 24px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'white' }}>
          User Management
        </h1>
        <p style={{ opacity: 0.7, fontSize: 14, margin: '4px 0 0', color: 'white' }}>
          {data?.total ?? 0} total users
        </p>
      </div>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value ?? '')}
            placeholder="Search users..."
            style={{ marginBottom: 16 }}
          />

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredUsers?.map((user: any) => (
                <div
                  key={user.id}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: user.is_banned ? '#FEE2E2' : '#E0E7FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {user.is_banned ? '🚫' : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>
                      {user.display_name ?? 'N/A'}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                      {formatPhone(user.phone)}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                      Balance: {formatGHS(user.balance ?? 0)}
                    </p>
                  </div>
                  <div>
                    {user.is_banned ? (
                      <IonButton
                        size="small"
                        color="success"
                        onClick={() => handleUnban(user.id)}
                      >
                        Unban
                      </IonButton>
                    ) : (
                      <IonButton
                        size="small"
                        color="danger"
                        fill="outline"
                        onClick={() => handleBan(user.id)}
                      >
                        Ban
                      </IonButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
