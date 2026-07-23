import React, { useState } from 'react';
import { useCars } from '../context/CarContext';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertTriangle } from 'lucide-react';

export const AdminAddCar: React.FC = () => {
  const { addCar } = useCars();
  const navigate = useNavigate();

  // Form states
  const [company, setCompany] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [kmDriven, setKmDriven] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];

    if (!company.trim()) validationErrors.push("Company name is required.");
    if (!model.trim()) validationErrors.push("Model name is required.");
    
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      validationErrors.push("Price must be a valid positive number.");
    }

    const yearNum = Number(year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear + 1) {
      validationErrors.push(`Manufacturing Year must be between 1886 and ${currentYear + 1}.`);
    }

    const kmNum = Number(kmDriven);
    if (isNaN(kmNum) || kmNum < 0) {
      validationErrors.push("Kilometers Driven must be a valid non-negative number.");
    }

    if (!imageUrl.trim()) validationErrors.push("Image URL is required.");
    if (!description.trim()) validationErrors.push("Description is required.");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    addCar({
      company: company.trim(),
      model: model.trim(),
      price: priceNum,
      year: yearNum,
      fuelType,
      transmission,
      kmDriven: kmNum,
      imageUrl: imageUrl.trim(),
      description: description.trim()
    });

    navigate('/admin/cars');
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-6 text-textMain">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Register Vehicle</h2>
        <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-semibold">
          Submit specifications to add a new car listing to the catalog
        </p>
        <div className="w-full border-t border-gray-200 my-4"></div>
      </div>

      <div className="pro-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          
          {errors.length > 0 && (
            <div className="p-3 border border-red-200 bg-red-50 text-red-600 rounded-lg space-y-1">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>FORM VALIDATION ERRORS:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 normal-case font-normal text-textMain">
                {errors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Company */}
            <div className="space-y-1">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Company *</label>
              <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="e.g. Maruti, Honda"
                className="w-full pro-input px-3 py-2 text-xs"
              />
            </div>

            {/* Model */}
            <div className="space-y-1">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Model *</label>
              <input 
                type="text" 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                placeholder="e.g. Swift, City"
                className="w-full pro-input px-3 py-2 text-xs"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Price (INR) *</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="e.g. 350000"
                className="w-full pro-input px-3 py-2 text-xs font-semibold"
              />
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Model Year *</label>
              <input 
                type="number" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                placeholder="e.g. 2018"
                className="w-full pro-input px-3 py-2 text-xs"
              />
            </div>

            {/* Fuel Type */}
            <div className="space-y-1">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Fuel Type *</label>
              <select 
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full pro-input px-3 py-2 text-xs cursor-pointer bg-white"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            {/* Transmission */}
            <div className="space-y-1">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Transmission *</label>
              <select 
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full pro-input px-3 py-2 text-xs cursor-pointer bg-white"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            {/* Kilometers Driven */}
            <div className="space-y-1 md:col-span-2">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Odometer (KM) *</label>
              <input 
                type="number" 
                value={kmDriven}
                onChange={(e) => setKmDriven(e.target.value)}
                required
                placeholder="e.g. 45000"
                className="w-full pro-input px-3 py-2 text-xs font-semibold"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1 md:col-span-2">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Image URL *</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                placeholder="https://images.unsplash.com/photo-X"
                className="w-full pro-input px-3 py-2 text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1 md:col-span-2">
              <label className="uppercase text-textMuted tracking-wider block text-[10px]">Car Description *</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Mention ownership history, maintenance logs, scratches, performance status..."
                className="w-full pro-input px-3 py-2 text-xs resize-none"
              />
            </div>

          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full btn-indigo py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm mt-4"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5px]" /> Register Car Listing
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminAddCar;
