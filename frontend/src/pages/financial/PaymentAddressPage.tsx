import React, { useState, useEffect, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import {
  addOutline,
  copyOutline,
  checkmarkCircle,
  trashOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  starOutline,
  star,
  closeOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../stores/auth';
import { useNavigationStore } from '../../stores/navigationStore';
import AppBackButton from '../../components/AppBackButton';
import {
  SavedPaymentAddress,
  getSavedAddresses,
  syncSavedAddressesWithSupabase,
  savePaymentAddress,
  deletePaymentAddress,
  setDefaultPaymentAddress,
  validatePaymentAddress,
} from '../../lib/paymentAddresses';
import BottomNav from '../../components/BottomNav';

// AT Money Brand SVG
const AtMoneyLogo: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
    <rect width="36" height="36" rx="8" fill="#003B99" />
    <circle cx="26" cy="13.5" r="3" fill="#E50019" />
    <text
      x="16.5"
      y="23"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="12.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.4px"
    >
      at
    </text>
  </svg>
);

export default function PaymentAddressPage() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [addresses, setAddresses] = useState<SavedPaymentAddress[]>([]);
  const [networkFilter, setNetworkFilter] = useState<'all' | 'MTN' | 'Telecel' | 'AirtelTigo'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for adding new MoMo address
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNetwork, setNewNetwork] = useState<'MTN' | 'Telecel' | 'AirtelTigo'>('MTN');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [confirmedSensitive, setConfirmedSensitive] = useState(false);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    loadAddresses();
  }, [userId]);

  // Android back button: close add address modal if open
  useEffect(() => {
    if (showAddModal) {
      return useNavigationStore.getState().registerModal('addPaymentAddress', () => setShowAddModal(false));
    }
  }, [showAddModal]);

  const loadAddresses = async () => {
    let list = await syncSavedAddressesWithSupabase(userId);
    if (!list || list.length === 0) {
      list = getSavedAddresses(userId);
    }
    // If empty and profile phone exists, auto-seed with user's verified phone number
    if (list.length === 0 && profile?.phone) {
      const defaultMoMo = savePaymentAddress(userId, {
        type: 'momo',
        network: 'MTN',
        accountNumber: profile.phone,
        accountName: profile.display_name || 'Primary Account',
        remark: 'Default Mobile Money',
        isDefault: true,
      });
      setAddresses([defaultMoMo]);
    } else {
      setAddresses(list);
    }
  };

  const filteredAddresses = useMemo(() => {
    if (networkFilter === 'all') return addresses;
    return addresses.filter((a) => a.network === networkFilter);
  }, [addresses, networkFilter]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your saved payment addresses?`)) {
      deletePaymentAddress(userId, id);
      loadAddresses();
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultPaymentAddress(userId, id);
    loadAddresses();
  };

  const handleOpenAddModal = (preferredNetwork: 'MTN' | 'Telecel' | 'AirtelTigo' = 'MTN') => {
    setNewNetwork(preferredNetwork);
    setNewAccountNumber('');
    setNewAccountName(profile?.display_name || '');
    setNewRemark('');
    setNewIsDefault(addresses.length === 0);
    setConfirmedSensitive(false);
    setError('');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newAccountNumber.trim()) {
      setError('Please enter your Mobile Money receiving phone number.');
      return;
    }

    if (!newAccountName.trim()) {
      setError('Please enter the registered SIM account name (matching your telecom registration).');
      return;
    }

    const validation = validatePaymentAddress(newNetwork, newAccountNumber);
    if (!validation.valid) {
      setError(validation.error || 'Invalid phone number format.');
      return;
    }

    if (!confirmedSensitive) {
      setError('Please acknowledge that you have verified the recipient details.');
      return;
    }

    savePaymentAddress(userId, {
      type: 'momo',
      network: newNetwork,
      accountNumber: newAccountNumber.trim(),
      accountName: newAccountName.trim(),
      remark: newRemark.trim() || `${newNetwork} MoMo`,
      isDefault: newIsDefault,
    });

    loadAddresses();
    setShowAddModal(false);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <AppBackButton fallback="/profile" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>
            Payment Address
          </IonTitle>
          <IonButtons slot="end">
            <button
              onClick={() => handleOpenAddModal('MTN')}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#2563EB',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <IonIcon icon={addOutline} style={{ fontSize: 18 }} />
              <span>Add</span>
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <div style={{ padding: '16px 16px 90px', width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {/* ── 1. SENSITIVE SECURITY WARNING BANNER ── */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <IonIcon icon={alertCircleOutline} style={{ color: '#D97706', fontSize: 20 }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                Sensitive Security Advisory: MoMo Payout Binding
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: '#78350F', lineHeight: 1.5 }}>
              For your fund protection, ensure all receiving Mobile Money accounts belong directly to you and match your official registered SIM name. Automated settlements are dispatched irrevocably to your bound Mobile Money number.
            </p>
          </div>

          {/* ── 2. QUICK ADD BUTTON ── */}
          <button
            onClick={() => handleOpenAddModal('MTN')}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1.5px dashed #2563EB',
              borderRadius: 14,
              padding: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              marginBottom: 16,
            }}
          >
            <IonIcon icon={phonePortraitOutline} style={{ color: '#2563EB', fontSize: 20 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
              + Bind New Mobile Money Account
            </span>
          </button>

          {/* ── 3. NETWORK FILTER CHIPS ── */}
          <div
            style={{
              display: 'flex',
              background: '#E2E8F0',
              borderRadius: 12,
              padding: 3,
              marginBottom: 16,
              gap: 2,
            }}
          >
            {[
              { key: 'all', label: `All (${addresses.length})` },
              { key: 'MTN', label: `MTN (${addresses.filter((a) => a.network === 'MTN').length})` },
              { key: 'Telecel', label: `Telecel (${addresses.filter((a) => a.network === 'Telecel').length})` },
              { key: 'AirtelTigo', label: `AT Money (${addresses.filter((a) => a.network === 'AirtelTigo').length})` },
            ].map((tab) => {
              const active = networkFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setNetworkFilter(tab.key as any)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    border: 'none',
                    borderRadius: 9,
                    background: active ? '#FFFFFF' : 'transparent',
                    color: active ? '#0F172A' : '#64748B',
                    fontWeight: active ? 800 : 600,
                    fontSize: 11.5,
                    cursor: 'pointer',
                    boxShadow: active ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── 4. SAVED MOBILE MONEY ACCOUNTS ── */}
          {filteredAddresses.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '36px 16px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>No payment addresses found</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, marginBottom: 16 }}>
                Bind your MTN Mobile Money, Telecel Cash, or AT Money account for instant automated payouts.
              </div>
              <button
                onClick={() => handleOpenAddModal('MTN')}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Bind Mobile Money
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredAddresses.map((addr) => {
                const isCopied = copiedId === addr.id;

                const isMtn = addr.network === 'MTN';
                const isTelecel = addr.network === 'Telecel';

                return (
                  <div
                    key={addr.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 16,
                      padding: '16px',
                      border: addr.isDefault ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      boxShadow: addr.isDefault
                        ? '0 6px 18px rgba(37, 99, 235, 0.12)'
                        : '0 2px 6px rgba(0,0,0,0.02)',
                      position: 'relative',
                    }}
                  >
                    {/* Top Row: Network Icon + Badge + Default Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {isMtn ? (
                            <img
                              src="/images/partners/mtn-momo.png"
                              alt="MTN MoMo"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : isTelecel ? (
                            <img
                              src="/images/partners/telecel.png"
                              alt="Telecel Cash"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <AtMoneyLogo size={32} />
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                              {isMtn
                                ? 'MTN Mobile Money'
                                : isTelecel
                                ? 'Telecel Cash'
                                : 'AT Money (AirtelTigo)'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            {addr.accountName} {addr.remark ? `• ${addr.remark}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Default Badge */}
                      {addr.isDefault ? (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            padding: '3px 8px',
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <IonIcon icon={star} style={{ fontSize: 11, color: '#2563EB' }} />
                          <span>DEFAULT</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: 8,
                            padding: '4px 8px',
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: '#64748B',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <IonIcon icon={starOutline} style={{ fontSize: 12 }} />
                          <span>Set Default</span>
                        </button>
                      )}
                    </div>

                    {/* Middle: Phone Number with Copy Button */}
                    <div
                      style={{
                        background: '#F8FAFC',
                        borderRadius: 10,
                        padding: '10px 12px',
                        border: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 800,
                          letterSpacing: 0.5,
                          color: '#0F172A',
                        }}
                      >
                        {addr.accountNumber}
                      </div>

                      <button
                        onClick={() => handleCopy(addr.id, addr.accountNumber)}
                        style={{
                          background: isCopied ? '#D1FAE5' : '#FFFFFF',
                          border: isCopied ? '1px solid #10B981' : '1px solid #CBD5E1',
                          borderRadius: 8,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: isCopied ? '#059669' : '#334155',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <IonIcon icon={isCopied ? checkmarkCircle : copyOutline} style={{ fontSize: 13 }} />
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Bottom: Creation Time & Delete Action */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #F1F5F9',
                        paddingTop: 10,
                        fontSize: 11,
                        color: '#94A3B8',
                      }}
                    >
                      <span>
                        Bound on{' '}
                        {new Date(addr.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>

                      <button
                        onClick={() => handleDelete(addr.id, addr.accountName || addr.accountNumber)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <IonIcon icon={trashOutline} style={{ fontSize: 13 }} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 5. SECURITY GUARANTEE FOOTER ── */}
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 11,
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#059669', fontSize: 15 }} />
            <span>Bank-Grade Telecommunication Settlement Vault • VipEarner</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ADD MOBILE MONEY PAYMENT ADDRESS MODAL
        ══════════════════════════════════════════════════════ */}
        {showAddModal && (
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
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                width: '100%',
                borderRadius: '26px 26px 0 0',
                padding: '22px 18px 36px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                    Bind Mobile Money Account
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    Official Automated Payout Destination
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 18 }} />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#DC2626',
                    fontSize: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IonIcon icon={alertCircleOutline} style={{ fontSize: 16 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave}>
                {/* 1. Network Selector */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Select Mobile Money Network
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { id: 'MTN', label: 'MTN MoMo', color: '#EAB308', bg: '#FEF9C3' },
                      { id: 'Telecel', label: 'Telecel Cash', color: '#E11D48', bg: '#FFE4E6' },
                      { id: 'AirtelTigo', label: 'AT Money', color: '#003B99', bg: '#EFF6FF' },
                    ].map((net) => {
                      const isSelected = newNetwork === net.id;
                      return (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => setNewNetwork(net.id as any)}
                          style={{
                            padding: '10px 6px',
                            borderRadius: 10,
                            border: isSelected ? `2px solid ${net.color}` : '1px solid #CBD5E1',
                            background: isSelected ? net.bg : '#FFFFFF',
                            color: isSelected ? net.color : '#475569',
                            fontWeight: 800,
                            fontSize: 12,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {net.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mobile Money Phone Number */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Mobile Money Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder="e.g. 0244123456 or 0201234567"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 14,
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Must be a registered 10-digit Ghana mobile money number.
                  </div>
                </div>

                {/* 3. Registered SIM Account Name */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Registered SIM Account Name (Must match SIM registration)
                  </label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="e.g. KWAME MENSAH"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* 4. Optional Remark */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Remark / Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="e.g. Primary Payout / Main SIM"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* 5. Default Toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                    Set as Default Payout Destination
                  </span>
                  <input
                    type="checkbox"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                </div>

                {/* 6. Sensitive Acknowledgment Checkbox */}
                <div
                  style={{
                    background: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    id="confirmSens"
                    checked={confirmedSensitive}
                    onChange={(e) => setConfirmedSensitive(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#D97706', marginTop: 2, cursor: 'pointer' }}
                  />
                  <label htmlFor="confirmSens" style={{ fontSize: 11, color: '#92400E', lineHeight: 1.4, cursor: 'pointer' }}>
                    <strong>Sensitive Confirmation:</strong> I confirm this Mobile Money account is registered in my legal name and the digits are 100% accurate. I understand automated payouts cannot be reversed once processed.
                  </label>
                </div>

                {/* 7. Save Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Bind Mobile Money Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile bottom clearance spacer for fixed BottomNav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
