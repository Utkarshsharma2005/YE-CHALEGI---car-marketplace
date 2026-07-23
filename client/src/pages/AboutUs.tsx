import React from 'react';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 text-textMain">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">About Ye Chalegi</h2>
        <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-semibold">
          Providing Transparent peer-to-peer pre-owned car trading
        </p>
        <div className="w-full border-t border-gray-200 my-4"></div>
      </div>

      {/* Main Content */}
      <div className="pro-card p-8 space-y-6 text-justify leading-relaxed text-sm text-textMuted">
        <h3 className="font-display font-bold text-lg border-b border-gray-200 pb-3 text-center text-textMain tracking-wide uppercase">
          Our Marketplace Mission
        </h3>
        
        <p>
          Founded in 2026, **YE CHALEGI** is designed around a single corporate goal: making the used car buying and selling process direct, transparent, and completely fair. We provide a platform for sellers to secure competitive bids on their cars, and buyers to negotiate deals in real time.
        </p>
        
        <p>
          Standard catalog sites treat used cars as clean statistics and add substantial middleman fees. We offer detailed 9-field inspection templates, open bidding histories, and automated live status registers so that customers can transact with confidence.
        </p>

        <h4 className="font-display font-bold text-sm uppercase pt-4 border-b border-gray-200 pb-2 text-textMain tracking-wide">
          Our Operational Standards
        </h4>
        <ul className="list-decimal pl-5 space-y-3 text-xs uppercase text-textMain font-semibold">
          <li>
            <strong>Listing Verification:</strong> Every listing is recorded under a rigid 9-field specification sheet to ensure listing integrity.
          </li>
          <li>
            <strong>Public Bid Trail:</strong> All offers on any lot are logged transparently on our public bidding ledgers.
          </li>
          <li>
            <strong>Direct Communication:</strong> Connecting buyers and sellers without dealership brokerage fees.
          </li>
        </ul>

        <p className="pt-4 font-normal">
          Whether you want to trade your car or explore certified pre-owned listings in the catalog directory, YE CHALEGI provides direct, reliable support.
        </p>

        <div className="pt-6 flex justify-between items-center text-xs font-semibold text-gray-400">
          <span>YE CHALEGI MARKETPLACE BOARD</span>
          <span>ESTD. 2026</span>
        </div>
      </div>
    </div>
  );
};
export default AboutUs;
