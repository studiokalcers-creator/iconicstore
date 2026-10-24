import React from 'react';
import TradeInCalculator from './TradeInCalculator';
import Footer from './Footer';

export default function TradeInView({ 
  branches = [], 
  tradeInValuations,
  onOpenStaffLogin, 
  setCurrentTab 
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '36px 24px 60px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        <TradeInCalculator 
          branches={branches} 
          tradeInValuations={tradeInValuations}
        />
      </main>

      {/* Universal Customer Footer */}
      <Footer onOpenStaffLogin={onOpenStaffLogin} setCurrentTab={setCurrentTab} />

    </div>
  );
}
