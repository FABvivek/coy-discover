'use client';

import React, { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  PanInfo,
} from 'framer-motion';
import { MapPin, Check, X, Sparkles } from 'lucide-react';
import { Profile, SwipeDirection } from '@/lib/types';

interface SwipeCardProps {
  profile: Profile;
  isFront: boolean;
  onSwipe?: (direction: SwipeDirection) => void;
  exitDirection?: SwipeDirection | null;
}

export function SwipeCard({
  profile,
  isFront,
  onSwipe,
  exitDirection,
}: SwipeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], shouldReduceMotion ? [0, 0] : [-12, 12]);
  const likeOpacity = useTransform(x, [25, 110], [0, 1]);
  const passOpacity = useTransform(x, [-25, -110], [0, 1]);
  const cardScale = useTransform(x, [-250, 0, 250], [1.02, 1, 1.02]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!onSwipe || !isFront) return;

    const threshold = 100;
    const velocityThreshold = 500;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe('like');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe('pass');
    }
  };

  const photoUrl = imageError
    ? `https://picsum.photos/seed/${profile.id}/600/850`
    : profile.photo;

  if (!isFront) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full rounded-[28px] overflow-hidden bg-bg-card border border-line shadow-card pointer-events-none select-none transition-transform duration-300"
        style={{
          transform: 'scale(0.95) translateY(12px)',
          opacity: 0.65,
          zIndex: 0,
        }}
      >
        <img
          src={photoUrl}
          alt=""
          className="w-full h-full object-cover filter brightness-[0.92]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium tracking-tight">
              {profile.name}
            </span>
            <span className="text-xl font-normal text-white/80">{profile.age}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 opacity-80" />
              <span>{profile.city}</span>
            </div>
            <span>&bull;</span>
            <span>{profile.height}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{
        x,
        rotate,
        scale: cardScale,
        zIndex: 10,
      }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={
        exitDirection === 'like'
          ? { x: 500, opacity: 0, transition: { duration: shouldReduceMotion ? 0.15 : 0.28 } }
          : exitDirection === 'pass'
          ? { x: -500, opacity: 0, transition: { duration: shouldReduceMotion ? 0.15 : 0.28 } }
          : { x: 0, opacity: 1 }
      }
      className="absolute inset-0 w-full h-full rounded-[28px] overflow-hidden bg-bg-card border border-line shadow-card-elevated cursor-grab active:cursor-grabbing select-none touch-none"
    >
      <img
        src={photoUrl}
        alt={`${profile.name}, ${profile.age}`}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-45% to-transparent pointer-events-none" />

      {/* Restrained "Like" stamp overlay (top-left) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 pointer-events-none z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/90 text-white font-medium text-xs tracking-wider border border-white/20 backdrop-blur-sm shadow-sm"
      >
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>LIKE</span>
      </motion.div>

      {/* Restrained "Pass" stamp overlay (top-right) */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-6 right-6 pointer-events-none z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/85 text-white/90 font-medium text-xs tracking-wider border border-white/20 backdrop-blur-sm shadow-sm"
      >
        <X className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>PASS</span>
      </motion.div>

      {/* Aesthetic Palette badge (top right subtle) */}
      {profile.styleColor && (
        <div className="absolute top-6 right-6 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/40 text-white/80 backdrop-blur-md border border-white/10">
            {profile.styleColor}
          </span>
        </div>
      )}

      {/* Profile Details Container (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10 pointer-events-none">
        {/* Name and Age */}
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-sm">
            {profile.name}
          </h2>
          <span className="text-2xl font-light text-white/80">
            {profile.age}
          </span>
        </div>

        {/* Location & Height */}
        <div className="flex items-center gap-2 text-xs text-white/80 mt-1 font-sans">
          <div className="flex items-center gap-1 text-white/90">
            <MapPin className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
            <span>{profile.city}</span>
          </div>
          <span className="opacity-50">&bull;</span>
          <span className="text-white/80 font-normal">{profile.height}</span>
        </div>

        {/* Authentic short bio (max 120 chars) */}
        <p className="text-[13.5px] leading-relaxed text-white/90 mt-3 font-normal line-clamp-2">
          {profile.bio}
        </p>

        {/* Interests chip tags */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/15 text-white backdrop-blur-sm border border-white/15"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
