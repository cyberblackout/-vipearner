export function VipEarnerLogo({ size = 28, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, userSelect: 'none' }}>
      <img
        src="/icon-192.png"
        alt="VIP Earner Logo"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'contain',
          flexShrink: 0,
          display: 'block',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        }}
      />

      {showText && (
        <span
          style={{
            fontSize: Math.round(size * 0.78),
            fontWeight: 900,
            color: '#1E3A8A',
            letterSpacing: '-0.03em',
            fontStyle: 'italic',
            display: 'inline-flex',
            alignItems: 'baseline',
          }}
        >
          vipearner<span style={{ color: '#2563EB', fontSize: Math.round(size * 0.55), fontStyle: 'normal', fontWeight: 800 }}>.com</span>
        </span>
      )}
    </div>
  );
}

export default VipEarnerLogo;
