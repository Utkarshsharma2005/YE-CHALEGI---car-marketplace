import React, { useState } from 'react';
import { useCars, type Car } from '../context/CarContext';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';

export const AdminViewCars: React.FC = () => {
  const { cars, deleteCar, toggleStatus } = useCars();
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteCar(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-textMain space-y-6">
      
      {/* Title */}
      <div className="w-full text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Inventory Management</h2>
        <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-semibold">
          Review, modify, delete active vehicle listings and toggle their availability status
        </p>
        <div className="w-full border-t border-gray-200 my-4"></div>
      </div>

      {/* Inventory Table */}
      <div className="pro-card overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-textMuted uppercase tracking-wider text-[9px] border-b border-gray-200 font-bold">
              <th className="py-3.5 px-6 text-center">Lot No.</th>
              <th className="py-3.5 px-6">Vehicle Specifications</th>
              <th className="py-3.5 px-6 text-right">Price Value</th>
              <th className="py-3.5 px-6 text-center">Year</th>
              <th className="py-3.5 px-6 text-center">Gearbox</th>
              <th className="py-3.5 px-6 text-center">Bids count</th>
              <th className="py-3.5 px-6 text-center">Availability</th>
              <th className="py-3.5 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-textMuted font-medium">
            {cars.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center italic text-textMuted">
                  No listings found in database inventory. Click "Register Vehicle" to add.
                </td>
              </tr>
            ) : (
              cars.map((car) => {
                const highestBid = car.bids.length > 0 ? Math.max(...car.bids.map(b => b.amount)) : car.price;
                return (
                  <tr key={car.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Lot */}
                    <td className="py-4.5 px-6 text-center font-bold text-textMain">
                      #{String(car.lotNumber).padStart(3, '0')}
                    </td>
                    
                    {/* Name */}
                    <td className="py-4.5 px-6">
                      <div className="font-bold text-textMain uppercase text-[12px] tracking-wide">{car.company} {car.model}</div>
                      <div className="text-[9px] text-textMuted uppercase mt-1 tracking-wider">{car.fuelType} · {car.kmDriven.toLocaleString()} km</div>
                    </td>

                    {/* Price */}
                    <td className="py-4.5 px-6 text-right font-bold text-brandIndigo text-[12px]">
                      ₹{highestBid.toLocaleString()}
                    </td>

                    {/* Year */}
                    <td className="py-4.5 px-6 text-center text-textMain">{car.year}</td>

                    {/* Transmission */}
                    <td className="py-4.5 px-6 text-center uppercase text-[10px]">{car.transmission}</td>

                    {/* Bidding count */}
                    <td className="py-4.5 px-6 text-center font-bold text-textMain">
                      {car.bids.length}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6 text-center">
                      <button 
                        onClick={() => toggleStatus(car.id)}
                        className={`px-3 py-1 rounded-md font-bold text-[9px] uppercase border transition-all ${
                          car.status === 'available' 
                            ? 'bg-emerald-50 text-emeraldSuccess border-emerald-200 hover:border-emeraldSuccess' 
                            : 'bg-red-50 text-red-600 border-red-200 hover:border-red-600'
                        }`}
                        title="Click to toggle status"
                      >
                        {car.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6">
                      <div className="flex justify-center items-center gap-3">
                        <Link 
                          to={`/admin/edit/${car.id}`} 
                          className="p-1.5 rounded border border-gray-200 hover:border-brandIndigo text-textMuted hover:text-brandIndigo hover:bg-blue-50/20 transition-all"
                          title="Edit Vehicle Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => setDeleteTarget(car)}
                          className="p-1.5 rounded border border-gray-200 hover:border-red-600 text-textMuted hover:text-red-600 hover:bg-red-50/20 transition-all"
                          title="Delete Car Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-semibold text-xs uppercase">
          <div className="bg-white p-6 max-w-sm w-full rounded-2xl space-y-4 border border-gray-200 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>WARNING: REMOVE VEHICLE</span>
            </div>
            
            <p className="text-textMuted normal-case font-normal leading-relaxed text-[11px]">
              Are you sure you want to permanently delete **Lot #{String(deleteTarget.lotNumber).padStart(3, '0')}** ({deleteTarget.company} {deleteTarget.model})? This action will immediately void the listing.
            </p>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminViewCars;
