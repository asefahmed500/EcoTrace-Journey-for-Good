"use client";

import { icons } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const LucideIcon = icons[name as keyof typeof icons];

  if (!LucideIcon) {
    return null; // Or return a default icon
  }

  return <LucideIcon {...props} />;
};
