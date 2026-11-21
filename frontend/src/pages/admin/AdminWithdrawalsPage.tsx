import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
} from '@ionic/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction } from '../../lib/supabase';
import { formatGHS, formatPhone, formatDate, formatTime } from '../../lib/formatters';
import { RefresherEventDetail } from '@ionic/core';
import { searchOutline } from 'ionicons/icons';

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
};

export default function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => callEdgeFunction<any>('get-admin-withdrawals'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note, transactionRef }: { id: string; note?: string; transactionRef?: string }) =>
      callEdgeFunction(`approve-withdrawal/${id}`, {
        method: 'POST',
        body: { note, transactionRef },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      callEdgeFunction(`reject-withdrawal/${id}`, {
        method: 'POST',
        body: { reason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  async function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    await refetch();
    event.detail.complete();
  }

  async function handleApprove(id: string) {
    const transactionRef = prompt('Enter MoMo / Bank Transaction Reference / Batch ID (Required for audit):');
    if (!transactionRef) {
      alert('Approval cancelled. A transaction reference is required for audit logs.');
      return;
    }
    const note = prompt('Admin settlement note (optional):');
    await approveMutation.mutateAsync({ id, transactionRef, note: note ?? undefined });
  }

  async function handleReject(id: string) {
    const reason = prompt('Rejection reason (Required):');
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason });
    }
  }

  const allItems = data?.data || [];
  const filteredItems = allItems.filter((item: any) => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchStatus;
    const nameMatch = (item.user?.display_name || '').toLowerCase().includes(q);
    const phoneMatch = (item.user?.phone || '').includes(q);
    const accMatch = (item.details?.account_number || '').includes(q);
    return matchStatus && (nameMatch || phoneMatch || accMatch);
  });

  return (
    <IonPage>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', padding: '32px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'white' }}>
          Withdrawals Management
        </h1>
        <p style={{ opacity: 0.8, fontSize: 13, margin: '4px 0 16px', color: 'white' }}>
          Review, verify payment references, and audit payout settlements
        </p>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <IonIcon
            icon={searchOutline}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              fontSize: 18,
            }}
          />
          <input
            type="text"
            placeholder="Search by name, phone or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => {
            const isSelected = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 18,
                  border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                  background: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                  color: isSelected ? '#5B21B6' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
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
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <p style={{ fontWeight: 600 }}>No matching withdrawal records</p>
              <p style={{ fontSize: 14 }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredItems.map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: 15, color: '#0F172A' }}>
                        {withdrawal.user?.display_name ?? 'User'}
                      </p>
                      <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>
                        {formatPhone(withdrawal.user?.phone ?? '')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: 17,
                          color: '#0F172A',
                        }}
                      >
                        {formatGHS(withdrawal.amount)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: statusColors[withdrawal.status],
                          textTransform: 'uppercase',
                        }}
                      >
                        {withdrawal.status}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#334155', background: '#F8FAFC', padding: '8px 10px', borderRadius: 8, marginBottom: 8 }}>
                    <strong>{withdrawal.channel === 'mobile_money' ? '📱 MoMo' : '🏦 Bank'}:</strong>{' '}
                    {withdrawal.details?.network || withdrawal.details?.bank_name || 'MoMo'}{' '}
                    • Account: <span style={{ fontFamily: 'monospace' }}>{withdrawal.details?.account_number}</span>{' '}
                    • Name: {withdrawal.details?.account_name}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>
                    <span>{formatDate(withdrawal.created_at)} • {formatTime(withdrawal.created_at)}</span>
                    {withdrawal.details?.transaction_ref && (
                      <span style={{ color: '#059669', fontWeight: 600 }}>Ref: {withdrawal.details.transaction_ref}</span>
                    )}
                  </div>

                  {withdrawal.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <IonButton
                        size="small"
                        color="success"
                        expand="block"
                        style={{ flex: 1, fontWeight: 700 }}
                        onClick={() => handleApprove(withdrawal.id)}
                      >
                        Verify &amp; Settle
                      </IonButton>
                      <IonButton
                        size="small"
                        color="danger"
                        fill="outline"
                        expand="block"
                        style={{ flex: 1, fontWeight: 700 }}
                        onClick={() => handleReject(withdrawal.id)}
                      >
                        Reject
                      </IonButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
