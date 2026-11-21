import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
} from '@ionic/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction } from '../../lib/supabase';
import { formatGHS as _formatGHS } from '../../lib/formatters';

export default function LuckyBagPage() {
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['lucky-bag-status'],
    queryFn: () => callEdgeFunction<any>('get-lucky-bag-status'),
  });

  const claimMutation = useMutation({
    mutationFn: () => callEdgeFunction<any>('claim-lucky-bag', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lucky-bag-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  async function handleClaim() {
    setClaiming(true);
    try {
      const result = await claimMutation.mutateAsync();
      alert(`You won GHS ${result.reward} from the lucky bag!`);
    } catch (err: any) {
      alert(err.message ?? 'Claim failed');
    } finally {
      setClaiming(false);
    }
  }

  return (
    <IonPage>
      <div className="gradient-header">
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'white' }}>
          Lucky Bag
        </h1>
        <p style={{ opacity: 0.7, fontSize: 14, margin: '4px 0 0', color: 'white' }}>
          Win rewards daily
        </p>
      </div>

      <IonContent>
        <div className="ion-padding">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          ) : (
            <>
              {/* Main Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  borderRadius: 16,
                  padding: 32,
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎁</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: 'white' }}>
                  Lucky Bag
                </h2>
                <p style={{ opacity: 0.9, margin: '0 0 8px', color: 'white' }}>
                  Win GHS {data?.reward_min ?? 0.1} - {data?.reward_max ?? 1.0}
                </p>
                <p style={{ opacity: 0.8, margin: '0 0 24px', fontSize: 14, color: 'white' }}>
                  Claim your daily reward!
                </p>

                {data?.can_claim ? (
                  <IonButton
                    expand="block"
                    onClick={handleClaim}
                    disabled={claiming}
                    style={{
                      '--background': 'white',
                      '--color': '#F59E0B',
                      borderRadius: 12,
                      height: 48,
                      fontWeight: 600,
                    }}
                  >
                    {claiming ? <IonSpinner name="crescent" /> : 'Claim Now'}
                  </IonButton>
                ) : (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, color: 'white' }}>
                      Next claim at {data?.next_claim_time ?? '--:--'}
                    </p>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                  How it works
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 24 }}>🎁</div>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>Claim Once Daily</p>
                      <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                        You can claim one lucky bag every 24 hours
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 24 }}>💰</div>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>Random Reward</p>
                      <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                        Win between GHS {data?.reward_min ?? 0.1} and GHS {data?.reward_max ?? 1.0}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 24 }}>⚡</div>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>Instant Credit</p>
                      <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                        Rewards are added to your balance immediately
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
