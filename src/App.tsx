import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PersonaBar } from './components/PersonaBar';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { ShowcaseVideos } from './components/ShowcaseVideos';
import { PartnerWebpage } from './components/PartnerWebpage';
import { BoutiquesView } from './components/BoutiquesView';
import { PartnerDashboard } from './components/PartnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TwoFactorSetup } from './components/TwoFactorSetup';
import { OrdersView } from './components/OrdersView';
import { LiveChatWidget } from './components/LiveChatWidget';
import { CheckoutModal } from './components/CheckoutModal';
import { LoginModal } from './components/LoginModal';
import { FulfilmentModal } from './components/FulfilmentModal';
import { Footer } from './components/Footer';
import { ContactPage } from './components/ContactPage';
import { AboutPage } from './components/AboutPage';

const AppContent: React.FC = () => {
  const { currentView, currentUser, selectedPartnerId, partners } = useApp();

  const dashboardPartnerId = selectedPartnerId || currentUser.partnerId;
  const dashboardPartnerExists = partners.some(p => p.id === dashboardPartnerId);

  const renderDashboard = () => {
    if (currentUser.role === 'admin' && !dashboardPartnerExists) return <AdminDashboard />;
    if (currentUser.role !== 'client' && dashboardPartnerExists) return <PartnerDashboard />;
    return <ProductCatalog />;
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] flex flex-col font-sans selection:bg-[#c5a059] selection:text-black">
      <PersonaBar />
      <Navbar />

      <main className="flex-1">
        {currentUser.role === 'admin' && currentUser.twoFactor === false ? (
          <TwoFactorSetup />
        ) : (
          <>
            {currentView === 'catalog' && (
              <>
                <ShowcaseVideos />
                <ProductCatalog />
              </>
            )}
            {currentView === 'partner' && (partners.some(p => p.id === selectedPartnerId) ? <PartnerWebpage /> : <BoutiquesView />)}
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'orders' && <OrdersView />}
            {currentView === 'contact' && <ContactPage />}
            {currentView === 'about' && <AboutPage />}
          </>
        )}
      </main>

      <Footer />

      <LiveChatWidget />
      <CheckoutModal />
      <LoginModal />
      <FulfilmentModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
