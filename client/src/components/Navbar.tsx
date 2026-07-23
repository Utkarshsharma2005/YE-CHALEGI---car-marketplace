import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Car, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 w-full z-50 px-4 md:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Sleek corporate brand logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brandIndigo flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Car className="w-5.5 h-5.5 text-white stroke-[2.5px]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-textMain uppercase">
              Ye Chalegi
            </h1>
            <span className="text-[10px] font-body tracking-wider text-textMuted uppercase block -mt-1 font-semibold">
              Certified Pre-Owned Exchange
            </span>
          </div>
        </NavLink>

        {/* Corporate Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-textMuted">
          {isAdminPath ? (
            <>
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => `hover:text-brandIndigo transition-colors flex items-center gap-1.5 ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/add" 
                className={({ isActive }) => `hover:text-brandIndigo transition-colors flex items-center gap-1.5 ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                Register Vehicle
              </NavLink>
              <NavLink 
                to="/admin/cars" 
                className={({ isActive }) => `hover:text-brandIndigo transition-colors flex items-center gap-1.5 ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                Inventory List
              </NavLink>
            </>
          ) : (
            <>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => `hover:text-brandIndigo transition-colors ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                Home
              </NavLink>
              <NavLink 
                to="/listings" 
                className={({ isActive }) => `hover:text-brandIndigo transition-colors ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                Browse Cars
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => `hover:text-brandIndigo transition-colors ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                About Us
              </NavLink>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => `hover:text-brandIndigo transition-colors ${isActive ? 'text-brandIndigo font-bold border-b-2 border-brandIndigo pb-0.5' : ''}`}
              >
                Contact
              </NavLink>
            </>
          )}
        </nav>

        {/* Desk toggles */}
        <div className="flex items-center gap-4">
          {isAdminPath ? (
            <NavLink 
              to="/" 
              className="btn-outline px-4 py-2 text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              Customer View
            </NavLink>
          ) : (
            <NavLink 
              to="/admin" 
              className="btn-indigo px-4 py-2 text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5px]" />
              Admin Portal
            </NavLink>
          )}
        </div>

      </div>
    </header>
  );
};
export default Navbar;
