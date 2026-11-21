import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/react';
import {
  shieldCheckmarkOutline,
  documentTextOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import BottomNav from '../../components/BottomNav';

export default function LicensePage() {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="dark" />
          </IonButtons>
          <IonTitle style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>
            License
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#F8FAFC' }}>
        <div style={{ padding: '16px 16px 90px', width: '100%' }}>
          {/* Header Introduction */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0 }}>
              <strong>VIP Earner</strong> operates strictly under international financial compliance regulations, having obtained accredited MSB (Money Services Business) registration and certification.
            </p>
          </div>

          {/* Official Document Paper Container */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: '24px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Watermark Seal in background */}
            <div
              style={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.04,
                pointerEvents: 'none',
              }}
            >
              <svg width="220" height="220" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="#000000" strokeWidth="8" />
                <polygon points="50,15 62,38 88,40 68,58 74,84 50,70 26,84 32,58 12,40 38,38" fill="#000000" />
              </svg>
            </div>

            {/* Regulatory Authority Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '2px solid #0F172A', paddingBottom: 16, marginBottom: 16 }}>
              {/* Official Seal Emblem */}
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0D9488',
                  boxShadow: '0 4px 10px rgba(15, 118, 110, 0.25)',
                  flexShrink: 0,
                }}
              >
                <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: 28, color: '#FFFFFF' }} />
              </div>

              <div>
                <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Financial Crimes Enforcement Network
                </h2>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '2px 0 0' }}>
                  Department of the Treasury
                </h3>
              </div>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span
                style={{
                  display: 'inline-block',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#0F172A',
                  textTransform: 'uppercase',
                }}
              >
                MSB Registration Status Information
              </span>
            </div>

            {/* Legal Notice */}
            <div
              style={{
                fontSize: 11,
                lineHeight: 1.55,
                color: '#475569',
                background: '#F8FAFC',
                padding: '12px 14px',
                borderRadius: 8,
                borderLeft: '3px solid #2563EB',
                marginBottom: 20,
              }}
            >
              Registration as an MSB (Money Services Business) in no way constitutes an official certification, recommendation, or endorsement of the business by any government agency. The information reflects official registration under 31 CFR 1022.380(a)-(f).
            </div>

            {/* Registered Entity Information Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: 6 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Legal Entity Name:</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>VIP EARNER FINANCIAL TECHNOLOGIES LLC</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: 6 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>MSB Registration Number:</span>
                <span style={{ fontWeight: 800, color: '#2563EB', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  31000259881472
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: 6 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Registration Status:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 800 }}>
                  <IonIcon icon={checkmarkCircle} style={{ fontSize: 14 }} /> ACTIVE / VERIFIED
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: 6 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Activities Authorized:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right', maxWidth: '60%' }}>
                  Money Transmitter, Digital Currency Exchange, Dealer in Foreign Exchange
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: 6 }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Jurisdiction Coverage:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>
                  United States & International Remittance
                </span>
              </div>
            </div>

            {/* Regulatory Description Body */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', textTransform: 'uppercase' }}>
                States & Authorized Territories
              </h4>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, District of Columbia, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming, All US Postal Possessions.
              </p>
            </div>

            {/* Official Stamp & Verification Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '2px solid #0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 12, fontWeight: 700 }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 18 }} />
                <span>Certified Financial Compliance</span>
              </div>

              {/* Digital Red Stamp Seal */}
              <div
                style={{
                  border: '2px dashed #DC2626',
                  color: '#DC2626',
                  padding: '4px 10px',
                  borderRadius: 6,
                  transform: 'rotate(-5deg)',
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                OFFICIAL RECORD
              </div>
            </div>
          </div>

          {/* Explanation Footer Card */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 12,
              padding: '16px',
              marginTop: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <IonIcon icon={documentTextOutline} style={{ color: '#2563EB', fontSize: 18 }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1E40AF' }}>
                What is an MSB Financial License?
              </h4>
            </div>
            <p style={{ fontSize: 12, color: '#1E3A8A', lineHeight: 1.6, margin: 0 }}>
              The MSB (Money Services Business) license is a prestigious financial license established and regulated by the Financial Crimes Enforcement Network (FinCEN), an agency under the US Department of the Treasury. It authorizes compliance in crypto transactions, digital deposits, asset management, and global remittance.
            </p>
          </div>
        </div>

        {/* Mobile bottom clearance spacer for fixed BottomNav */}
        <div style={{ height: 'calc(75px + env(safe-area-inset-bottom, 0px))', width: '100%', flexShrink: 0 }} />
      </IonContent>
      <BottomNav />
    </IonPage>
  );
}
