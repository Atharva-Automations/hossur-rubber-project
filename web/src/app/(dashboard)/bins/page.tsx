'use client';
// import { useState } from 'react';
// import api from '@/lib/api';
import { Header, PageContainer } from '@/components/global';
import { Button } from '@/components/ui/button';
// import { toast } from '@/components/ui/use-toast';
import FilterBar from '@/components/ui/filter-bar';
import BinTable from './components/BinTable';
import Link from 'next/link';

export default function BinsPage() {
  // const [isClosingBins, setIsClosingBins] = useState(false);

  // const handleCloseBins = async () => {
  //   try {
  //     setIsClosingBins(true);
  //     await api.post('/plc/close-bins');
  //     toast({
  //       title: 'Bins closed',
  //       description: 'All bins signalled to close (d540-d574 set to 1)',
  //     });
  //   } catch (err: any) {
  //     console.error('Error closing bins', err);
  //     toast({
  //       title: 'Error',
  //       description:
  //         err?.response?.data?.message ||
  //         err?.message ||
  //         'Failed to close bins',
  //     });
  //   } finally {
  //     setIsClosingBins(false);
  //   }
  // };

  return (
    <PageContainer>
      <Header
        title="Bin Assignment"
        description="Manage and assign material bins to production batches"
        icon="📊"
      />

      <div className="mt-8 flex justify-end gap-3">
        {/* <Button
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          onClick={handleCloseBins}
          disabled={isClosingBins}
        >
          Close All Bins
        </Button> */}
        <Link href="/bins/status">
          <Button className="text-white bg-blue-600 hover:bg-blue-700">
            Bin Status
          </Button>
        </Link>
        <Link href="/bins/add">
          <Button className="text-white bg-blue-600 hover:bg-blue-700">
            + Assign Bin
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <FilterBar />
      </div>

      <div className="mt-4">
        <BinTable />
      </div>
    </PageContainer>
  );
}
