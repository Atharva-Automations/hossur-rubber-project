// app/simulation/[id]/page.tsx
import React from 'react';
import BatchEditPageClient from './BatchEditPageClient';

type Props = { params: { id: string } };

export default function BatchEditPage({ params }: Props) {
  const batchId = Number(params.id);
  // server component — just pass numeric id to client
  return <BatchEditPageClient batchId={batchId} />;
}
