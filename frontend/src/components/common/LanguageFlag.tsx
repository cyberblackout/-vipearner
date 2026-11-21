import React from 'react';

export interface LanguageFlagProps {
  language?: string; // 'English' | 'en' | 'Français' | 'Español' | '中文'
  size?: number; // width in pixels (height is 2/3 of width)
  style?: React.CSSProperties;
  className?: string;
}

export const EnglishFlagSvg: React.FC<{ size?: number; style?: React.CSSProperties; className?: string }> = ({
  size = 18,
  style,
  className,
}) => {
  const width = size;
  const height = Math.round((size * 2) / 3);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 36"
      className={className}
      style={{
        borderRadius: 3,
        display: 'inline-block',
        verticalAlign: 'middle',
        boxShadow: '0 0 1px rgba(0,0,0,0.3)',
        flexShrink: 0,
        ...style,
      }}
    >
      <rect width="60" height="36" rx="3" fill="#012169" />
      {/* Diagonals */}
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" strokeWidth="4" />
      {/* Central Cross */}
      <path d="M30,0 V36 M0,18 H60" stroke="#FFFFFF" strokeWidth="11" />
      <path d="M30,0 V36 M0,18 H60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  );
};

export const FrenchFlagSvg: React.FC<{ size?: number; style?: React.CSSProperties; className?: string }> = ({
  size = 18,
  style,
  className,
}) => {
  const width = size;
  const height = Math.round((size * 2) / 3);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 36"
      className={className}
      style={{
        borderRadius: 3,
        display: 'inline-block',
        verticalAlign: 'middle',
        boxShadow: '0 0 1px rgba(0,0,0,0.3)',
        flexShrink: 0,
        ...style,
      }}
    >
      <rect width="20" height="36" fill="#002395" />
      <rect x="20" width="20" height="36" fill="#FFFFFF" />
      <rect x="40" width="20" height="36" fill="#ED2939" />
    </svg>
  );
};

export const SpanishFlagSvg: React.FC<{ size?: number; style?: React.CSSProperties; className?: string }> = ({
  size = 18,
  style,
  className,
}) => {
  const width = size;
  const height = Math.round((size * 2) / 3);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 36"
      className={className}
      style={{
        borderRadius: 3,
        display: 'inline-block',
        verticalAlign: 'middle',
        boxShadow: '0 0 1px rgba(0,0,0,0.3)',
        flexShrink: 0,
        ...style,
      }}
    >
      <rect width="60" height="9" fill="#AA151B" />
      <rect y="9" width="60" height="18" fill="#F1BF00" />
      <rect y="27" width="60" height="9" fill="#AA151B" />
    </svg>
  );
};

export const ChineseFlagSvg: React.FC<{ size?: number; style?: React.CSSProperties; className?: string }> = ({
  size = 18,
  style,
  className,
}) => {
  const width = size;
  const height = Math.round((size * 2) / 3);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 36"
      className={className}
      style={{
        borderRadius: 3,
        display: 'inline-block',
        verticalAlign: 'middle',
        boxShadow: '0 0 1px rgba(0,0,0,0.3)',
        flexShrink: 0,
        ...style,
      }}
    >
      <rect width="60" height="36" fill="#DE2910" />
      <polygon points="10,5 12,11 17,11 13,14 15,20 10,16 5,20 7,14 3,11 8,11" fill="#FFDE00" />
    </svg>
  );
};

export default function LanguageFlag({
  language = 'English',
  size = 18,
  style,
  className,
}: LanguageFlagProps) {
  const langLower = (language || '').toLowerCase();

  if (langLower.includes('fr') || langLower.includes('fran')) {
    return <FrenchFlagSvg size={size} style={style} className={className} />;
  }
  if (langLower.includes('es') || langLower.includes('espa')) {
    return <SpanishFlagSvg size={size} style={style} className={className} />;
  }
  if (langLower.includes('zh') || langLower.includes('cn') || langLower.includes('中')) {
    return <ChineseFlagSvg size={size} style={style} className={className} />;
  }
  // Default to English Flag
  return <EnglishFlagSvg size={size} style={style} className={className} />;
}
