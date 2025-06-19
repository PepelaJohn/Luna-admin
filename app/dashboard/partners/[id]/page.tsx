// app/admin/partners/[id]/page.tsx
import PartnerDetail from '@/components/partners/PartnerDetail';
import React from 'react';

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
    const {id} = React.use(params)
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDetail partnerId={id} />
    </div>
  );
}

