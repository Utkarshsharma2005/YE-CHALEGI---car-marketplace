import React, { useState } from 'react';
import { useCars, type Car } from '../context/CarContext';
import { Link } from 'react-router-dom';
import { Search, RotateCcw, Filter, Eye } from 'lucide-react';

// Single LotTicket Card matching corporate light theme
const LotTicket: React.FC<{ car: Car }> = ({ car }) => {
  const highestBid = car.bids.length > 0 ? Math.max(...car.bids.map(b => b.amount)) : car.price;

  return (
    <div className="pro-card flex flex-col justify-between group overflow-hidden h-[340px]">
      {/* Product Image */}
      <div className="relative overflow-hidden h-40 border-b border-gray-200">
        <img 
          src={car.imageUrl} 
          alt={`${car.company} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800';
          }}
        />
        {/* Lot tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 border border-gray-200 rounded-md text-[9px] uppercase tracking-wider text-textMain font-bold shadow-sm">
          LOT {String(car.lotNumber).padStart(3, '0')}
        </div>
        
        {/* Status Stamp */}
        {car.status === 'sold' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="rubber-stamp">
              SOLD OUT
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          <h4 className="font-display font-bold text-sm uppercase text-textMain tracking-wide truncate">
            {car.company} {car.model}
          </h4>
          <p className="text-[10px] tracking-wider text-textMuted uppercase font-semibold">
            {car.year} · {car.fuelType} · {car.transmission}
          </p>
          <p className="text-[11px] text-textMuted line-clamp-2 leading-relaxed">
            {car.description}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
          <div>
            <span className="text-[9px] uppercase text-textMuted block tracking-wider font-semibold">Current High Bid</span>
            <span className="font-bold text-brandIndigo text-sm">₹{highestBid.toLocaleString()}</span>
          </div>
          <Link 
            to={`/car/${car.id}`} 
            className="btn-outline px-3 py-1 text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" /> View details
          </Link>
        </div>
      </div>
    </div>
  );
};

export const CarListing: React.FC = () => {
  const { cars } = useCars();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTrans, setSelectedTrans] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000000);

  // Extract unique companies for filtering
  const companies = ['All', ...Array.from(new Set(cars.map(c => c.company)))];
  const fuels = ['All', 'Petrol', 'Diesel'];
  const transmissions = ['All', 'Manual', 'Automatic'];

  // Reset all filters
  const handleReset = () => {
    setSearch('');
    setSelectedCompany('All');
    setSelectedFuel('All');
    setSelectedTrans('All');
    setMaxPrice(1000000);
  };

  // Filter logic
  const filteredCars = cars.filter(car => {
    const highestBid = car.bids.length > 0 ? Math.max(...car.bids.map(b => b.amount)) : car.price;
    const matchesSearch = 
      car.company.toLowerCase().includes(search.toLowerCase()) || 
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCompany = selectedCompany === 'All' || car.company === selectedCompany;
    const matchesFuel = selectedFuel === 'All' || car.fuelType === selectedFuel;
    const matchesTrans = selectedTrans === 'All' || car.transmission === selectedTrans;
    const matchesPrice = highestBid <= maxPrice;

    return matchesSearch && matchesCompany && matchesFuel && matchesTrans && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="w-full text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-textMain">
          Explore Pre-Owned Vehicles
        </h2>
        <p className="text-xs text-textMuted mt-1 font-semibold uppercase tracking-wider">
          Filter and inspect verified listings in our directory
        </p>
        <div className="w-full border-t border-gray-200 my-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3">
          <div className="pro-card p-6 space-y-6">
            <h4 className="font-display font-bold text-md uppercase border-b border-gray-200 pb-3 flex items-center gap-2 tracking-wide text-textMain">
              <Filter className="w-4 h-4 text-brandIndigo" /> Filter listings
            </h4>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold block uppercase text-textMuted tracking-wider">Search Keywords</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Land Cruiser, Beetle..."
                  className="w-full pro-input px-3 py-2 pl-9 text-xs"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-textMuted" />
              </div>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold block uppercase text-textMuted tracking-wider">Manufacturer</label>
              <select 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full pro-input px-3 py-2 text-xs cursor-pointer bg-white"
              >
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Fuel Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold block uppercase text-textMuted tracking-wider">Fuel Type</label>
              <select 
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full pro-input px-3 py-2 text-xs cursor-pointer bg-white"
              >
                {fuels.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Transmission Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold block uppercase text-textMuted tracking-wider">Transmission</label>
              <select 
                value={selectedTrans}
                onChange={(e) => setSelectedTrans(e.target.value)}
                className="w-full pro-input px-3 py-2 text-xs cursor-pointer bg-white"
              >
                {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-textMuted tracking-wider">
                <span>Max Price Limit</span>
                <span className="text-brandIndigo font-bold">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={50000} 
                max={1000000} 
                step={25000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brandIndigo cursor-pointer"
              />
            </div>

            {/* Reset Button */}
            <button 
              onClick={handleReset}
              className="w-full btn-outline py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-gray-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        </div>

        {/* Right Column: Listings Grid (9 cols) */}
        <div className="lg:col-span-9">
          {filteredCars.length === 0 ? (
            <div className="pro-card p-12 text-center space-y-4">
              <p className="text-sm italic text-textMuted">
                "No car listings matching the specified filters were found."
              </p>
              <button 
                onClick={handleReset}
                className="mx-auto btn-outline px-4 py-2 text-xs uppercase transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCars.map(car => (
                <LotTicket key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
export default CarListing;
