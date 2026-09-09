import React from 'react';

// Hero Main Composition
export const HeroSportsComposition: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="heroRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E31B23" />
        <stop offset="100%" stopColor="#990B11" />
      </linearGradient>
      <linearGradient id="heroGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="heroWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D7A15C" />
        <stop offset="100%" stopColor="#9C662B" />
      </linearGradient>
      <linearGradient id="heroDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2A2D34" />
        <stop offset="100%" stopColor="#111318" />
      </linearGradient>
      <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#E31B23" floodOpacity="0.25" />
      </filter>
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>

    {/* Background Decorative Circles */}
    <circle cx="250" cy="200" r="180" fill="url(#heroRedGrad)" opacity="0.08" />
    <circle cx="250" cy="200" r="130" stroke="#E31B23" strokeWidth="2" strokeDasharray="6 6" opacity="0.2" />

    {/* Layer 1: Dumbbell (Back Left) */}
    <g transform="translate(60, 220) rotate(-25)">
      <rect x="0" y="30" width="120" height="12" rx="6" fill="#64748B" />
      <rect x="15" y="10" width="22" height="52" rx="4" fill="url(#heroDarkGrad)" />
      <rect x="25" y="16" width="12" height="40" rx="3" fill="#475569" />
      <rect x="83" y="10" width="22" height="52" rx="4" fill="url(#heroDarkGrad)" />
      <rect x="83" y="16" width="12" height="40" rx="3" fill="#475569" />
    </g>

    {/* Layer 2: Cricket Bat (Diagonal Center) */}
    <g transform="translate(200, 40) rotate(22)" filter="url(#shadowGlow)">
      {/* Handle */}
      <rect x="42" y="0" width="16" height="110" rx="8" fill="#1E293B" />
      <rect x="44" y="0" width="12" height="108" rx="6" fill="#E31B23" />
      <path d="M44 20 L56 20 M44 40 L56 40 M44 60 L56 60 M44 80 L56 80" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
      {/* Blade */}
      <path d="M28 105 L72 105 L66 290 Q50 310 34 290 Z" fill="url(#heroWoodGrad)" stroke="#784415" strokeWidth="2" />
      {/* Red Spine Overlay */}
      <path d="M40 110 L60 110 L56 280 L44 280 Z" fill="#E31B23" opacity="0.85" />
      <text x="50" y="190" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle" transform="rotate(-90 50 190)">RONIX PRO</text>
    </g>

    {/* Layer 3: Football (Bottom Right) */}
    <g transform="translate(300, 210)" filter="url(#cardShadow)">
      <circle cx="65" cy="65" r="60" fill="#F8FAFC" stroke="#0F172A" strokeWidth="4" />
      <polygon points="65,30 85,45 78,70 52,70 45,45" fill="#0F172A" />
      <polygon points="65,30 45,45 20,38 18,15 42,10" fill="#E31B23" />
      <polygon points="85,45 110,38 112,15 88,10 65,30" fill="#0F172A" />
      <polygon points="78,70 95,92 118,80 122,55 110,38" fill="#E31B23" />
      <polygon points="52,70 35,92 12,80 8,55 20,38" fill="#0F172A" />
      <polygon points="52,70 78,70 65,95 45,115 35,92" fill="#E31B23" />
    </g>

    {/* Layer 4: Badminton Racket (Left Front) */}
    <g transform="translate(70, 70) rotate(-35)" filter="url(#cardShadow)">
      <ellipse cx="60" cy="70" rx="45" ry="58" fill="none" stroke="#E31B23" strokeWidth="5" />
      <ellipse cx="60" cy="70" rx="42" ry="55" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M30 70 H90 M20 50 H100 M20 90 H100 M40 25 V115 M60 15 V125 M80 25 V115" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
      <rect x="57" y="125" width="6" height="110" fill="#0F172A" />
      <rect x="54" y="225" width="12" height="50" rx="4" fill="#E31B23" />
    </g>

    {/* Layer 5: Red Leather Cricket Ball */}
    <g transform="translate(210, 270)" filter="url(#cardShadow)">
      <circle cx="35" cy="35" r="30" fill="url(#heroRedGrad)" stroke="#7F1D1D" strokeWidth="2" />
      <path d="M12 35 C 22 20, 48 20, 58 35" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 3" />
      <path d="M12 35 C 22 50, 48 50, 58 35" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 3" />
    </g>

    <g transform="translate(130, 290)" filter="url(#cardShadow)">
      <circle cx="22" cy="22" r="20" fill="#CCFF00" stroke="#84CC16" strokeWidth="2" />
      <path d="M6 22 Q 22 10, 38 22" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M6 22 Q 22 34, 38 22" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    </g>

    {/* Floating Badges */}
    <g transform="translate(360, 70)">
      <rect x="0" y="0" width="110" height="36" rx="18" fill="#FFFFFF" filter="url(#cardShadow)" />
      <circle cx="18" cy="18" r="10" fill="#E31B23" />
      <text x="18" y="22" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">✓</text>
      <text x="36" y="22" fill="#0F172A" fontSize="11" fontWeight="800">100% GENUINE</text>
    </g>
  </svg>
);

// Slide 1: Cricket Season SVG
export const CricketSlideSVG: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="crickWood" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E5B880" />
        <stop offset="100%" stopColor="#A86F32" />
      </linearGradient>
      <linearGradient id="crickRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>

    <circle cx="225" cy="175" r="140" fill="#FEF2F2" />
    <circle cx="225" cy="175" r="110" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="8 8" />

    {/* Bat */}
    <g transform="translate(130, 30) rotate(28)">
      <rect x="35" y="0" width="14" height="90" rx="7" fill="#1E293B" />
      <rect x="37" y="0" width="10" height="88" rx="5" fill="#E31B23" />
      <path d="M22 85 L62 85 L56 240 Q42 255 28 240 Z" fill="url(#crickWood)" stroke="#78350F" strokeWidth="2" />
      <rect x="32" y="90" width="20" height="140" fill="#E31B23" opacity="0.9" />
      <text x="42" y="160" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle" transform="rotate(-90 42 160)">RONIX CRICKET</text>
    </g>

    {/* Helmet */}
    <g transform="translate(240, 110)">
      <path d="M10 60 C 10 20, 80 20, 80 60 L 80 80 L 10 80 Z" fill="#0F172A" />
      <path d="M15 60 C 15 30, 75 30, 75 60 L 75 75 L 15 75 Z" fill="#1E293B" />
      <path d="M10 65 L85 65" stroke="#E31B23" strokeWidth="4" />
      <path d="M20 75 L80 75 M25 85 L75 85 M30 95 L70 95" stroke="#94A3B8" strokeWidth="3" />
    </g>

    {/* Leather Ball */}
    <g transform="translate(170, 210)">
      <circle cx="35" cy="35" r="30" fill="url(#crickRed)" stroke="#7F1D1D" strokeWidth="2" />
      <path d="M10 35 C 20 20, 50 20, 60 35" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 3" />
    </g>

    {/* Gloves */}
    <g transform="translate(70, 160) rotate(-15)">
      <rect x="0" y="0" width="60" height="75" rx="15" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" />
      <rect x="5" y="10" width="50" height="20" rx="5" fill="#E31B23" />
      <rect x="8" y="35" width="12" height="30" rx="6" fill="#0F172A" />
      <rect x="24" y="35" width="12" height="30" rx="6" fill="#0F172A" />
      <rect x="40" y="35" width="12" height="30" rx="6" fill="#0F172A" />
    </g>
  </svg>
);

// Slide 2: Football Essentials SVG
export const FootballSlideSVG: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="225" cy="175" r="140" fill="#F0FDF4" />
    <circle cx="225" cy="175" r="110" stroke="#86EFAC" strokeWidth="2" strokeDasharray="8 8" />

    {/* Pro Football */}
    <g transform="translate(145, 70)">
      <circle cx="80" cy="80" r="75" fill="#FFFFFF" stroke="#0F172A" strokeWidth="5" />
      <polygon points="80,40 105,58 96,88 64,88 55,58" fill="#0F172A" />
      <polygon points="80,40 55,58 25,50 22,20 52,15" fill="#E31B23" />
      <polygon points="105,58 135,50 138,20 108,15 80,40" fill="#0F172A" />
      <polygon points="96,88 118,115 145,100 148,70 135,50" fill="#E31B23" />
      <polygon points="64,88 42,115 15,100 12,70 25,50" fill="#0F172A" />
      <polygon points="64,88 96,88 80,118 55,142 42,115" fill="#E31B23" />
    </g>

    {/* Turf Shoes */}
    <g transform="translate(50, 180) rotate(-10)">
      <path d="M10 50 C 30 10, 110 10, 140 40 L 135 65 L 10 65 Z" fill="#0F172A" />
      <path d="M20 40 L 130 40" fill="none" stroke="#E31B23" strokeWidth="6" />
      <rect x="25" y="65" width="12" height="10" fill="#E31B23" />
      <rect x="55" y="65" width="12" height="10" fill="#E31B23" />
      <rect x="85" y="65" width="12" height="10" fill="#E31B23" />
      <rect x="115" y="65" width="12" height="10" fill="#E31B23" />
    </g>

    {/* Agility Cones */}
    <g transform="translate(310, 190)">
      <polygon points="35,10 5,60 65,60" fill="#F97316" />
      <rect x="0" y="60" width="70" height="8" rx="4" fill="#EA580C" />
    </g>
  </svg>
);

// Slide 3: Fitness & Training SVG
export const FitnessSlideSVG: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="225" cy="175" r="140" fill="#EFF6FF" />
    <circle cx="225" cy="175" r="110" stroke="#93C5FD" strokeWidth="2" strokeDasharray="8 8" />

    {/* Hex Dumbbells */}
    <g transform="translate(100, 110) rotate(-20)">
      <rect x="0" y="35" width="160" height="16" rx="8" fill="#475569" />
      <path d="M20 10 L 45 10 L 55 43 L 45 76 L 20 76 L 10 43 Z" fill="#0F172A" />
      <path d="M25 15 L 40 15 L 48 43 L 40 71 L 25 71 L 17 43 Z" fill="#1E293B" />
      <path d="M115 10 L 140 10 L 150 43 L 140 76 L 115 76 L 105 43 Z" fill="#0F172A" />
      <path d="M120 15 L 135 15 L 143 43 L 135 71 L 120 71 L 112 43 Z" fill="#1E293B" />
    </g>

    {/* Kettlebell */}
    <g transform="translate(260, 130)">
      <path d="M25 40 Q 50 5, 75 40" fill="none" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" />
      <circle cx="50" cy="75" r="45" fill="#E31B23" />
      <circle cx="50" cy="75" r="35" fill="#B5121B" />
      <text x="50" y="80" fill="#FFFFFF" fontSize="14" fontWeight="900" textAnchor="middle">12 KG</text>
    </g>

    {/* Rolled Mat */}
    <g transform="translate(80, 230) rotate(-5)">
      <rect x="0" y="0" width="220" height="35" rx="10" fill="#3B82F6" />
      <ellipse cx="220" cy="17.5" rx="10" ry="17.5" fill="#1D4ED8" />
      <path d="M0 0 C 40 5, 180 5, 220 0" stroke="#60A5FA" strokeWidth="3" fill="none" />
    </g>
  </svg>
);

// CATEGORY SVGs
export const CricketCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <g transform="rotate(30 50 50)">
      <rect x="44" y="5" width="12" height="30" rx="4" fill="#0F172A" />
      <path d="M36 35 L64 35 L58 90 Q50 95 42 90 Z" fill="#D7A15C" stroke="#784415" strokeWidth="1.5" />
      <rect x="42" y="38" width="16" height="48" fill="#E31B23" />
    </g>
    <circle cx="75" cy="75" r="14" fill="#E31B23" stroke="#7F1D1D" strokeWidth="1.5" />
    <path d="M64 75 C 69 68, 81 68, 86 75" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

export const FootballCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <circle cx="50" cy="50" r="42" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
    <polygon points="50,26 64,36 59,53 41,53 36,36" fill="#0F172A" />
    <polygon points="50,26 36,36 18,30 16,12 36,8" fill="#E31B23" />
    <polygon points="64,36 82,30 84,12 64,8 50,26" fill="#0F172A" />
    <polygon points="59,53 72,70 90,60 92,42 82,30" fill="#E31B23" />
    <polygon points="41,53 28,70 10,60 8,42 18,30" fill="#0F172A" />
  </svg>
);

export const BadmintonCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <ellipse cx="40" cy="40" rx="28" ry="34" fill="none" stroke="#E31B23" strokeWidth="3.5" transform="rotate(-30 40 40)" />
    <path d="M25 40 H55 M20 30 H60 M20 50 H60 M40 15 V65 M30 20 V60 M50 20 V60" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" transform="rotate(-30 40 40)" />
    <rect x="58" y="60" width="4" height="32" fill="#0F172A" transform="rotate(30 58 60)" />
    <g transform="translate(65, 20)">
      <polygon points="15,5 5,30 25,30" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
      <ellipse cx="15" cy="30" rx="10" ry="5" fill="#E31B23" />
    </g>
  </svg>
);

export const TableTennisCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <circle cx="45" cy="42" r="32" fill="#E31B23" stroke="#990B11" strokeWidth="2" />
    <rect x="40" y="70" width="10" height="25" rx="3" fill="#D7A15C" stroke="#784415" strokeWidth="1.5" />
    <circle cx="78" cy="30" r="10" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
  </svg>
);

export const VolleyballCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <circle cx="50" cy="50" r="42" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
    <path d="M12 40 Q 50 30, 88 40 M12 60 Q 50 70, 88 60 M50 8 V92" stroke="#FFFFFF" strokeWidth="4" />
    <path d="M30 18 Q 50 50, 30 82 M70 18 Q 50 50, 70 82" stroke="#FFD700" strokeWidth="3" />
  </svg>
);

export const BasketballCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <circle cx="50" cy="50" r="42" fill="#EA580C" stroke="#C2410C" strokeWidth="3" />
    <path d="M8 50 H92 M50 8 V92 M18 20 C 45 40, 45 60, 18 80 M82 20 C 55 40, 55 60, 82 80" stroke="#0F172A" strokeWidth="3.5" />
  </svg>
);

export const FitnessCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <g transform="rotate(-30 50 50)">
      <rect x="15" y="44" width="70" height="12" rx="6" fill="#64748B" />
      <rect x="22" y="24" width="16" height="52" rx="4" fill="#0F172A" />
      <rect x="62" y="24" width="16" height="52" rx="4" fill="#0F172A" />
      <rect x="30" y="28" width="8" height="44" rx="2" fill="#E31B23" />
      <rect x="62" y="28" width="8" height="44" rx="2" fill="#E31B23" />
    </g>
  </svg>
);

export const SportswearCategorySVG = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <path d="M25 25 L 10 40 L 25 50 L 25 85 L 75 85 L 75 50 L 90 40 L 75 25 Q 50 35 25 25 Z" fill="#E31B23" stroke="#990B11" strokeWidth="2" />
    <path d="M40 25 Q 50 35 60 25" fill="none" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M25 50 L 75 50" stroke="#0F172A" strokeWidth="2" strokeDasharray="3 3" />
  </svg>
);

// PROMO TILE SVGs
export const CricketKitPromoSVG = () => (
  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full">
    <rect x="10" y="20" width="140" height="80" rx="12" fill="#FEF2F2" />
    <g transform="translate(25, 25)">
      <rect x="15" y="0" width="8" height="60" rx="3" fill="#D7A15C" />
      <rect x="15" y="20" width="8" height="40" fill="#E31B23" />
      <circle cx="45" cy="40" r="14" fill="#E31B23" />
      <rect x="65" y="10" width="30" height="45" rx="8" fill="#0F172A" />
    </g>
  </svg>
);

export const FootballPromoSVG = () => (
  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full">
    <rect x="10" y="20" width="140" height="80" rx="12" fill="#F0FDF4" />
    <g transform="translate(45, 25)">
      <circle cx="35" cy="35" r="30" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
      <polygon points="35,20 45,26 42,37 28,37 25,26" fill="#E31B23" />
      <polygon points="75,20 60,50 90,50" fill="#EA580C" />
    </g>
  </svg>
);

export const FitnessPromoSVG = () => (
  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full">
    <rect x="10" y="20" width="140" height="80" rx="12" fill="#EFF6FF" />
    <g transform="translate(35, 30)">
      <rect x="0" y="20" width="65" height="8" rx="4" fill="#64748B" />
      <rect x="10" y="6" width="10" height="36" rx="3" fill="#0F172A" />
      <rect x="45" y="6" width="10" height="36" rx="3" fill="#0F172A" />
      <circle cx="75" cy="24" r="18" fill="#E31B23" />
    </g>
  </svg>
);

// DYNAMIC PRODUCT TYPE SPECIFIC SVG COMPONENT
export const SpecificProductSVG: React.FC<{ category: string; productType?: string; name: string; className?: string }> = ({
  category,
  productType = '',
  name,
  className = "w-full h-full object-contain"
}) => {
  const catLower = category.toLowerCase();
  const typeLower = productType.toLowerCase();
  const nameLower = name.toLowerCase();

  // Cricket Bat
  if (catLower.includes('bat') || typeLower.includes('bat') || nameLower.includes('bat')) {
    if (typeLower.includes('kashmir') || nameLower.includes('kashmir')) {
      return (
        <svg viewBox="0 0 200 200" fill="none" className={className}>
          <rect width="200" height="200" rx="16" fill="#FAF5EF" />
          <g transform="translate(60, 20) rotate(20)">
            <rect x="36" y="0" width="10" height="55" rx="5" fill="#1E293B" />
            <rect x="38" y="0" width="6" height="55" rx="3" fill="#E31B23" />
            <path d="M26 55 L56 55 L52 160 Q41 170 30 160 Z" fill="#D7A15C" stroke="#784415" strokeWidth="1.5" />
            <path d="M33 60 L49 60 L46 155 L36 155 Z" fill="#E31B23" opacity="0.8" />
            <text x="41" y="110" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" transform="rotate(-90 41 110)">KASHMIR WILLOW</text>
          </g>
        </svg>
      );
    }
    if (typeLower.includes('plastic') || nameLower.includes('plastic')) {
      return (
        <svg viewBox="0 0 200 200" fill="none" className={className}>
          <rect width="200" height="200" rx="16" fill="#EFF6FF" />
          <g transform="translate(60, 20) rotate(20)">
            <rect x="36" y="0" width="10" height="55" rx="5" fill="#0F172A" />
            <path d="M26 55 L56 55 L52 160 Q41 170 30 160 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
            <path d="M33 60 L49 60 L46 155 L36 155 Z" fill="#FFD700" opacity="0.9" />
          </g>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 200 200" fill="none" className={className}>
        <rect width="200" height="200" rx="16" fill="#FEF2F2" />
        <g transform="translate(60, 15) rotate(20)">
          <rect x="36" y="0" width="10" height="55" rx="5" fill="#0F172A" />
          <rect x="38" y="0" width="6" height="55" rx="3" fill="#E31B23" />
          <path d="M26 55 L56 55 L52 165 Q41 175 30 165 Z" fill="#E5B880" stroke="#78350F" strokeWidth="1.5" />
          <path d="M32 58 L50 58 L46 160 L36 160 Z" fill="#E31B23" opacity="0.95" />
          <text x="41" y="110" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" transform="rotate(-90 41 110)">ENGLISH WILLOW</text>
        </g>
      </svg>
    );
  }

  // Cricket / Tennis Balls
  if (catLower.includes('ball') || typeLower.includes('ball') || nameLower.includes('ball')) {
    if (nameLower.includes('tennis') || typeLower.includes('tennis')) {
      return (
        <svg viewBox="0 0 200 200" fill="none" className={className}>
          <rect width="200" height="200" rx="16" fill="#F7FEE7" />
          <circle cx="100" cy="100" r="55" fill="#CCFF00" stroke="#84CC16" strokeWidth="4" />
          <path d="M55 100 Q 100 70, 145 100" fill="none" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M55 100 Q 100 130, 145 100" fill="none" stroke="#FFFFFF" strokeWidth="5" />
        </svg>
      );
    }
    if (nameLower.includes('white') || typeLower.includes('white')) {
      return (
        <svg viewBox="0 0 200 200" fill="none" className={className}>
          <rect width="200" height="200" rx="16" fill="#F8FAFC" />
          <circle cx="100" cy="100" r="55" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="4" />
          <path d="M55 100 C 75 75, 125 75, 145 100" fill="none" stroke="#E31B23" strokeWidth="4" strokeDasharray="3 3" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 200 200" fill="none" className={className}>
        <rect width="200" height="200" rx="16" fill="#FEF2F2" />
        <circle cx="100" cy="100" r="55" fill="#E31B23" stroke="#990B11" strokeWidth="4" />
        <path d="M55 100 C 75 75, 125 75, 145 100" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="3 3" />
        <path d="M55 100 C 75 125, 125 125, 145 100" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="3 3" />
      </svg>
    );
  }

  // Football
  if (catLower.includes('football') || typeLower.includes('football')) {
    return (
      <svg viewBox="0 0 200 200" fill="none" className={className}>
        <rect width="200" height="200" rx="16" fill="#F0FDF4" />
        <circle cx="100" cy="100" r="60" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
        <polygon points="100,70 120,84 112,106 88,106 80,84" fill="#0F172A" />
        <polygon points="100,70 80,84 55,75 50,50 80,45" fill="#E31B23" />
        <polygon points="120,84 145,75 150,50 120,45 100,70" fill="#0F172A" />
      </svg>
    );
  }

  // Badminton / Rackets
  if (catLower.includes('badminton') || typeLower.includes('racket') || nameLower.includes('racket')) {
    return (
      <svg viewBox="0 0 200 200" fill="none" className={className}>
        <rect width="200" height="200" rx="16" fill="#EFF6FF" />
        <g transform="translate(30, 20)">
          <ellipse cx="65" cy="65" rx="42" ry="50" fill="none" stroke="#E31B23" strokeWidth="4" />
          <path d="M35 65 H95 M25 50 H105 M25 80 H105 M65 25 V105 M50 30 V100 M80 30 V100" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
          <rect x="62" y="115" width="6" height="55" fill="#0F172A" />
        </g>
      </svg>
    );
  }

  // Fitness / Dumbbells
  if (catLower.includes('fitness') || catLower.includes('gym') || typeLower.includes('dumbbell') || nameLower.includes('dumbbell')) {
    return (
      <svg viewBox="0 0 200 200" fill="none" className={className}>
        <rect width="200" height="200" rx="16" fill="#F8FAFC" />
        <g transform="translate(35, 70) rotate(-20)">
          <rect x="0" y="25" width="130" height="12" rx="6" fill="#64748B" />
          <rect x="15" y="5" width="18" height="52" rx="4" fill="#0F172A" />
          <rect x="97" y="5" width="18" height="52" rx="4" fill="#0F172A" />
          <rect x="23" y="10" width="8" height="42" rx="2" fill="#E31B23" />
          <rect x="99" y="10" width="8" height="42" rx="2" fill="#E31B23" />
        </g>
      </svg>
    );
  }

  // Default Fallback
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <rect width="200" height="200" rx="16" fill="#FEF2F2" />
      <g transform="translate(50, 50)">
        <rect x="20" y="20" width="60" height="60" rx="12" fill="#E31B23" />
        <circle cx="50" cy="50" r="18" fill="#FFFFFF" />
        <path d="M40 50 L60 50 M50 40 L50 60" stroke="#E31B23" strokeWidth="3" />
      </g>
    </svg>
  );
};
