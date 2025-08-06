import { Suspense } from 'react';
import ConfirmEmailClient from './ResetPage';

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className='h-screen flex items-center justify-center text-sm'>Loading...</div>}>
      <ConfirmEmailClient />
    </Suspense>
  );
}