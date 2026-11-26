import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import { formatGHS } from '../../lib/formatters';
import BottomNav from '../../components/BottomNav';
import { InvestmentProductCard } from '../../components/common/InvestmentProductCard';
import { VipIncomeTable } from '../../components/common/VipIncomeTable';
import { TrustFooter } from '../../components/common/TrustFooter';
import { PRODUCTS_CATALOG, CryptoStakingProduct, COIN_CHIPS } from '../../data/cryptoProducts';
import { useNavigationStore } from '../../stores/navigationStore';

export default function VipPage() {
  const history = useHistory();
  const { profile, setProfile } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<'Regular Products' | 'VIP Income Table'>('Regular Products');
  const [selectedCoin, setSelectedCoin] = useState('ALL');
  
  // Staking sheet & confirmation state
  const [detailProduct, setDetailProduct] = useState<CryptoStakingProduct | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Android back button: close modals if open
  useEffect(() => {
    if (showConfirmModal) {
      return useNavigationStore.getState().registerModal('vipConfirm', () => setShowConfirmModal(false));
    }
  }, [showConfirmModal]);

  useEffect(() => {
    if (detailProduct && !showConfirmModal) {
      return useNavigationStore.getState().registerModal('vipDetail', () => setDetailProduct(null));
    }
  }, [detailProduct, showConfirmModal]);

  const handleConfirmVipOrder = async () => {
    if (!detailProduct) return;
    const cost = detailProduct.priceNum || parseFloat((detailProduct.priceGHS || detailProduct.minAmount || '120').replace(/[^0-9.]/g, '')) || 120;
    const currentBalance = profile?.balance ?? 0;

    if (currentBalance < cost) {
      setShowConfirmModal(false);
      if (confirm(`Insufficient balance (${formatGHS(currentBalance)}). This VIP contract requires ${formatGHS(cost)}. Would you like to deposit now?`)) {
        setDetailProduct(null);
        history.push(`/deposit?amount=${cost}`);
      }
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const newBalance = currentBalance - cost;
        const newWorkDeposit = (profile?.work_deposit ?? 0) + cost;
        const targetVip = detailProduct.name || 'VIP 1';

        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({
            balance: newBalance,
            work_deposit: newWorkDeposit,
            vip_level: targetVip,
            vip_upgraded_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (err) {
      console.error('Plan activation error:', err);
    }
    setShowConfirmModal(false);
    setOrderComplete(true);
  };

  const filteredProducts = PRODUCTS_CATALOG.filter((p) => {
    const matchCategory = p.category === activeCategory;
    const matchCoin = selectedCoin === 'ALL' || p.coin === selectedCoin;
    return matchCategory && matchCoin;
  });

  const handleOpenDetail = (p: CryptoStakingProduct) => {
    setDetailProduct(p);
    setPledgeAmount('');
    setShowConfirmModal(false);
    setOrderComplete(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        {/* ══════════════════════════════════════════════════════
            1. SEGMENT TABS (Regular Products vs VIP Income Table)
            Starts directly at the top with NO search bar or "Investment" header
        ══════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            paddingTop: 'env(safe-area-inset-top, 6px)',
          }}
        >
          {(['Regular Products', 'VIP Income Table'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flex: 1,
                padding: '14px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeCategory === cat ? '2px solid #2563EB' : '2px solid transparent',
                color: activeCategory === cat ? '#2563EB' : '#64748B',
                fontWeight: activeCategory === cat ? 800 : 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            2. HORIZONTAL COIN CHIPS (ALL, USDT, USDC, BTC, ETH, TRX)
        ══════════════════════════════════════════════════════ */}
        {activeCategory !== 'VIP Income Table' && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '12px 16px',
              overflowX: 'auto',
              background: '#FFFFFF',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            {COIN_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedCoin(chip)}
                style={{
                  padding: '5px 16px',
                  borderRadius: 20,
                  border: selectedCoin === chip ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  background: selectedCoin === chip ? '#2563EB' : '#F8FAFC',
                  color: selectedCoin === chip ? '#FFFFFF' : '#64748B',
                  fontWeight: selectedCoin === chip ? 700 : 500,
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            3. PRODUCTS FEED & VIP INCOME BREAKDOWN TABLE
        ══════════════════════════════════════════════════════ */}
        <div style={{ padding: '12px 14px 24px' }}>
          {activeCategory === 'VIP Income Table' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                  VIP Yield & Income Schedule
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Transparent daily, weekly, monthly and duration earnings breakdown in Ghana Cedis (GH₵). Select any VIP level below:
                </div>
              </div>

              {/* Exact reference Table with VIP1 to VIP12 selector */}
              <VipIncomeTable showSelector={true} />

              {/* Direct Action prompt */}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button
                  onClick={() => setActiveCategory('Regular Products')}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Activate VIP Plans Now
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredProducts.map((prod) => (
                <InvestmentProductCard
                  key={prod.id}
                  product={prod}
                  onPledge={(p, dur) => {
                    const days = parseInt(dur) || prod.durationDays || 180;
                    handleOpenDetail({
                      ...prod,
                      priceGHS: p.priceGHS,
                      minAmount: p.minAmount,
                      priceNum: p.priceNum,
                      subtitle: p.subtitle,
                      selectedDuration: p.selectedDuration,
                      duration: dur,
                      durationDays: days,
                      totalIncomeGHS: `GH₵ ${((prod.dailyRateNum || 6.5) * days).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    });
                  }}
                />
              ))}

              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                  No investment products found
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            4. BITCOIN & FINTECH TRUST FOOTER
        ══════════════════════════════════════════════════════ */}
        <TrustFooter />

        {/* ══════════════════════════════════════════════════════
            5. PRODUCT DETAIL & PLEDGE SHEET (Screens 058-061)
        ══════════════════════════════════════════════════════ */}
        {detailProduct && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setDetailProduct(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                width: '100%',
                borderRadius: '24px 24px 0 0',
                padding: '24px 20px 32px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  background: '#E2E8F0',
                  borderRadius: 2,
                  margin: '0 auto 16px',
                }}
              />

              {!orderComplete ? (
                <>
                  {/* Title & APY */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                        {detailProduct.name}
                      </h3>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                        {detailProduct.fullName} Asset Appreciation
                      </div>
                    </div>

                    <span
                      style={{
                        background: '#D1FAE5',
                        color: '#065F46',
                        fontSize: 13,
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 8,
                      }}
                    >
                      {detailProduct.apy}
                    </span>
                  </div>

                  {/* User Wallet Balance Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#F1F5F9',
                      borderRadius: 10,
                      padding: '8px 14px',
                      marginBottom: 14,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Your Balance</span>
                    <strong style={{ color: '#2563EB', fontSize: 14 }}>{formatGHS(profile?.balance ?? 0)}</strong>
                  </div>

                  {/* Dark VIP Breakdown Table matching Exact Reference Image (Black Card) */}
                  <div style={{ marginBottom: 16 }}>
                    <VipIncomeTable
                      vipLevel={detailProduct.name || 'VIP1'}
                      investmentAmount={detailProduct.priceNum || parseFloat((detailProduct.priceGHS || detailProduct.minAmount || '120').replace(/[^0-9.]/g, '')) || 120}
                      dailyIncome={detailProduct.dailyRateNum || parseFloat((detailProduct.dailyIncomeGHS || '6.5').replace(/[^0-9.]/g, '')) || 6.5}
                      durationDays={parseInt(detailProduct.duration) || detailProduct.durationDays || 180}
                    />
                  </div>

                  {/* Amount Input with ALL button */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                      Investment Amount ({detailProduct.coin})
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: 12,
                        padding: '0 12px',
                        height: 50,
                        background: '#FFFFFF',
                      }}
                    >
                      <input
                        type="number"
                        placeholder={`Min ${detailProduct.minAmount}`}
                        value={pledgeAmount}
                        onChange={(e) => setPledgeAmount(e.target.value)}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#0F172A',
                        }}
                      />
                      <button
                        onClick={() => setPledgeAmount(String(profile?.balance ?? 50))}
                        style={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        ALL
                      </button>
                    </div>
                  </div>

                  {/* Rules & Terms Text (from Screenshot 060) */}
                  <div
                    style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 11,
                      color: '#92400E',
                      lineHeight: 1.45,
                      marginBottom: 20,
                    }}
                  >
                    <strong>Product Terms:</strong> Fixed deposit is a digital asset yield plan.
                    After depositing, the contract is calculated immediately. Earnings are paid daily and automatically
                    credited to your wallet in GHS / crypto equivalent. Principal is returned upon maturity.
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => setDetailProduct(null)}
                      style={{
                        height: 48,
                        borderRadius: 12,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontWeight: 600,
                        color: '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      style={{
                        height: 48,
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        fontSize: 14,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      Activate Plan
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 50, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                    Order Successfully Activated!
                  </h3>
                  <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>
                    Your {pledgeAmount || detailProduct.minAmount} {detailProduct.coin} contract has started.
                    Daily returns will arrive automatically.
                  </p>
                  <button
                    onClick={() => setDetailProduct(null)}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 12,
                      border: 'none',
                      background: '#10B981',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            6. SECONDARY CONFIRMATION MODAL (Screenshot 062)
        ══════════════════════════════════════════════════════ */}
        {showConfirmModal && detailProduct && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px 20px',
                maxWidth: 340,
                width: '100%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: 26,
                }}
              >
                <IonIcon icon={shieldCheckmarkOutline} />
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                Confirm Plan Activation
              </h3>

              <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 16px' }}>
                Type: <strong>{detailProduct.name}</strong><br />
                Amount: <strong style={{ color: '#2563EB' }}>{pledgeAmount || detailProduct.minAmount} {detailProduct.coin}</strong>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmVipOrder}
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Space for bottom nav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))' }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}