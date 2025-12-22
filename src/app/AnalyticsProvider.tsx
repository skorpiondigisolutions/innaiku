'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/firebase/config';

export default function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics(); // ✅ runs once
  }, []);

  return null;
}
