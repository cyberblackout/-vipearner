import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useAppNavigation } from '../services/navigation';

interface AppBackButtonProps {
  fallback?: string;
  color?: string;
  size?: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AppBackButton: React.FC<AppBackButtonProps> = ({
  fallback = '/home',
  color = '#0F172A',
  size = 22,
  label,
  className,
  style,
}) => {
  const { goBack } = useAppNavigation();

  return (
    <button
      type="button"
      onClick={() => goBack(fallback)}
      aria-label="Go to previous page"
      className={className}
      style={{
        background: 'none',
        border: 'none',
        outline: 'none',
        padding: '6px',
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color,
        borderRadius: '50%',
        transition: 'opacity 0.15s ease',
        ...style,
      }}
    >
      <IonIcon icon={arrowBackOutline} style={{ fontSize: size, color: 'inherit' }} />
      {label && (
        <span style={{ marginLeft: 6, fontSize: 14, fontWeight: 600, color: 'inherit' }}>
          {label}
        </span>
      )}
    </button>
  );
};

export default AppBackButton;
