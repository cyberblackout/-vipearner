import React, { useState } from 'react';

export const COIN_LOGOS: Record<string, string> = {
  TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
};

// Distinctive brand background colors for fallback
export const COIN_COLORS: Record<string, string> = {
  TRX: '#EF0027',
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  USDC: '#2775CA',
  SOL: '#9945FF',
  BNB: '#F3BA2F',
  DOGE: '#C2A633',
  XRP: '#23292F',
  LTC: '#345D9D',
  ADA: '#0033AD',
  MATIC: '#8247E5',
};

export interface CryptoCoinIconProps {
  coin: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CryptoCoinIcon: React.FC<CryptoCoinIconProps> = ({
  coin,
  size = 38,
  className,
  style,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const symbol = (coin || '').toUpperCase();
  const imageUrl = COIN_LOGOS[symbol];
  const bgColor = COIN_COLORS[symbol] || '#2563EB';

  if (imageUrl && !loadFailed) {
    return (
      <img
        src={imageUrl}
        alt={symbol}
        width={size}
        height={size}
        className={className}
        onError={() => setLoadFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
          background: '#FFFFFF',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          ...style,
        }}
      />
    );
  }

  // Fallback vector SVG
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bgColor,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: Math.round(size * 0.44),
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        flexShrink: 0,
        ...style,
      }}
    >
      {symbol === 'TRX' && (
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 32 32" fill="none">
          <path d="M4 6.5L28 9.5L16 27L4 6.5Z" fill="#FFFFFF" fillOpacity="0.2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M4 6.5L16 17.5M28 9.5L16 17.5M16 17.5V27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {symbol === 'BTC' && <span style={{ fontSize: Math.round(size * 0.5), fontWeight: 900, lineHeight: 1 }}>₿</span>}
      {symbol === 'ETH' && (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 32 32" fill="none">
          <path d="M16 3L7 16.5L16 21.5L25 16.5L16 3Z" fill="#FFFFFF" fillOpacity="0.85" />
          <path d="M16 23.5L7 18.5L16 29L25 18.5L16 23.5Z" fill="#FFFFFF" fillOpacity="0.95" />
        </svg>
      )}
      {symbol === 'USDT' && <span style={{ fontSize: Math.round(size * 0.5), fontWeight: 900, lineHeight: 1 }}>₮</span>}
      {symbol === 'USDC' && <span style={{ fontSize: Math.round(size * 0.5), fontWeight: 900, lineHeight: 1 }}>$</span>}
      {symbol === 'BNB' && '❖'}
      {symbol === 'SOL' && '◎'}
      {symbol === 'DOGE' && 'Ð'}
      {symbol === 'XRP' && '✕'}
      {symbol === 'LTC' && 'Ł'}
      {symbol === 'ADA' && '₳'}
      {symbol === 'MATIC' && '⬡'}
      {!['TRX', 'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'DOGE', 'XRP', 'LTC', 'ADA', 'MATIC'].includes(symbol) && symbol.slice(0, 3)}
    </div>
  );
};

export default CryptoCoinIcon;
