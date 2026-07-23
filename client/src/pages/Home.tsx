import React, { useEffect, useRef } from 'react';
import { useCars } from '../context/CarContext';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Gavel, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const { cars } = useCars();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter 4 featured cars
  const featuredCars = cars.filter(c => c.status === 'available').slice(0, 4);

  useEffect(() => {
    // GSAP elegant entrance animations
    const ctx = gsap.context(() => {
      gsap.from('.tech-fade-in', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
      
      gsap.from('.tech-scale-in', {
        scale: 0.98,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-16">
      
      {/* Hero Section Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        
        {/* Left: Text & Pitch (6 cols) */}
        <div className="lg:col-span-6 space-y-6 tech-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-brandIndigo uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Certified Used Car Marketplace
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight leading-tight text-textMain">
            Buy and Sell Pre-Owned Cars at the <span className="text-brandIndigo">Best Market Prices</span>
          </h2>
          
          <p className="text-sm md:text-md text-textMuted leading-relaxed">
            Welcome to **Ye Chalegi**, a professional peer-to-peer used car marketplace. List your cars in minutes with our strict 9-field inspection sheet, view real-time biddings, and buy or sell direct without high dealership markups.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 font-body py-4 border-y border-gray-200 uppercase text-xs">
            <div>
              <div className="text-xl md:text-2xl font-bold text-textMain tracking-tight">{cars.length}</div>
              <div className="text-[10px] text-textMuted font-semibold tracking-wider mt-1">Total Listings</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-brandIndigo tracking-tight">
                {cars.filter(c => c.status === 'available').length}
              </div>
              <div className="text-[10px] text-textMuted font-semibold tracking-wider mt-1">Active Bidding</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-emeraldSuccess tracking-tight">
                {cars.filter(c => c.status === 'sold').length}
              </div>
              <div className="text-[10px] text-textMuted font-semibold tracking-wider mt-1">Closed Deals</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              to="/listings"
              className="btn-indigo px-6 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              Explore Vehicles <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
            </Link>
            <Link 
              to="/admin/add"
              className="btn-outline px-6 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              List Your Vehicle
            </Link>
          </div>
        </div>

        {/* Right: Professional Hero Image (6 cols) */}
        <div className="lg:col-span-6 tech-scale-in relative">
          <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-lg relative h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200" 
              alt="Premium Sports Car Showcase" 
              className="w-full h-full object-cover brightness-[0.9] hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Floating Live Bid Stat Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 flex items-center justify-between border border-gray-100 rounded-2xl shadow-md">
              <div>
                <span className="text-[9px] font-bold text-brandIndigo uppercase tracking-wider block">Featured Listing</span>
                <h4 className="text-sm font-display font-bold text-textMain uppercase">Porsche 911 Turbo S</h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-semibold text-textMuted uppercase block">Est. Market Value</span>
                <span className="text-sm font-bold text-emeraldSuccess">₹85,00,000</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Featured listings Section */}
      <div className="space-y-6 pt-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-textMain">
              Featured Active Listings
            </h3>
            <p className="text-xs text-textMuted mt-1 font-semibold uppercase tracking-wider">
              Browse hot listings with active customer biddings
            </p>
          </div>
          <Link 
            to="/listings" 
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brandIndigo hover:underline"
          >
            All Listings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car) => {
            const highestBid = car.bids.length > 0 ? Math.max(...car.bids.map(b => b.amount)) : car.price;
            return (
              <div key={car.id} className="pro-card flex flex-col justify-between group h-full overflow-hidden">
                <div className="relative overflow-hidden h-40 border-b border-gray-200">
                  <img 
                    src={car.imageUrl} 
                    alt={`${car.company} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 border border-gray-200 rounded-md text-[9px] uppercase tracking-wider text-textMain font-bold shadow-sm">
                    LOT {String(car.lotNumber).padStart(3, '0')}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-grow">
                  <div>
                    <h5 className="font-display font-bold text-sm uppercase leading-tight tracking-wide text-textMain">
                      {car.company} {car.model}
                    </h5>
                    <span className="text-[10px] text-textMuted uppercase block mt-1 font-medium">
                      {car.year} · {car.transmission}
                    </span>
                  </div>

                  <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">
                    {car.description}
                  </p>

                  <div className="pt-3 flex justify-between items-end border-t border-gray-150">
                    <div>
                      <span className="text-[9px] uppercase text-textMuted block tracking-wider font-semibold">Current High Bid</span>
                      <span className="font-bold text-brandIndigo text-sm">₹{highestBid.toLocaleString()}</span>
                    </div>
                    <div className="text-right text-[9px] uppercase text-textMuted font-semibold tracking-wider">
                      {car.fuelType}
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/car/${car.id}`} 
                  className="w-full text-center border-t border-gray-200 py-3 font-semibold text-xs bg-gray-50 hover:bg-brandIndigo hover:text-white transition-all uppercase tracking-wider"
                >
                  View Details & Bid
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Assurances grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 font-body">
        <div className="pro-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Gavel className="w-5 h-5 text-brandIndigo" />
          </div>
          <h4 className="font-display font-bold text-md text-textMain uppercase tracking-wide">
            Direct Customer Bidding
          </h4>
          <p className="text-xs text-textMuted leading-relaxed">
            Eliminate dealer margins. Buyers bid directly on listings, and sellers accept bids instantly with zero transaction premiums.
          </p>
        </div>
        
        <div className="pro-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emeraldSuccess" />
          </div>
          <h4 className="font-display font-bold text-md text-textMain uppercase tracking-wide">
            9-Field Inspection Verification
          </h4>
          <p className="text-xs text-textMuted leading-relaxed">
            Every car listing goes through verification checks across fuel, transmission, parameters, and description details to match local catalogs.
          </p>
        </div>

        <div className="pro-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-brandIndigo" />
          </div>
          <h4 className="font-display font-bold text-md text-textMain uppercase tracking-wide">
            Audit Ledger Sheets
          </h4>
          <p className="text-xs text-textMuted leading-relaxed">
            All administrative entries are tracked under secure ledger lines, providing clean sales charts and inventory valuations.
          </p>
        </div>
      </div>

    </div>
  );
};
export default Home;
