import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction } from '../../lib/supabase';
import { formatGHS } from '../../lib/formatters';
import { useAuthStore } from '../../stores/auth';
import { RefresherEventDetail } from '@ionic/core';
import AppBackButton from '../../components/AppBackButton';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const [startingTask, setStartingTask] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => callEdgeFunction<any>('get-tasks'),
  });

  const startMutation = useMutation({
    mutationFn: (taskId: string) =>
      callEdgeFunction<any>('start-task', { method: 'POST', body: { task_id: taskId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (sessionId: string) =>
      callEdgeFunction<any>('complete-task', { method: 'POST', body: { session_id: sessionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  async function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    await refetch();
    event.detail.complete();
  }

  async function handleStart(taskId: string) {
    setStartingTask(taskId);
    try {
      const session = await startMutation.mutateAsync(taskId);
      // Auto-complete after wait_seconds
      setTimeout(async () => {
        setCompletingSession(session.id);
        try {
          await completeMutation.mutateAsync(session.id);
        } catch (_err) {
        } finally {
          setCompletingSession(null);
        }
      }, (data?.tasks?.find((t: any) => t.id === taskId)?.wait_seconds ?? 15) * 1000);
    } catch (_err) {
    } finally {
      setStartingTask(null);
    }
  }

  return (
    <IonPage>
      <div className="gradient-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AppBackButton fallback="/home" color="#FFFFFF" />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'white' }}>
            Daily Tasks
          </h1>
          <p style={{ opacity: 0.7, fontSize: 14, margin: '4px 0 0', color: 'white' }}>
            Complete tasks to earn rewards
          </p>
        </div>
      </div>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div className="stat-card">
              <div style={{ fontSize: 12, color: '#64748B' }}>Tasks Today</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: '#1D4ED8' }}>
                {data?.today_count ?? 0}
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 12, color: '#64748B' }}>Per Task</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: '#10B981' }}>
                {formatGHS(data?.reward_per_task ?? 0.2)}
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 12, color: '#64748B' }}>Daily Limit</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18 }}>
                {data?.limit ?? 5}
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 12, color: '#64748B' }}>VIP Level</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: '#F59E0B' }}>
                {profile?.vip_level ?? 'Intern'}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          ) : data?.tasks?.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>All tasks completed today!</p>
              <p style={{ fontSize: 14 }}>Come back tomorrow for more tasks.</p>
              <a href="/vip">
                <IonButton style={{ marginTop: 16 }}>Upgrade VIP</IonButton>
              </a>
            </div>
          ) : (
            data?.tasks?.map((task: any) => (
              <div key={task.id} className="task-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: '#EFF6FF',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    📱
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600, margin: 0, fontSize: 16 }}>
                      {task.title}
                    </h3>
                    <p style={{ fontSize: 14, color: '#64748B', margin: '2px 0 0' }}>
                      Earn {formatGHS(data?.reward_per_task ?? 0.2)}
                    </p>
                  </div>
                  <IonButton
                    size="small"
                    onClick={() => handleStart(task.id)}
                    disabled={startingTask === task.id || completingSession !== null}
                  >
                    {startingTask === task.id ? (
                      <IonSpinner name="crescent" style={{ width: 16, height: 16 }} />
                    ) : completingSession ? (
                      'Completing...'
                    ) : (
                      'Start'
                    )}
                  </IonButton>
                </div>
              </div>
            ))
          )}

          {/* Remaining tasks banner */}
          {data?.remaining !== undefined && data.remaining > 0 && (
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 12,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  background: '#1D4ED8',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                {data.remaining} remaining
              </span>
            </div>
          )}
          {/* Mobile bottom safe-area clearance */}
          <div style={{ height: 'calc(32px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
