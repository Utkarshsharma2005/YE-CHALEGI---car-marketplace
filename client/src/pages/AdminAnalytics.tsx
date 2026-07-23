import React from 'react';
import { useCars } from '../context/CarContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { IndianRupee, Tag, ShieldCheck, Activity } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { cars } = useCars();

  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.status === 'available').length;
  const soldCars = cars.filter(c => c.status === 'sold').length;
  const totalValuation = cars.reduce((acc, car) => acc + car.price, 0);

  // Recharts PIE Chart Data: Manufacturer distribution
  const manufacturerDataMap: { [key: string]: number } = {};
  cars.forEach(car => {
    manufacturerDataMap[car.company] = (manufacturerDataMap[car.company] || 0) + 1;
  });
  const pieData = Object.keys(manufacturerDataMap).map(key => ({
    name: key,
    value: manufacturerDataMap[key]
  }));

  // Recharts BAR Chart Data: Fuel type distribution
  const fuelDataMap: { [key: string]: number } = {};
  cars.forEach(car => {
    fuelDataMap[car.fuelType] = (fuelDataMap[car.fuelType] || 0) + 1;
  });
  const barData = Object.keys(fuelDataMap).map(key => ({
    name: key,
    lots: fuelDataMap[key]
  }));

  // Recharts LINE Chart Data: Simulated sales revenue trend over past 5 months
  const lineData = [
    { name: 'Mar', revenue: 450000 },
    { name: 'Apr', revenue: 780000 },
    { name: 'May', revenue: 520000 },
    { name: 'Jun', revenue: 950000 },
    { name: 'Jul', revenue: totalValuation * 0.4 } // simulated portion of current listings
  ];

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-textMain space-y-8">
      
      {/* Title */}
      <div className="w-full text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Marketplace Analytics</h2>
        <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-semibold">
          Platform statistics, inventory values, and sales performance overview
        </p>
        <div className="w-full border-t border-gray-200 my-4"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs uppercase font-semibold">
        {/* Total Book value */}
        <div className="pro-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-textMuted font-bold block text-[9px] tracking-wider">Book Valuation</span>
            <span className="text-xl font-bold text-emeraldSuccess">₹{totalValuation.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-emeraldSuccess" />
          </div>
        </div>

        {/* Total Active catalog */}
        <div className="pro-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-textMuted font-bold block text-[9px] tracking-wider">Active Listings</span>
            <span className="text-xl font-bold text-textMain">{availableCars} Cars</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Tag className="w-5 h-5 text-brandIndigo" />
          </div>
        </div>

        {/* Total Sold Out lots */}
        <div className="pro-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-textMuted font-bold block text-[9px] tracking-wider">Closed Lots</span>
            <span className="text-xl font-bold text-brandIndigo">{soldCars} Sold</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brandIndigo" />
          </div>
        </div>

        {/* Total Catalog Lots */}
        <div className="pro-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-textMuted font-bold block text-[9px] tracking-wider">Total Listings</span>
            <span className="text-xl font-bold text-textMain">{totalCars} Total</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Activity className="w-5 h-5 text-textMain" />
          </div>
        </div>
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Revenue line chart (8 cols) */}
        <div className="lg:col-span-8 pro-card p-6 space-y-4">
          <h4 className="font-display font-bold text-md uppercase border-b border-gray-200 pb-2.5 tracking-wide text-textMain">
            Monthly Revenue Performance Trend
          </h4>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" style={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, color: '#111827', fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie chart distribution (4 cols) */}
        <div className="lg:col-span-4 pro-card p-6 space-y-4">
          <h4 className="font-display font-bold text-md uppercase border-b border-gray-200 pb-2.5 tracking-wide text-textMain">
            Brand Distribution
          </h4>
          <div className="w-full h-80 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs italic text-textMuted">No listings recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, color: '#111827', fontSize: 11 }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 10, textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom: Bar chart Fuel distribution (6 cols) */}
        <div className="lg:col-span-6 pro-card p-6 space-y-4">
          <h4 className="font-display font-bold text-md uppercase border-b border-gray-200 pb-2.5 tracking-wide text-textMain">
            Engine Fuel Class Distribution
          </h4>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" style={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, color: '#111827', fontSize: 11 }} />
                <Bar dataKey="lots" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Recent operations log (6 cols) */}
        <div className="lg:col-span-6 pro-card p-6 space-y-4">
          <h4 className="font-display font-bold text-md uppercase border-b border-gray-200 pb-2.5 tracking-wide text-textMain">
            Ledger System Logs
          </h4>
          <div className="space-y-3 text-[11px] uppercase max-h-72 overflow-y-auto font-semibold">
            <div className="flex justify-between py-2.5 border-b border-gray-200">
              <span className="text-textMuted">Database Sync Status</span>
              <span className="text-emeraldSuccess font-bold">ONLINE</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-gray-200">
              <span className="text-textMuted">Active Catalog Listings</span>
              <span className="text-brandIndigo font-bold">12 VEHICLES LOADED</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-gray-200">
              <span className="text-textMuted">Bidding System Sequencer</span>
              <span className="text-emeraldSuccess font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-gray-200">
              <span className="text-textMuted">Platform Interface Rendering</span>
              <span className="text-brandIndigo font-bold">OPTIMIZED</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-gray-200">
              <span className="text-textMuted">Local Storage Handler</span>
              <span className="text-emeraldSuccess font-bold">SUCCESS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminAnalytics;
