import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { IonFooter } from '@ionic/react';

/* 5 exact tabs from reference screenshots:
   1. Home: SVG House icon
   2. Welfare: SVG Gift/Ribbon box icon
   3. Investment: SVG Bar chart / growth graph icon
   4. Wallet: SVG Crypto wallet icon
   5. My account: SVG User / profile silhouette icon
*/

interface TabItem {
  path: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const TABS: TabItem[] = [
  {
    path: '/home',
    label: 'Home',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={active ? '#2563EB15' : 'none'} />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/welfare',
    label: 'Welfare',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" fill={active ? '#2563EB15' : 'none'} />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    path: '/vip',
    label: 'Investment',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
  {
    path: '/transactions',
    label: 'Wallet',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" fill={active ? '#2563EB15' : 'none'} />
        <path d="M16 12h4" />
        <circle cx="16" cy="12" r="1" fill={active ? '#2563EB' : '#94A3B8'} />
        <path d="M2 9h20" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'My Account',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={active ? '#2563EB15' : 'none'} />
        <circle cx="12" cy="7" r="4" fill={active ? '#2563EB' : 'none'} />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const history = useHistory();

  return (
    <IonFooter
      className="ion-no-border"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '100%',
        }}
      >
        {TABS.map((tab) => {
          const isSelected =
            location.pathname === tab.path ||
            (tab.path === '/welfare' &&
              (location.pathname === '/checkin' ||
                location.pathname === '/welfare' ||
                location.pathname === '/lucky-bag')) ||
            (tab.path === '/transactions' &&
              (location.pathname === '/deposit' || location.pathname === '/withdraw'));

          return (
            <button
              key={tab.path}
              onClick={() => history.push(tab.path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '4px 0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2px',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {tab.icon(isSelected)}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#2563EB' : '#94A3B8',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </IonFooter>
  );
}
