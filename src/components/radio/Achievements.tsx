'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'listener' | 'social' | 'collector' | 'special';
  rarity: 'common' | 'r