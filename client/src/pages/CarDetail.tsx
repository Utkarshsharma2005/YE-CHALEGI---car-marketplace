import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCars } from '../context/CarContext';
import { Gavel, Clock, ArrowLeft, Send, AlertTriangle } from 'lucide-react';

const rivalNames = [
  "Harpreet Singh", "Karan Malhotra", "Ananya Sen", 
  "Vikram Aditya", "Farhan Akhtar", "Shekhar Kapur",
  "Devendra Prasad", "Priya Nair", "Suresh Balaji"
];

export const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cars, placeBid } = useCars();
  const car = cars.find(c => c.id === id);

  const [bidAmount, setBidAmount] = useState('');
  const [userBidName, setUserBidName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rivalActivityMsg, setRivalActivityMsg] = useState('');

  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 40 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-red-600">Vehicle Not Found</h2>
        <p className="text-sm text-textMuted">The requested vehicle listing could not be found in our database.</p>
        <Link to="/listings" className="btn-outline px-4 py-2 text-xs uppercase inline-block">
          ← Return to Directory
        </Link>
      </div>
    );
  }

  const highestBid = car.bids.length > 0 ? Math.max(...car.bids.map(b => b.amount)) : car.price;
  const minimumBid = highestBid + 5000;

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setRivalActivityMsg('');

    const amount = Number(bidAmount);
    const name = userBidName.trim() || 'Anonymous Bidder';

    if (isNaN(amount) || amount < minimumBid) {
      setErrorMsg(`Invalid Bid: Minimum bid requirement is ₹${minimumBid.toLocaleString()}.`);
      return;
    }

    const success = placeBid(car.id, amount, name);
    if (success) {
      setSuccessMsg(`Success: Your bid of ₹${amount.toLocaleString()} has been submitted.`);
      setBidAmount('');
      
      // Simulate automated rival bidding
      setTimeout(() => {
        const rivalName = rivalNames[Math.floor(Math.random() * rivalNames.length)];
        const rivalBid = amount + (Math.floor(Math.random() * 2) + 1) * 5000;
        
        placeBid(car.id, rivalBid, rivalName);
        setRivalActivityMsg(`Counter Bid: ${rivalName} has placed a higher bid of ₹${rivalBid.toLocaleString()}!`);
      }, 2000);
    } else {
      setErrorMsg('Failed to place bid. Ensure your bid is higher than the current bid.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-textMain">
      
      <div className="mb-6">
        <Link to="/listings" className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-textMuted hover:text-brandIndigo transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Product Media & Description (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="pro-card overflow-hidden relative">
            <img 
              src={car.imageUrl} 
              alt={`${car.company} ${car.model}`}
              className="w-full h-[450px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800';
              }}
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1 font-bold text-sm text-textMain shadow-sm">
              LOT {String(car.lotNumber).padStart(3, '0')}
            </div>
            
            {car.status === 'sold' && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                <div className="rubber-stamp">
                  SOLD OUT
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="pro-card p-6 space-y-4">
            <h3 className="font-display font-bold text-lg border-b border-gray-150 pb-2 uppercase tracking-wide text-textMain">
              Vehicle Overview & Condition
            </h3>
            <p className="text-xs md:text-sm text-textMuted leading-relaxed">
              {car.description}
            </p>
          </div>
        </div>

        {/* Right: Spec sheet, Bidding & Timer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Spec Table */}
          <div className="pro-card p-5 text-xs font-medium">
            <h4 className="font-display font-bold text-sm uppercase border-b border-gray-150 pb-2.5 mb-4 text-center text-textMain tracking-wide">
              Specifications
            </h4>
            <div className="divide-y divide-gray-150 space-y-3">
              <div className="flex justify-between pt-3 first:pt-0">
                <span className="text-textMuted">Manufacturer:</span>
                <span className="font-bold text-textMain uppercase">{car.company}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-textMuted">Model Designation:</span>
                <span className="font-bold text-textMain uppercase">{car.model}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-textMuted">Model Year:</span>
                <span className="font-bold text-textMain">{car.year}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-textMuted">Fuel Type:</span>
                <span className="font-bold text-textMain uppercase">{car.fuelType}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-textMuted">Transmission:</span>
                <span className="font-bold text-textMain uppercase">{car.transmission}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-textMuted">Odometer Mileage:</span>
                <span className="font-bold text-textMain">{car.kmDriven.toLocaleString()} KM</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-textMuted">Listing Status:</span>
                <span className={`font-bold uppercase ${car.status === 'available' ? 'text-brandIndigo font-extrabold' : 'text-red-500'}`}>
                  {car.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bidding Terminal */}
          <div className="pro-card p-5 space-y-4">
            <h4 className="font-display font-bold text-md uppercase border-b border-gray-150 pb-2.5 flex items-center gap-2 text-textMain tracking-wide">
              <Gavel className="w-4 h-4 text-brandIndigo" /> Active Bidding Portal
            </h4>

            {/* Countdown timer */}
            {car.status === 'available' ? (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brandIndigo" />
                  <span className="font-bold text-textMuted">TIME REMAINING:</span>
                </div>
                <span className="text-brandIndigo font-bold tracking-wider">
                  {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center text-xs font-bold text-red-600">
                LISTING CLOSED
              </div>
            )}

            {/* Current Price Display */}
            <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3.5 rounded-lg">
              <div>
                <span className="text-[10px] text-textMuted block uppercase tracking-wider font-semibold">Current Highest Bid</span>
                <span className="text-xl font-bold text-brandIndigo">₹{highestBid.toLocaleString()}</span>
              </div>
              <div className="text-right text-xs">
                <span className="text-[10px] text-textMuted block uppercase tracking-wider font-semibold">Min. Next Bid</span>
                <span className="font-bold text-textMain">₹{minimumBid.toLocaleString()}</span>
              </div>
            </div>

            {/* Bidding Form */}
            {car.status === 'available' && (
              <form onSubmit={handleBidSubmit} className="space-y-4 text-xs font-medium">
                <div className="space-y-1">
                  <label className="font-bold text-textMuted block uppercase text-[10px] tracking-wider">Your Full Name</label>
                  <input 
                    type="text" 
                    value={userBidName}
                    onChange={(e) => setUserBidName(e.target.value)}
                    required
                    placeholder="Enter name"
                    className="w-full pro-input px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-textMuted block uppercase text-[10px] tracking-wider">Bid Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-textMuted font-bold">₹</span>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                      min={minimumBid}
                      step={5000}
                      placeholder={minimumBid.toString()}
                      className="w-full pro-input pl-7 pr-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 border border-red-200 text-red-600 bg-red-50 text-[10px] rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 border border-emerald-200 text-emeraldSuccess bg-emerald-50 text-[10px] rounded-lg">
                    {successMsg}
                  </div>
                )}

                {rivalActivityMsg && (
                  <div className="p-3 border border-blue-200 text-brandIndigo bg-blue-50 text-[10px] font-bold rounded-lg animate-pulse">
                    {rivalActivityMsg}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full btn-indigo py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5px]" /> Submit Bid Offer
                </button>
              </form>
            )}

            {/* Bids Log */}
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <span className="text-[10px] font-bold text-textMuted uppercase block tracking-wider">Bidding History Ledger</span>
              
              <div className="space-y-2.5 max-h-40 overflow-y-auto divide-y divide-gray-150">
                {car.bids.length === 0 ? (
                  <p className="text-xs italic text-textMuted text-center py-2">No bids submitted yet.</p>
                ) : (
                  car.bids.map(bid => (
                    <div key={bid.id} className="pt-2.5 flex justify-between text-[11px] font-semibold uppercase">
                      <div>
                        <span className="font-bold text-textMain">{bid.bidder}</span>
                        <span className="text-[9px] text-textMuted block font-normal mt-0.5">
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="font-bold text-brandIndigo">₹{bid.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
export default CarDetail;
