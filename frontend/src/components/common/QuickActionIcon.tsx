export function QuickActionIcon({ name }: { name: string }) {
  if (name === 'Deposit') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.35))' }}>
        <defs>
          <linearGradient id="depBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="depGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="goldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* 3D Glass / Gloss Sphere */}
        <circle cx="50" cy="50" r="46" fill="url(#depBg)" />
        {/* Top glossy gleam */}
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#depGleam)" />

        {/* Downward Arrow Stem */}
        <rect x="44" y="24" width="12" height="30" rx="4" fill="#FFFFFF" />
        {/* 3D Arrowhead */}
        <polygon points="50,68 30,48 70,48" fill="#FFFFFF" />

        {/* Gold Token Base */}
        <ellipse cx="50" cy="76" rx="20" ry="7" fill="url(#goldCoin)" />
        <ellipse cx="50" cy="74" rx="19" ry="5.5" fill="#FDE68A" />
      </svg>
    );
  }

  if (name === 'Withdraw') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.35))' }}>
        <defs>
          <linearGradient id="wthBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="wthGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 3D Glass / Gloss Sphere */}
        <circle cx="50" cy="50" r="46" fill="url(#wthBg)" />
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#wthGleam)" />

        {/* Upward Arrow Stem */}
        <rect x="44" y="44" width="12" height="30" rx="4" fill="#FFFFFF" />
        {/* 3D Arrowhead */}
        <polygon points="50,28 30,48 70,48" fill="#FFFFFF" />

        {/* Floating Money / Cash Tray */}
        <rect x="30" y="74" width="40" height="7" rx="3.5" fill="#D1FAE5" />
      </svg>
    );
  }

  if (name === 'Message') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.35))' }}>
        <defs>
          <linearGradient id="msgBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="bubbleGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 3D Sphere */}
        <circle cx="50" cy="50" r="46" fill="url(#msgBg)" />
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#bubbleGleam)" />

        {/* 3D Speech Bubble */}
        <rect x="24" y="28" width="52" height="36" rx="14" fill="#FFFFFF" />
        <polygon points="40,64 32,74 54,64" fill="#FFFFFF" />

        {/* 3 Colorful Glow Chat Dots */}
        <circle cx="38" cy="46" r="4" fill="#3B82F6" />
        <circle cx="50" cy="46" r="4" fill="#10B981" />
        <circle cx="62" cy="46" r="4" fill="#F59E0B" />
      </svg>
    );
  }

  if (name === 'License') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.35))' }}>
        <defs>
          <linearGradient id="licBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="licGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 3D Sphere */}
        <circle cx="50" cy="50" r="46" fill="url(#licBg)" />
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#licGleam)" />

        {/* Certificate Scroll Paper */}
        <rect x="28" y="24" width="44" height="52" rx="6" fill="#FFFFFF" />
        {/* Certificate Ribbon */}
        <line x1="36" y1="34" x2="64" y2="34" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
        <line x1="36" y1="42" x2="56" y2="42" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
        <line x1="36" y1="50" x2="64" y2="50" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Gold Ribbon Badge */}
        <circle cx="50" cy="62" r="8" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1.5" />
        <polygon points="50,58 52,62 56,63 53,65 54,69 50,67 46,69 47,65 44,63 48,62" fill="#FFFFFF" />
      </svg>
    );
  }

  if (name === 'FAQ') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.35))' }}>
        <defs>
          <linearGradient id="faqBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="faqGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#faqBg)" />
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#faqGleam)" />

        {/* 3D Question Mark Bubble */}
        <circle cx="50" cy="50" r="24" fill="#FFFFFF" />
        <text x="50" y="58" textAnchor="middle" fill="#2563EB" fontSize="26" fontWeight="900" fontFamily="sans-serif">
          ?
        </text>
      </svg>
    );
  }

  if (name === 'Invite Friends') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(236, 72, 153, 0.35))' }}>
        <defs>
          <linearGradient id="invBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="50%" stopColor="#DB2777" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="invGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCE7F3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#DB2777" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#invBg)" />
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#invGleam)" />

        {/* Users Avatars */}
        <circle cx="44" cy="38" r="12" fill="#FFFFFF" />
        <path d="M22 68 C22 56 32 52 44 52 C56 52 66 56 66 68 Z" fill="#FFFFFF" />

        {/* Plus Badge with Gold Glow */}
        <circle cx="68" cy="42" r="10" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M68 37 L68 47 M63 42 L73 42" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'Download App') {
    return (
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.35))' }}>
        <defs>
          <linearGradient id="dlBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="dlGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#dlBg)" />
        <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#dlGleam)" />

        {/* Smartphone Screen with Download Arrow */}
        <rect x="34" y="22" width="32" height="56" rx="6" fill="#FFFFFF" />
        <rect x="37" y="27" width="26" height="40" rx="3" fill="#EEF2FF" />

        {/* Arrow Down */}
        <path d="M50 36 L50 54 M43 47 L50 54 L57 47" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="73" r="2" fill="#4F46E5" />
      </svg>
    );
  }

  // Customer Support
  return (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 4px 8px rgba(20, 184, 166, 0.35))' }}>
      <defs>
        <linearGradient id="csBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="csGleam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="46" fill="url(#csBg)" />
      <ellipse cx="50" cy="24" rx="28" ry="12" fill="url(#csGleam)" />

      {/* Headset support specialist */}
      <circle cx="50" cy="42" r="13" fill="#FFFFFF" />
      <path d="M28 72 C28 58 38 55 50 55 C62 55 72 58 72 72 Z" fill="#FFFFFF" />

      {/* Modern Headset */}
      <path d="M30 44 C30 28 70 28 70 44" stroke="#FDE047" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <rect x="25" y="40" width="7" height="13" rx="3.5" fill="#FDE047" />
      <rect x="68" y="40" width="7" height="13" rx="3.5" fill="#FDE047" />
      <path d="M70 51 C70 60 60 62 55 62" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default QuickActionIcon;
