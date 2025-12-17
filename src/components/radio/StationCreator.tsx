'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface StationFormData {
  name: string;
  description: string;
  category: 'music' | 'talk' | 'news' | 'sports' | '420' | 'ambient';
  frequency: number;
  isPremium: boolean;
  subscript