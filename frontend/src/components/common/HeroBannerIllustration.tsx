export function HeroBannerIllustration({ type }: { type: 'newUser' | 'invite' | 'welfare' }) {
  if (type === 'newUser') {
    return (
      <svg width="150" height="110" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Isometric base tablet/platform */}
        <polygon points="75,65 135,80 75,98 15,80" fill="#E2E8F0" />
        <polygon points="15,80 75,98 75,102 15,84" fill="#CBD5E1" />
        <polygon points="135,80 75,98 75,102 135,84" fill="#94A3B8" />

        <polygon points="75,67 130,81 75,96 20,81" fill="#3B82F6" opacity="0.9" />

        {/* Hand reaching out holding gold coins / earnings */}
        <path d="M75 35 C75 30, 85 30, 85 38 L85 68 L65 68 L65 42 C65 35, 75 30, 75 35 Z" fill="#FDBA74" />
        <circle cx="75" cy="25" r="14" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
        <text x="75" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">₵</text>

        {/* Floating Credit Card */}
        <rect x="25" y="24" width="34" height="22" rx="3" transform="rotate(-15 25 24)" fill="#334155" />
        <rect x="23" y="30" width="34" height="5" transform="rotate(-15 25 24)" fill="#0F172A" />
        <rect x="29" y="38" width="8" height="4" rx="1" transform="rotate(-15 25 24)" fill="#F59E0B" />

        {/* Floating Bar Chart */}
        <rect x="105" y="35" width="6" height="16" rx="2" fill="#10B981" />
        <rect x="114" y="27" width="6" height="24" rx="2" fill="#3B82F6" />
        <rect x="123" y="20" width="6" height="31" rx="2" fill="#F59E0B" />

        {/* Floating sparkles and coins */}
        <circle cx="48" cy="18" r="4" fill="#FBBF24" />
        <circle cx="100" cy="16" r="3" fill="#60A5FA" />
        <circle cx="132" cy="62" r="5" fill="#F59E0B" />
        <circle cx="18" cy="68" r="4" fill="#34D399" />
      </svg>
    );
  }

  if (type === 'invite') {
    return (
      <svg width="150" height="110" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow */}
        <circle cx="95" cy="55" r="45" fill="#60A5FA" opacity="0.3" filter="blur(10px)" />

        {/* Giant Bitcoin / Token Coin */}
        <circle cx="100" cy="40" r="24" fill="#F59E0B" stroke="#FDE68A" strokeWidth="3" />
        <circle cx="100" cy="40" r="19" fill="#D97706" />
        <text x="100" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif">₿</text>

        {/* Stacks of gold coins */}
        <g transform="translate(68, 68)">
          <ellipse cx="20" cy="18" rx="18" ry="6" fill="#D97706" />
          <ellipse cx="20" cy="14" rx="18" ry="6" fill="#F59E0B" />
          <ellipse cx="20" cy="10" rx="18" ry="6" fill="#FBBF24" />
          <ellipse cx="20" cy="6" rx="18" ry="6" fill="#FEF08A" />

          <ellipse cx="50" cy="22" rx="16" ry="5" fill="#D97706" />
          <ellipse cx="50" cy="18" rx="16" ry="5" fill="#F59E0B" />
          <ellipse cx="50" cy="14" rx="16" ry="5" fill="#FBBF24" />
        </g>

        {/* Candlestick trading chart card */}
        <rect x="75" y="35" width="48" height="34" rx="6" fill="#FFFFFF" opacity="0.95" stroke="#BFDBFE" strokeWidth="1.5" />
        <line x1="86" y1="42" x2="86" y2="60" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="97" y1="38" x2="97" y2="64" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <line x1="108" y1="44" x2="108" y2="58" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // welfare blind box
  return (
    <svg width="150" height="110" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mystical portal / wheel glow */}
      <circle cx="105" cy="55" r="42" fill="#A855F7" opacity="0.4" filter="blur(8px)" />
      <circle cx="105" cy="55" r="34" stroke="#C084FC" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="105" cy="55" r="26" fill="#4C1D95" stroke="#E9D5FF" strokeWidth="2" />

      {/* Lucky Box in foreground */}
      <rect x="85" y="45" width="40" height="38" rx="6" fill="#EF4444" stroke="#FCA5A5" strokeWidth="2" />
      {/* Ribbon */}
      <rect x="101" y="45" width="8" height="38" fill="#FBBF24" />
      <rect x="85" y="59" width="40" height="8" fill="#FBBF24" />
      {/* Ribbon Bow */}
      <circle cx="98" cy="45" r="6" stroke="#F59E0B" strokeWidth="3" />
      <circle cx="112" cy="45" r="6" stroke="#F59E0B" strokeWidth="3" />

      {/* Golden Coins Bursting */}
      <circle cx="70" cy="35" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <text x="70" y="39" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="900">%</text>
      <circle cx="135" cy="38" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <text x="135" y="42" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="900">%</text>
      <circle cx="95" cy="20" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <text x="95" y="24" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="900">%</text>
    </svg>
  );
}

export default HeroBannerIllustration;
