import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 px-4 md:px-8 py-12 mt-20 text-textMuted font-body">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand details */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brandIndigo flex items-center justify-center shadow-sm">
              <Car className="w-4 h-4 text-white stroke-[2.5px]" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-textMain uppercase">
              YE CHALEGI
            </span>
          </div>
          <p className="text-xs text-textMuted leading-relaxed max-w-sm">
            YE CHALEGI is a certified pre-owned used car marketplace. List your vehicles for competitive market pricing, verify inspection sheets, and transact securely through direct client auctions.
          </p>
          <div className="text-[10px] text-gray-400 font-semibold tracking-wider pt-4 uppercase">
            © {new Date().getFullYear()} YE CHALEGI CERTIFIED EXCHANGE. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* Categories list */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-textMain mb-4">
            Marketplace Directory
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link to="/" className="hover:text-brandIndigo transition-colors">Home Page</Link></li>
            <li><Link to="/listings" className="hover:text-brandIndigo transition-colors">Explore Vehicles</Link></li>
            <li><Link to="/about" className="hover:text-brandIndigo transition-colors">About Marketplace</Link></li>
            <li><Link to="/contact" className="hover:text-brandIndigo transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Declarations */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-textMain mb-4">
            Disclosure
          </h4>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            All listings require standard inspection verification according to our 9 core catalog parameters. Buyers are recommended to complete on-site test drives before final invoice settlement.
          </p>
        </div>

      </div>
    </footer>
  );
};
export default Footer;
