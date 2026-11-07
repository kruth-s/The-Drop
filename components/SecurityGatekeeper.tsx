'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SecurityGatekeeperProps {
  focusedField: 'username' | 'password' | null;
  showPassword: boolean;
  isError: boolean;
}

// Image mapping:
// Starts directly with Image 2 (checking VIP list) as idle/default
// When typing password (masked): Image 3 (covering eyes)
// When password is shown (unmasked): Image 4 (shocked)
// When wrong credentials / error: Image 6 (denied)
const STATE_IMAGES = {
  idle: '/images/bouncer-2-checking.jpg',
  covering: '/images/bouncer-3-covering.jpg',
  shocked: '/images/bouncer-4-shocked.jpg',
  denied: '/images/bouncer-6-denied.jpg',
};

const ALL_IMAGES = Object.values(STATE_IMAGES).filter((v, i, a) => a.indexOf(v) === i);

export const SecurityGatekeeper: React.FC<SecurityGatekeeperProps> = ({
  focusedField,
  showPassword,
  isError,
}) => {
  // Resolve current active state:
  // 1. Error -> Denied (Image 6)
  // 2. Password field with showPassword -> Shocked (Image 4)
  // 3. Password field masked -> Covering eyes (Image 3)
  // 4. Default / Username -> Checking VIP list (Image 2)
  const getActiveImage = (): string => {
    if (isError) return STATE_IMAGES.denied;
    if (focusedField === 'password') {
      return showPassword ? STATE_IMAGES.shocked : STATE_IMAGES.covering;
    }
    return STATE_IMAGES.idle;
  };

  const activeImage = getActiveImage();

  return (
    <div className="flex flex-col items-center select-none relative mb-4 w-full">
      {/* Main Bouncer Portrait Container */}
      <div className="relative w-56 h-56 sm:w-60 sm:h-60 mx-auto">
        {/* Subtle Ambient glow */}
        <motion.div
          className="absolute -inset-2 rounded-2xl pointer-events-none blur-2xl"
          animate={{
            backgroundColor:
              isError
                ? 'rgba(239, 68, 68, 0.15)'
                : focusedField === 'password'
                ? 'rgba(249, 115, 22, 0.12)'
                : 'rgba(255, 90, 31, 0.08)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Image Frame */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-800/80 bg-zinc-950">
          {/* Stacked preloaded images with smooth, instant crossfade */}
          {ALL_IMAGES.map((src) => (
            <motion.img
              key={src}
              src={src}
              alt="Snow Leopard Bouncer"
              className="absolute inset-0 w-full h-full object-cover object-center"
              initial={false}
              animate={{ opacity: src === activeImage ? 1 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
