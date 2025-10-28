import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Index() {
  return (
    <div>
      <DashboardLayout>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow">
            <h3 className="text-gray-700 font-semibold">Production Today</h3>
            <p className="text-2xl font-bold mt-2">128 Batches</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow">
            <h3 className="text-gray-700 font-semibold">Inventory Level</h3>
            <p className="text-2xl font-bold mt-2">87%</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow">
            <h3 className="text-gray-700 font-semibold">QC Pass Rate</h3>
            <p className="text-2xl font-bold mt-2">96%</p>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
