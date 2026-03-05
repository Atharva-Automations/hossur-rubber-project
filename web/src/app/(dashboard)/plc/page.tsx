'use client';

import { useEffect, useState } from 'react';
import { Header, PageContainer, Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function PlcMonitorPage() {
  const [registers, setRegisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [addr, setAddr] = useState<number>(0);
  const [val, setVal] = useState<number>(0);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plc/registers?start=0&count=100');
      setRegisters(res.data);
    } catch (err) {
      console.error('Error fetching PLC data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisters();
    const interval = setInterval(fetchRegisters, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleWrite = async () => {
    try {
      await api.post('/plc/write', { address: addr, value: val });
      alert(`Wrote value ${val} to address D${addr}`);
      // Refresh registers after write
      fetchRegisters();
    } catch (err) {
      console.error('Error writing to PLC', err);
      alert('Failed to write to PLC');
    }
  };

  return (
    <PageContainer>
      <Header
        title="PLC Monitor"
        description="Monitor and control PLC registers in real-time"
        icon="🔌"
      />

      <div className="mt-8">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">D Registers</h3>
            <Button
              onClick={fetchRegisters}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-900 font-semibold">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-gray-900 font-semibold">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registers.map((reg) => (
                  <tr key={reg.address} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{`D${reg.address}`}</td>
                    <td className="px-4 py-3 text-gray-700">{reg.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Write Register
            </h4>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Address"
                value={addr}
                onChange={(e) => setAddr(Number(e.target.value))}
                className="bg-white border-gray-200 text-gray-900"
              />
              <Input
                type="number"
                placeholder="Value"
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                className="bg-white border-gray-200 text-gray-900"
              />
              <Button
                onClick={handleWrite}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Write
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
