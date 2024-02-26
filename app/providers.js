'use client';

import { GobanProvider } from '../contexts/GobanContext'

export function Providers({ children }) {
  return (
    <GobanProvider>
      {children}
    </GobanProvider>
  );
}