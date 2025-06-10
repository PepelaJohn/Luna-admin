
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LunaDrone Admin Dashboard',
  description: 'Admin dashboard for LunaDrone delivery management system',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
     <>
      {children}
      </>
   
  );
}