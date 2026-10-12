import React, { useState } from 'react';
import { TabType, StockInfo, NewsItem, PaperTrade, NotificationItem, UserProfile } from './types';
import { INITIAL_NOTIFICATIONS } from './data/mockData';
import { getStockTelemetry } from './data/stocksUniverse';
import { formatRupees } from './utils/currency';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ChartsView } from './components/ChartsView';
import { SentimentView } from './components/SentimentView';
import { SignalsView } from './components/SignalsView';
import { ModelsView } from './components/ModelsView';
import { SimulateTradeModal } from './components/SimulateTradeModal';
import { CustomRangeModal } from './components/CustomRangeModal';
import { NotificationsModal } from './components/NotificationsModal';
import { UserModal } from './components/UserModal';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { ArticleModal } from './components/ArticleModal';
import { GmailModal } from './components/GmailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentTicker, setCurrentTicker] = useState<string>('NVDA');

  // User Profile state
  const [user, setUser] = useState<UserProfile>({
    name: 'Abhi',
    email: 'abhiabhi300912@gmail.com',
    handle: '@abhi_quant',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEc7R5ZayzxdMe5khnNsqG_15F7cqa2LH-ruYuqRrUyz-u4xxtXKm67cRRSI3xOylIwSIn-R80Qrl657Szkaf3OBHXsn65_vi3yUlev6AEf5v8eAwb_2GIlK7sqA3WD4mg65rFQGMVypTIMqiO4-TazHnO2zUfU1u-Nq8Yd2ARDJmkopFmJVjmZm__c7AEt2Uru-gLFab01_1nRrxn7zpgjVEtthGfpXrVK8h1UvkB0ChNOSYq9Dcn8g',
    tier: 'StockZen Pro',
    bio: 'Algorithmic momentum trader & FinBERT sentiment specialist analyzing 5,000+ US equities on NYSE/NASDAQ.',
    riskTolerance: 'Quantitative Dynamic',
    defaultOrderSize: 25,
    autoStopLossPercent: -5.0,
    notificationsEnabled: true,
    hapticFeedback: true,
  });

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  // Paper portfolio state
  const [paperCash, setPaperCash] = useState<number>(100000.0);
  const [holdings, setHoldings] = useState<Record<string, number>>({
    NVDA: 30,
    AAPL: 15,
  });
  const [trades, setTrades] = useState<PaperTrade[]>([
    {
      id: 't-1',
      ticker: 'NVDA',
      type: 'BUY',
      quantity: 30,
      price: 124.8,
      total: 3744.0,
      timestamp: 'Today, 09:30 EST',
    },
    {
      id: 't-2',
      ticker: 'AAPL',
      type: 'BUY',
      quantity: 15,
      price: 226.0,
      total: 3390.0,
      timestamp: 'Today, 10:15 EST',
    },
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modal visibility states
  const [tradeModal, setTradeModal] = useState<{ isOpen: boolean; type: 'BUY' | 'SELL' }>({
    isOpen: false,
    type: 'BUY',
  });
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Layout mode: mobile view or responsive expanded view
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Real-time stock telemetry computed across 5,000+ stocks
  const currentStock: StockInfo = getStockTelemetry(currentTicker);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'charts' && currentTicker === 'NVDA') {
      setCurrentTicker('AAPL');
    }
    if (tab === 'sentiment' && (currentTicker === 'AAPL' || currentTicker === 'NVDA')) {
      setCurrentTicker('TSLA');
    }
    if ((tab === 'dashboard' || tab === 'signals') && currentTicker === 'TSLA') {
      setCurrentTicker('NVDA');
    }
  };

  const handleSelectStock = (ticker: string) => {
    setCurrentTicker(ticker.toUpperCase());
  };

  const handleExecuteTrade = (ticker: string, type: 'BUY' | 'SELL', shares: number, price: number) => {
    const total = shares * price;
    if (type === 'BUY') {
      setPaperCash((prev) => prev - total);
      setHoldings((prev) => ({
        ...prev,
        [ticker]: (prev[ticker] || 0) + shares,
      }));
    } else {
      setPaperCash((prev) => prev + total);
      setHoldings((prev) => ({
        ...prev,
        [ticker]: Math.max(0, (prev[ticker] || 0) - shares),
      }));
    }

    const newTrade: PaperTrade = {
      id: `trade-${Date.now()}`,
      ticker,
      type,
      quantity: shares,
      price,
      total,
      timestamp: 'Just now',
    };
    setTrades((prev) => [...prev, newTrade]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Simulated ${type} Order Filled`,
      message: `${shares} shares of ${ticker} executed at ${formatRupees(price)} (${formatRupees(total)} total).`,
      type: type === 'BUY' ? 'bullish' : 'alert',
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleResetPortfolio = () => {
    setPaperCash(100000.0);
    setHoldings({});
    setTrades([]);
    setIsProfileOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0f131d] text-[#dfe2f1] flex flex-col font-sans selection:bg-[#38bdf8]/30 selection:text-[#8ed5ff]">
      {/* Top Universal App Header */}
      <Header
        activeTab={activeTab}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSearch={() => setIsSymbolSearchOpen(true)}
        onOpenGmail={() => setIsGmailOpen(true)}
        user={user}
        isLive={true}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pt-16 pb-20 w-full flex flex-col items-center">
        {/* Device Frame Wrapper (toggleable for desktop vs exact mobile viewport) */}
        <div className={`w-full ${deviceFrameMode ? 'max-w-[430px] my-4 shadow-2xl rounded-3xl border border-[#262a35] overflow-hidden bg-[#0f131d]' : 'max-w-2xl'}`}>
          {activeTab === 'dashboard' && (
            <DashboardView
              currentStock={currentStock}
              onSelectStock={handleSelectStock}
              onOpenArticle={(news) => setSelectedArticle(news)}
              onSimulateTrade={(type) => setTradeModal({ isOpen: true, type })}
              onOpenSearchModal={() => setIsSymbolSearchOpen(true)}
            />
          )}

          {activeTab === 'charts' && (
            <ChartsView
              currentStock={currentStock}
              onOpenCustomModal={() => setIsCustomRangeOpen(true)}
              onSimulateTrade={(type) => setTradeModal({ isOpen: true, type })}
            />
          )}

          {activeTab === 'sentiment' && (
            <SentimentView
              currentStock={currentStock}
              onSelectStock={handleSelectStock}
              onOpenArticle={(news) => setSelectedArticle(news)}
            />
          )}

          {activeTab === 'signals' && (
            <SignalsView
              currentStock={currentStock}
              onSelectStock={handleSelectStock}
              onOpenSymbolSearch={() => setIsSymbolSearchOpen(true)}
            />
          )}

          {activeTab === 'models' && <ModelsView />}
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Floating Device Frame Mode Switcher for Desktop */}
      <aside aria-label="Display Viewport Mode" className="fixed bottom-20 right-4 z-30 hidden md:flex items-center gap-1.5 p-1 bg-[#171b26]/90 backdrop-blur-md rounded-full border border-[#262a35] shadow-lg">
        <button
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-data-mono-sm text-[#bdc8d1] hover:text-[#dfe2f1] bg-[#262a35]"
          title="Toggle phone container frame"
        >
          <span className="material-symbols-outlined text-[14px]">
            {deviceFrameMode ? 'fullscreen' : 'smartphone'}
          </span>
          <span>{deviceFrameMode ? 'Full Width' : 'Phone Frame'}</span>
        </button>
      </aside>

      {/* Interactive Modals */}
      <SimulateTradeModal
        isOpen={tradeModal.isOpen}
        onClose={() => setTradeModal({ isOpen: false, type: 'BUY' })}
        type={tradeModal.type}
        stock={currentStock}
        availableCash={paperCash}
        currentShares={holdings[currentStock.ticker] || 0}
        onExecuteTrade={handleExecuteTrade}
      />

      <CustomRangeModal
        isOpen={isCustomRangeOpen}
        onClose={() => setIsCustomRangeOpen(false)}
        onApply={(start, end) => {
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: 'Custom Time Horizon Applied',
            message: `Backtest window recalibrated to ${start} through ${end}.`,
            type: 'system',
            time: 'Just now',
            read: false,
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      <UserModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        cashBalance={paperCash}
        holdings={holdings}
        trades={trades}
        onResetPortfolio={handleResetPortfolio}
        onOpenGmail={() => setIsGmailOpen(true)}
      />

      <GmailModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        currentStock={currentStock}
      />

      <SymbolSearchModal
        isOpen={isSymbolSearchOpen}
        onClose={() => setIsSymbolSearchOpen(false)}
        onSelect={handleSelectStock}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
