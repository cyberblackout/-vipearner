import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import {
  walletOutline,
  arrowDownOutline,
  arrowUpOutline,
  timeOutline,
  checkmarkCircle,
  closeCircle,
  alertCircleOutline,
  chevronForwardOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import { formatGHS, formatDate, formatTime } from '../../lib/formatters';
import BottomNav from '../../components/BottomNav';
import { useNavigationStore } from '../../stores/navigationStore';
import { RefresherEventDetail } from '@ionic/core';

interface TransactionItem {
  id: string;
  amount: number;
  direction: '+' | '-';
  type: string;
  status: string;
  paystack_reference: string | null;
  metadata: any;
  created_at: string;
}

export default function TransactionsPage() {
  const history = useHistory();
  const { profile } = useAuthStore();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const savedFilter = useNavigationStore.getState().getPageState('transactions')?.filterType;
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'rewards'>(savedFilter || 'all');

  const handleFilterChange = (type: 'all' | 'deposit' | 'withdrawal' | 'rewards') => {
    setFilterType(type);
    useNavigationStore.getState().setPageState('transactions', { filterType: type });
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTransactions(data as TransactionItem[]);
      } else {
        setTransactions([]);
      }
    } catch (e) {
      console.warn('Failed to fetch transactions:', e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchTransactions();
    event.detail.complete();
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'deposit') return tx.type === 'deposit';
    if (filterType === 'withdrawal') return tx.type === 'withdrawal';
    if (filterType === 'rewards') {
      return (
        tx.type === 'task_reward' ||
        tx.type === 'daily_checkin' ||
        tx.type === 'lucky_bag' ||
        tx.type === 'referral_bonus'
      );
    }
    return true;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit Recharge';
      case 'withdrawal':
        return 'MoMo Withdrawal';
      case 'task_reward':
        return 'Task Reward';
      case 'vip_upgrade':
        return 'VIP Upgrade';
      case 'lucky_bag':
        return 'Lucky Bag Gift';
      case 'daily_checkin':
        return 'Daily Check-in';
      case 'referral_bonus':
        return 'Referral Commission';
      case 'admin_adjustment':
        return 'Account Adjustment';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return {
          label: 'Completed',
          bg: '#ECFDF5',
          color: '#059669',
          icon: checkmarkCircle,
        };
      case 'pending':
        return {
          label: 'Pending',
          bg: '#FEF3C7',
          color: '#D97706',
          icon: timeOutline,
        };
      case 'failed':
        return {
          label: 'Failed',
          bg: '#FEE2E2',
          color: '#DC2626',
          icon: closeCircle,
        };
      case 'reversed':
        return {
          label: 'Reversed',
          bg: '#F3F4F6',
          color: '#6B7280',
          icon: alertCircleOutline,
        };
      default:
        return {
          label: status,
          bg: '#F1F5F9',
          color: '#475569',
          icon: timeOutline,
        };
    }
  };

  const balance = Number(profile?.balance ?? 0);
  const totalIncome = Number(profile?.total_income ?? 0);
  const totalWithdrawals = Number(profile?.total_withdrawals ?? 0);
  const workDeposit = Number(profile?.work_deposit ?? 0);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ paddingBottom: 85 }}>
          {/* ══════════════════════════════════════════════════════
              TOP HEADER: WALLET OVERVIEW (Deep Obsidian/Navy Card)
          ══════════════════════════════════════════════════════ */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              padding: '24px 20px 28px',
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IonIcon icon={walletOutline} style={{ fontSize: 22, color: '#38BDF8' }} />
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  My Wallet
                </span>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: 20,
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <IonIcon icon={balanceVisible ? eyeOutline : eyeOffOutline} />
                <span>{balanceVisible ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            {/* Total Balance */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Withdrawable Balance
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#38BDF8', marginTop: 4, letterSpacing: '-0.02em' }}>
                {balanceVisible ? formatGHS(balance) : 'GH₵ ••••••'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 14,
                padding: '12px 10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 600 }}>Total Income</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#10B981', marginTop: 3 }}>
                  {balanceVisible ? formatGHS(totalIncome) : '••••'}
                </div>
              </div>
              <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 600 }}>Total Withdrawn</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#F59E0B', marginTop: 3 }}>
                  {balanceVisible ? formatGHS(totalWithdrawals) : '••••'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 600 }}>Work Deposit</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#60A5FA', marginTop: 3 }}>
                  {balanceVisible ? formatGHS(workDeposit) : '••••'}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
              <button
                onClick={() => history.push('/deposit')}
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                }}
              >
                <IonIcon icon={arrowDownOutline} style={{ fontSize: 18 }} />
                <span>Deposit Funds</span>
              </button>

              <button
                onClick={() => history.push('/withdraw')}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <IonIcon icon={arrowUpOutline} style={{ fontSize: 18 }} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              TRANSACTIONS HISTORY SECTION
          ══════════════════════════════════════════════════════ */}
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Transaction History
              </h2>
              <button
                onClick={() => history.push('/funds-details')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>Funds Details</span>
                <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'deposit', label: 'Deposits' },
                { id: 'withdrawal', label: 'Withdrawals' },
                { id: 'rewards', label: 'Rewards' },
              ].map((tab) => {
                const active = filterType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterChange(tab.id as any)}
                    style={{
                      background: active ? '#2563EB' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#64748B',
                      border: active ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <IonSpinner name="crescent" color="primary" />
                <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 8 }}>Loading transactions...</div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: '36px 16px',
                  textAlign: 'center',
                  border: '1px solid #E2E8F0',
                  marginTop: 8,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                  No transactions found
                </div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, maxWidth: 260, margin: '4px auto 0' }}>
                  {filterType === 'all'
                    ? 'Your deposits, withdrawals, and task earnings will be recorded here.'
                    : `No ${filterType} records found on your account yet.`}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {filteredTransactions.map((tx) => {
                  const badge = getStatusBadge(tx.status);
                  const isCredit = tx.direction === '+';
                  const amountColor = isCredit ? '#059669' : '#DC2626';

                  return (
                    <div
                      key={tx.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 14,
                        padding: '14px 16px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Icon circle */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: isCredit ? '#ECFDF5' : '#FEE2E2',
                            color: isCredit ? '#059669' : '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IonIcon icon={isCredit ? arrowDownOutline : arrowUpOutline} style={{ fontSize: 20 }} />
                        </div>

                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                            {getTypeLabel(tx.type)}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 3 }}>
                            {formatDate(tx.created_at)} • {formatTime(tx.created_at)}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: amountColor }}>
                          {isCredit ? '+' : '-'}{formatGHS(Number(tx.amount))}
                        </div>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            background: badge.bg,
                            color: badge.color,
                            borderRadius: 10,
                            padding: '2px 7px',
                            fontSize: 10.5,
                            fontWeight: 700,
                            marginTop: 4,
                          }}
                        >
                          <IonIcon icon={badge.icon} style={{ fontSize: 11 }} />
                          <span>{badge.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Space for bottom nav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))' }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
