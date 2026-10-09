import React from 'react';

// Pink Chibi Monster with big eyes & cute horns
export function PinkChibiMonster({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} animate-wiggle inline-block`}>
      {/* Cute Horns */}
      <path d="M 25 30 Q 15 10 30 20 Z" fill="#FFAB00" stroke="#B85C00" strokeWidth="3" />
      <path d="M 75 30 Q 85 10 70 20 Z" fill="#FFAB00" stroke="#B85C00" strokeWidth="3" />
      {/* Monster Body */}
      <ellipse cx="50" cy="55" rx="36" ry="32" fill="#FF2E93" stroke="#C60064" strokeWidth="4" />
      {/* Belly Patch */}
      <ellipse cx="50" cy="62" rx="20" ry="16" fill="#FF94C7" />
      {/* Eyes */}
      <circle cx="38" cy="45" r="9" fill="#FFFFFF" />
      <circle cx="62" cy="45" r="9" fill="#FFFFFF" />
      <circle cx="40" cy="45" r="4.5" fill="#1E0F33" />
      <circle cx="60" cy="45" r="4.5" fill="#1E0F33" />
      <circle cx="42" cy="43" r="1.5" fill="#FFFFFF" />
      <circle cx="62" cy="43" r="1.5" fill="#FFFFFF" />
      {/* Blushing Cheeks */}
      <ellipse cx="28" cy="54" rx="4" ry="2.5" fill="#FF0055" opacity="0.6" />
      <ellipse cx="72" cy="54" rx="4" ry="2.5" fill="#FF0055" opacity="0.6" />
      {/* Mouth */}
      <path d="M 44 56 Q 50 64 56 56" fill="none" stroke="#1E0F33" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Green Bubble Monster
export function GreenBubbleMonster({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} animate-float inline-block`}>
      {/* Body */}
      <circle cx="50" cy="52" r="35" fill="#10B981" stroke="#047857" strokeWidth="4" />
      {/* Single Big Cyclops Eye */}
      <circle cx="50" cy="44" r="12" fill="#FFFFFF" />
      <circle cx="52" cy="44" r="6" fill="#064E3B" />
      <circle cx="54" cy="42" r="2" fill="#FFFFFF" />
      {/* Cute Teeth Smile */}
      <path d="M 38 60 Q 50 70 62 60" fill="#FFFFFF" stroke="#047857" strokeWidth="3" />
      {/* Antenna */}
      <path d="M 50 17 L 50 5" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="5" r="6" fill="#00FF87" stroke="#047857" strokeWidth="2" />
    </svg>
  );
}

// Orange Powerup Dragon Imp
export function OrangePowerupImp({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} animate-powerup inline-block`}>
      {/* Fire Wings */}
      <path d="M 15 50 Q 0 30 25 40 Z" fill="#FFAB00" />
      <path d="M 85 50 Q 100 30 75 40 Z" fill="#FFAB00" />
      {/* Round Body */}
      <circle cx="50" cy="55" r="33" fill="#FF8C00" stroke="#B85C00" strokeWidth="4" />
      {/* Crown Horn */}
      <polygon points="50,12 42,28 58,28" fill="#FFE600" stroke="#B85C00" strokeWidth="2" />
      {/* Expressive Eyes */}
      <circle cx="37" cy="48" r="8" fill="#FFFFFF" />
      <circle cx="63" cy="48" r="8" fill="#FFFFFF" />
      <circle cx="39" cy="48" r="4" fill="#581C87" />
      <circle cx="61" cy="48" r="4" fill="#581C87" />
      {/* Joyful Mouth */}
      <path d="M 42 62 Q 50 72 58 62 Z" fill="#581C87" />
    </svg>
  );
}

// Purple Cauldron Wizard Imp
export function PurpleCauldronImp({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} inline-block`}>
      <circle cx="50" cy="52" r="34" fill="#A855F7" stroke="#7E22CE" strokeWidth="4" />
      <circle cx="36" cy="46" r="8" fill="#FFFFFF" />
      <circle cx="64" cy="46" r="8" fill="#FFFFFF" />
      <circle cx="38" cy="46" r="4" fill="#1E0F33" />
      <circle cx="62" cy="46" r="4" fill="#1E0F33" />
      <path d="M 44 60 Q 50 65 56 60" fill="none" stroke="#1E0F33" strokeWidth="3" />
    </svg>
  );
}
