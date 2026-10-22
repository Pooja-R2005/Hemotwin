import React, { useState } from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { RiskBadge } from '../components/RiskBadge';
import { BloodProduct, BagRegistrationPayload } from '../types/hemotwin';
import {
  Boxes,
  Plus,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  X,
  Check,
  Thermometer,
  Clock,
  HeartPulse,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface BagsProps {
  onSelectBagForDetails: (bagId: string) => void;
}

export const Bags: React.FC<BagsProps> = ({ onSelectBagForDetails }) => {
  const {
    bags,
    refreshBags,
    registerNewBag,
    deleteBag,
    selectedBagId,
    setSelectedBagId,
    setSelectedProduct,
    isLoading,
  } = useHemoTwin();

  const [filterProduct, setFilterProduct] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newBagId, setNewBagId] = useState<string>('');
  const [newProduct, setNewProduct] = useState<BloodProduct>('PRBC');
  const [newStorageHours, setNewStorageHours] = useState<number>(0);
  const [donorId, setDonorId] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredBags = bags.filter((bag) => {
    if (filterProduct === 'ALL') return true;
    return bag.blood_product === filterProduct;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBagId.trim()) {
      setModalError('Please enter a Bag ID (e.g., HT-002)');
      return;
    }

    const payload: BagRegistrationPayload = {
      bag_id: newBagId.trim().toUpperCase(),
      blood_product: newProduct,
      initial_storage_hours: Number(newStorageHours) || 0,
      donor_id: donorId.trim() || undefined,
    };

    const success = await registerNewBag(payload);
    if (success) {
      setIsModalOpen(false);
      setNewBagId('');
      setDonorId('');
      setNewStorageHours(0);
      setModalError(null);
    } else {
      setModalError('Failed to register bag in FastAPI state manager.');
    }
  };

  const handleDelete = async (bagId: string) => {
    if (window.confirm(`Are you sure you want to remove bag '${bagId}' from tracking?`)) {
      await deleteBag(bagId);
    }
  };

  const handleView = (bagId: string, product: BloodProduct) => {
    setSelectedBagId(bagId);
    setSelectedProduct(product);
    onSelectBagForDetails(bagId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">Blood Bag Registry</h2>
            <p className="text-xs text-slate-500">
              In-memory stateful inventory synchronized with FastAPI backend (<code className="text-cyan-300 font-mono">GET /bags</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refreshBags()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Register New Bag Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Blood Bag</span>
          </button>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Product Filter:</span>
          <div className="flex items-center gap-1.5">
            {['ALL', 'PRBC', 'Whole_Blood', 'Platelets', 'FFP'].map((prod) => (
              <button
                key={prod}
                onClick={() => setFilterProduct(prod)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                  filterProduct === prod
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-900'
                }`}
              >
                {prod.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong className="text-slate-900">{filteredBags.length}</strong> of{' '}
          <strong className="text-slate-900">{bags.length}</strong> active bags
        </div>
      </div>

      {/* Bag Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white backdrop-blur-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-950/60 text-slate-500 uppercase font-semibold">
              <th className="p-4">Bag ID</th>
              <th className="p-4">Blood Product</th>
              <th className="p-4">Temperature</th>
              <th className="p-4">Surrogate Health</th>
              <th className="p-4">Risk Level</th>
              <th className="p-4">Remaining Safe Time</th>
              <th className="p-4">Last Update</th>
              <th className="p-4">Mode</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredBags.length > 0 ? (
              filteredBags.map((bag) => {
                const isSelected = bag.bag_id === selectedBagId;
                return (
                  <tr
                    key={bag.bag_id}
                    className={`transition-colors hover:bg-slate-50/40 ${
                      isSelected ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{bag.bag_id}</span>
                      {isSelected && (
                        <span className="text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-200 border border-slate-200">
                        {bag.blood_product}
                      </span>
                    </td>
                    <td className="p-4 text-slate-900">
                      {bag.current_temperature_C !== null ? (
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-cyan-400" />
                          {bag.current_temperature_C.toFixed(1)}°C
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      {bag.health_score !== null ? (
                        <span className="font-bold text-emerald-400">
                          {bag.health_score.toFixed(1)} / 100
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      <RiskBadge level={bag.risk_level} size="sm" />
                    </td>
                    <td className="p-4 text-cyan-300 font-bold">
                      {bag.remaining_safe_time_hours !== null ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {bag.remaining_safe_time_hours.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {bag.last_update ? new Date(bag.last_update).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-50 text-slate-500 border border-slate-200">
                        {bag.mode}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(bag.bag_id, bag.blood_product)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition"
                          title="Inspect Bag Digital Twin"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bag.bag_id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
                          title="Deregister Bag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No blood bags registered matching criteria. Click &quot;Register Blood Bag&quot; to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Registration Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-900 text-sm">Register New Blood Bag</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-4 text-xs">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Bag Identifier (ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HT-002"
                  value={newBagId}
                  onChange={(e) => setNewBagId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Blood Product Type</label>
                <select
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value as BloodProduct)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-400"
                >
                  <option value="PRBC">PRBC (Packed Red Blood Cells - 4°C)</option>
                  <option value="Whole_Blood">Whole Blood (4°C)</option>
                  <option value="Platelets">Platelets (Agitated - 22°C)</option>
                  <option value="FFP">FFP (Fresh Frozen Plasma - -18°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Initial Storage Elapsed (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newStorageHours}
                  onChange={(e) => setNewStorageHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Donor ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DNR-8891"
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Bag</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
};
