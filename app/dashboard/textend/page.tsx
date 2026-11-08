'use client';

import React from 'react';
import { App as TextEndSuite } from '@/components/textend/App';

export default function TextEndDashboardPage() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#0c0d0f] text-neutral-100">
      <TextEndSuite />
    </div>
  );
}

