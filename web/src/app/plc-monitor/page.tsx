'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    const interval = setInterval(fetchRegisters, 3000); // auto-refresh every 3s
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
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">PLC Live Registers</h2>

        <Card className="p-4 bg-white shadow-sm">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-700">D Registers</h3>
            <Button onClick={fetchRegisters} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="overflow-x-scroll overflow-y-scroll">
            <table className="w-full border border-gray-200 rounded-lg text-sm overflow-scroll max-h-screen">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-4 py-2 text-left">Address</th>
                  <th className="border px-4 py-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {registers.map((reg) => (
                  <tr key={reg.address}>
                    <td className="border px-4 py-2">{`D${reg.address}`}</td>
                    <td className="border px-4 py-2">{reg.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="number"
              placeholder="Address"
              onChange={(e) => setAddr(Number(e.target.value))}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Value"
              onChange={(e) => setVal(Number(e.target.value))}
              className="border p-2 rounded"
            />
            <Button onClick={handleWrite}>Write</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
