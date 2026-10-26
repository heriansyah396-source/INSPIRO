/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lambang Resmi Pemerintah Kabupaten Sidenreng Rappang
 * Perisai Segi Lima, Bintang Emas, Padi & Kapas, Badik Pusaka, dan Pita Bertuliskan KABUPATEN SIDENRENG RAPPANG
 */
export const DEFAULT_SIDRAP_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%230284c7"/>
      <stop offset="60%" stop-color="%230369a1"/>
      <stop offset="100%" stop-color="%2315803d"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fef08a"/>
      <stop offset="50%" stop-color="%23eab308"/>
      <stop offset="100%" stop-color="%23ca8a04"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Outer Pentagon Shield Border -->
  <polygon points="100,6 190,44 168,206 100,234 32,206 10,44" fill="%23d97706" stroke="%2378350f" stroke-width="2" filter="url(%23shadow)"/>
  <!-- Middle Gold Trim -->
  <polygon points="100,12 184,48 163,199 100,226 37,199 16,48" fill="url(%23goldGrad)"/>
  <!-- Inner Shield Body -->
  <polygon points="100,18 178,52 158,192 100,218 42,192 22,52" fill="url(%23shieldGrad)" stroke="%23ffffff" stroke-width="1.5"/>

  <!-- Golden 5-Pointed Star at Top -->
  <polygon points="100,26 105,40 120,40 108,49 112,63 100,54 88,63 92,49 80,40 95,40" fill="%23facc15" stroke="%23ca8a04" stroke-width="1"/>

  <!-- Rice Sprig (Left) -->
  <path d="M52,150 Q48,105 76,70 Q70,95 62,125 Q56,145 52,150 Z" fill="%23eab308"/>
  <circle cx="56" cy="138" r="4" fill="%23fde047"/>
  <circle cx="60" cy="122" r="4.5" fill="%23fde047"/>
  <circle cx="65" cy="106" r="4.5" fill="%23fde047"/>
  <circle cx="72" cy="90" r="4" fill="%23fde047"/>
  <circle cx="79" cy="76" r="3.5" fill="%23fde047"/>

  <!-- Cotton Sprig (Right) -->
  <path d="M148,150 Q152,105 124,70 Q130,95 138,125 Q144,145 148,150 Z" fill="%2316a34a"/>
  <circle cx="144" cy="138" r="5" fill="%23ffffff" stroke="%2315803d" stroke-width="1.5"/>
  <circle cx="140" cy="122" r="5" fill="%23ffffff" stroke="%2315803d" stroke-width="1.5"/>
  <circle cx="135" cy="106" r="5" fill="%23ffffff" stroke="%2315803d" stroke-width="1.5"/>
  <circle cx="128" cy="90" r="4.5" fill="%23ffffff" stroke="%2315803d" stroke-width="1.5"/>

  <!-- Traditional Bugis Badik / Keris in Center -->
  <g transform="translate(100,120)">
    <!-- Badik Blade -->
    <path d="M-4,-48 L4,-48 L5,20 L0,32 L-5,20 Z" fill="%23f1f5f9" stroke="%23475569" stroke-width="1.5"/>
    <!-- Blade Ridge -->
    <line x1="0" y1="-46" x2="0" y2="28" stroke="%2394a3b8" stroke-width="1"/>
    <!-- Handle (Hulu Badik) with gold wraps -->
    <path d="M-6,20 L6,20 L8,36 Q4,48 -10,44 Q-6,36 -6,20 Z" fill="%2392400e" stroke="%2378350f" stroke-width="1.5"/>
    <rect x="-6" y="20" width="12" height="4" fill="url(%23goldGrad)"/>
    <circle cx="-5" cy="38" r="3" fill="url(%23goldGrad)"/>
  </g>

  <!-- Golden Ribbon Banner at Bottom -->
  <g id="ribbon">
    <path d="M22,175 L45,168 L45,188 L22,196 Z" fill="%23b45309"/>
    <path d="M178,175 L155,168 L155,188 L178,196 Z" fill="%23b45309"/>
    <path d="M38,170 Q100,186 162,170 L158,194 Q100,210 42,194 Z" fill="url(%23goldGrad)" stroke="%2378350f" stroke-width="1.5"/>
    <text x="100" y="187" font-family="'Arial Black', Arial, sans-serif" font-size="7.5" font-weight="900" fill="%23451a03" text-anchor="middle" letter-spacing="0.5">
      KAB. SIDENRENG RAPPANG
    </text>
  </g>
</svg>`;

/**
 * Lambang Resmi Tut Wuri Handayani (Kementerian Pendidikan)
 */
export const DEFAULT_TUTWURI_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%231d4ed8"/>
      <stop offset="100%" stop-color="%231e3a8a"/>
    </linearGradient>
  </defs>
  <!-- Outer Pentagon Shield -->
  <polygon points="100,8 188,72 154,178 46,178 12,72" fill="url(%23blueGrad)" stroke="%23ffffff" stroke-width="3"/>
  <polygon points="100,15 180,74 148,170 52,170 20,74" fill="none" stroke="%23facc15" stroke-width="2.5"/>

  <!-- Tut Wuri Handayani Wings & Flame -->
  <!-- Blencong / Torch Flame in Center -->
  <path d="M100,42 Q108,58 100,74 Q92,58 100,42 Z" fill="%23ef4444"/>
  <path d="M100,48 Q105,60 100,70 Q95,60 100,48 Z" fill="%23facc15"/>

  <!-- Garuda Wings / Burung Handayani -->
  <path d="M100,70 Q130,55 160,82 Q135,92 100,82 Q65,92 40,82 Q70,55 100,70 Z" fill="%23ffffff"/>
  <path d="M100,82 Q125,72 150,96 Q128,104 100,94 Q72,104 50,96 Q75,72 100,82 Z" fill="%23ffffff"/>
  <path d="M100,94 Q120,88 140,110 Q120,116 100,106 Q80,116 60,110 Q80,88 100,94 Z" fill="%23ffffff"/>

  <!-- Open Book Base (Buku Terbuka) -->
  <path d="M100,108 Q125,116 148,112 L145,134 Q125,138 100,126 Q75,138 55,134 L52,112 Q75,116 100,108 Z" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1"/>
  <line x1="100" y1="108" x2="100" y2="126" stroke="%231e3a8a" stroke-width="2"/>

  <!-- Text Arc: TUT WURI HANDAYANI -->
  <text x="100" y="156" font-family="'Arial Black', Arial, sans-serif" font-size="9" font-weight="900" fill="%23facc15" text-anchor="middle" letter-spacing="1">
    TUT WURI HANDAYANI
  </text>
</svg>`;
