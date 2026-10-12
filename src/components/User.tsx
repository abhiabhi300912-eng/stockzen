import React, { useState, useRef } from 'react';
import { PaperTrade, UserProfile } from '../types';
import { formatRupees } from '../utils/currency';

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  cashBalance: number;
  holdings: Record<string, number>;
  trades: PaperTrade[];
  onResetPortfolio: () => void;
  onOpenGmail?: () => void;
}

export const PRESET_AVATARS = [
  {
    id: 'default',
    label: 'Lead Analyst',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEc7R5ZayzxdMe5khnNsqG_15F7cqa2LH-ruYuqRrUyz-u4xxtXKm67cRRSI3xOylIwSIn-R80Qrl657Szkaf3OBHXsn65_vi3yUlev6AEf5v8eAwb_2GIlK7sqA3WD4mg65rFQGMVypTIMqiO4-TazHnO2zUfU1u-Nq8Yd2ARDJmkopFmJVjmZm__c7AEt2Uru-gLFab01_1nRrxn7zpgjVEtthGfpXrVK8h1UvkB0ChNOSYq9Dcn8g',
    badge: 'Pro',
  },
  {
    id: 'quant-m1',
    label: 'Senior Quant Lead',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    badge: 'Quant',
  },
  {
    id: 'quant-f1',
    label: 'Financial Engineer',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    badge: 'FinEng',
  },
  {
    id: 'quant-m2',
    label: 'Algorithmic Trader',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    badge: 'Algo',
  },
  {
    id: 'quant-f2',
    label: 'Data Scientist',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    badge: 'ML/AI',
  },
  {
    id: 'quant-m3',
    label: 'Portfolio Manager',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    badge: 'PM',
  },
  {
    id: 'bull-trader',
    label: 'Alpha Bull',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80',
    badge: 'Bull',
  },
  {
    id: 'cyber-neural',
    label: 'Neural Bot v4',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=256&q=80',
    badge: 'AI Core',
  },
];

export const User: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  cashBalance,
  holdings,
  trades,
  onResetPortfolio,
  onOpenGmail,
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'portfolio' | 'history'>('user');
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  // Edit form state
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [riskTolerance, setRiskTolerance] = useState(user.riskTolerance);
  const [defaultOrderSize, setDefaultOrderSize] = useState(user.defaultOrderSize);
  const [autoStopLoss, setAutoStopLoss] = useState(user.autoStopLossPercent);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      handle,
      bio,
      riskTolerance,
      defaultOrderSize,
      autoStopLossPercent: autoStopLoss,
    });
    setIsEditing(false);
    showNotification('User profile settings saved successfully!');
  };

  // Profile picture upload from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setPreviewAvatar(base64);
          onUpdateUser({ avatarUrl: base64 });
          setIsPhotoPickerOpen(false);
          showNotification('Profile picture updated from file!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile picture apply from URL
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setPreviewAvatar(customAvatarUrl.trim());
      onUpdateUser({ avatarUrl: customAvatarUrl.trim() });
      setCustomAvatarUrl('');
      setIsPhotoPickerOpen(false);
      showNotification('Profile picture updated from URL!');
    }
  };

  // Select preset avatar
  const handleSelectPreset = (url: string) => {
    setPreviewAvatar(url);
    onUpdateUser({ avatarUrl: url });
    setIsPhotoPickerOpen(false);
    showNotification('Profile picture updated!');
  };

  const activeHoldingsCount = Object.keys(holdings).filter((k) => holdings[k] > 0).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      {/* Hidden file input for device photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full max-w-lg bg-[#1c1f2a] rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#262a35] space-y-3.5 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#262a35] pb-3">
          <div className="flex items-center gap-3">
            {/* Avatar with Interactive Camera badge */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(!isPhotoPickerOpen)}
                className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-transform active:scale-95"
                title="Change profile picture"
              >
                <img
                  src={previewAvatar || user.avatarUrl}
                  alt={user.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-[#38bdf8]/60 shadow-md group-hover:brightness-75 transition-all"
                />
                {/* Camera Overlay Icon */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-[20px]">
                    photo_camera
                  </span>
                </div>
              </button>
              {/* Camera Action Pill Badge */}
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(!isPhotoPickerOpen)}
                aria-label="Change profile picture"
                title="Change profile picture"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#38bdf8] text-[#001e2c] border-2 border-[#1c1f2a] flex items-center justify-center shadow hover:scale-110 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-[11px] font-bold">photo_camera</span>
              </button>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline-sm text-[17px] text-[#dfe2f1] font-bold">
                  {user.name}
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-[#38bdf8]/20 text-[#8ed5ff] font-data-mono-sm text-[9px] font-bold border border-[#38bdf8]/30">
                  {user.tier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-data-mono-sm text-[#bdc8d1]">
                <span>{user.handle}</span>
                <span>•</span>
                <span className="text-[#8ed5ff]">{user.email}</span>
              </div>
              {/* Quick photo change button link */}
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(!isPhotoPickerOpen)}
                className="text-[10px] font-data-mono-sm text-[#38bdf8] hover:underline flex items-center gap-1 mt-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">add_a_photo</span>
                <span>{isPhotoPickerOpen ? 'Close photo picker' : 'Change Profile Picture'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#bdc8d1] hover:text-[#dfe2f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Profile Picture Option Panel */}
        {isPhotoPickerOpen && (
          <div className="bg-[#171b26] p-3.5 rounded-xl border border-[#38bdf8]/40 space-y-3 animate-fadeIn shadow-lg">
            <div className="flex justify-between items-center border-b border-[#262a35] pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">
                  account_circle
                </span>
                <span className="font-headline-sm text-[14px] text-[#dfe2f1] font-bold">
                  Profile Picture Options
                </span>
              </div>
              <button
                onClick={() => setIsPhotoPickerOpen(false)}
                className="text-[#87929a] hover:text-[#dfe2f1] text-[11px]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Option 1 & 2: Upload from device or Reset */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-lg bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] font-data-mono-sm text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-[#313540] active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">
                  upload_file
                </span>
                <span>Upload From Device</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(PRESET_AVATARS[0].url)}
                className="py-2 px-3 rounded-lg bg-[#1c1f2a] hover:bg-[#262a35] text-[#bdc8d1] font-data-mono-sm text-[11px] flex items-center justify-center gap-1 transition-all border border-[#262a35]"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset Default</span>
              </button>
            </div>

            {/* Option 3: Select from Quant Trader Presets */}
            <div className="space-y-1.5">
              <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold block">
                CHOOSE PRESET AVATAR:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const isCurrent = (previewAvatar || user.avatarUrl) === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative rounded-full p-0.5 transition-all active:scale-90 group flex flex-col items-center ${
                        isCurrent
                          ? 'ring-2 ring-[#38bdf8] scale-105'
                          : 'hover:ring-2 hover:ring-[#8ed5ff]/50'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#38bdf8] flex items-center justify-center text-[#001e2c]">
                          <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 4: Custom Image Link */}
            <form onSubmit={handleApplyUrl} className="space-y-1.5 pt-1 border-t border-[#262a35]">
              <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold block">
                OR PASTE IMAGE URL:
              </span>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 bg-[#1c1f2a] border border-[#262a35] rounded-lg px-2.5 py-1 text-[11px] text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8]"
                />
                <button
                  type="submit"
                  disabled={!customAvatarUrl.trim()}
                  className="px-3 py-1 bg-[#38bdf8] text-[#001e2c] font-data-mono-sm text-[11px] font-bold rounded-lg disabled:opacity-40 hover:bg-[#8ed5ff] transition-all"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex p-1 bg-[#171b26] rounded-xl gap-1 border border-[#262a35]">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded-lg transition-all ${
              activeTab === 'user'
                ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            User Details
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded-lg transition-all ${
              activeTab === 'portfolio'
                ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            Portfolio ({formatRupees(cashBalance)})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            Trade Logs ({trades.length})
          </button>
        </div>

        {saveToast && (
          <div className="p-2 rounded-lg bg-[#30c88f]/20 border border-[#56e5a9]/50 text-[#56e5a9] font-data-mono-sm text-[11px] flex items-center gap-1.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            {saveToast}
          </div>
        )}

        {/* TAB 1: User Account & Profile Preferences */}
        {activeTab === 'user' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {!isEditing ? (
              <div className="space-y-3">
                {/* Account Details Card */}
                <div className="bg-[#171b26] p-3 rounded-xl border border-[#262a35] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold">
                      USER ACCOUNT DETAILS
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-2 py-0.5 rounded bg-[#262a35] hover:bg-[#313540] text-[#8ed5ff] font-data-mono-sm text-[10px] flex items-center gap-1 transition-colors border border-[#313540]"
                    >
                      <span className="material-symbols-outlined text-[12px]">edit</span>
                      Edit User
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-data-mono-sm text-[11px]">
                    <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60">
                      <span className="text-[#87929a] block text-[10px]">FULL NAME</span>
                      <span className="text-[#dfe2f1] font-semibold">{user.name}</span>
                    </div>
                    <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60">
                      <span className="text-[#87929a] block text-[10px]">QUANT HANDLE</span>
                      <span className="text-[#dfe2f1] font-semibold">{user.handle}</span>
                    </div>
                    <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60 col-span-2">
                      <span className="text-[#87929a] block text-[10px]">REGISTERED EMAIL</span>
                      <span className="text-[#8ed5ff] font-semibold">{user.email}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60">
                    <span className="text-[#87929a] block text-[10px] font-label-caps">
                      STRATEGY PHILOSOPHY / BIO
                    </span>
                    <p className="font-body-sm text-[12px] text-[#bdc8d1] mt-0.5 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                </div>

                {/* Algorithmic Risk Configuration Card */}
                <div className="bg-[#171b26] p-3 rounded-xl border border-[#262a35] space-y-2">
                  <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold block">
                    RISK PARAMETERS & DEFAULTS
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-data-mono-sm text-[11px]">
                    <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60 flex flex-col">
                      <span className="text-[#87929a] text-[10px]">RISK PROFILE</span>
                      <span className="text-[#56e5a9] font-bold mt-0.5">{user.riskTolerance}</span>
                    </div>
                    <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60 flex flex-col">
                      <span className="text-[#87929a] text-[10px]">DEFAULT LOT</span>
                      <span className="text-[#8ed5ff] font-bold mt-0.5">{user.defaultOrderSize} Shares</span>
                    </div>
                    <div className="p-2 rounded bg-[#1c1f2a] border border-[#262a35]/60 flex flex-col">
                      <span className="text-[#87929a] text-[10px]">STOP-LOSS</span>
                      <span className="text-[#ffb4ab] font-bold mt-0.5">{user.autoStopLossPercent}% Limit</span>
                    </div>
                  </div>
                </div>

                {/* API & Webhook Connection */}
                <div className="bg-[#171b26] p-3 rounded-xl border border-[#262a35] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#38bdf8]/15 flex items-center justify-center text-[#8ed5ff]">
                      <span className="material-symbols-outlined text-[18px]">key</span>
                    </div>
                    <div>
                      <span className="font-body-md text-[12px] font-semibold text-[#dfe2f1] block">
                        StockZen Private API Key
                      </span>
                      <span className="font-data-mono-sm text-[10px] text-[#bdc8d1]">
                        sk_live_quant_••••••••••••984a
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#30c88f]/20 text-[#56e5a9] font-data-mono-sm text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Google Workspace / Gmail Integration Card */}
                <div className="bg-[#171b26] p-3 rounded-xl border border-[#262a35] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5 border border-white/15">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4.9 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="font-body-md text-[12px] font-semibold text-[#dfe2f1] block">
                        Google Workspace • Gmail
                      </span>
                      <span className="font-data-mono-sm text-[10px] text-[#bdc8d1]">
                        Send stock research, alerts & read trade notifications
                      </span>
                    </div>
                  </div>
                  {onOpenGmail && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGmail();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#ea4335]/20 hover:bg-[#ea4335]/30 text-[#ff8e85] font-data-mono-sm text-[10px] font-bold border border-[#ea4335]/40 transition-colors"
                    >
                      Open Gmail
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Inline Edit Profile Form */
              <form onSubmit={handleSaveProfile} className="space-y-3 bg-[#171b26] p-3 rounded-xl border border-[#262a35]">
                <div className="flex justify-between items-center border-b border-[#262a35] pb-1.5">
                  <span className="font-headline-sm text-[14px] text-[#dfe2f1] font-bold">
                    Edit User Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-[#87929a] hover:text-[#dfe2f1] text-[11px] font-data-mono-sm"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2 text-[12px]">
                  {/* Photo shortcut inside edit form */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#1c1f2a] border border-[#262a35]/60">
                    <div className="flex items-center gap-2">
                      <img
                        src={previewAvatar || user.avatarUrl}
                        alt="Avatar preview"
                        className="w-9 h-9 rounded-full object-cover border border-[#38bdf8]"
                      />
                      <div>
                        <span className="text-[#dfe2f1] font-semibold block text-[11px]">
                          Profile Picture
                        </span>
                        <span className="text-[#87929a] text-[10px]">
                          Upload file or choose avatar
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPhotoPickerOpen(true)}
                      className="px-2.5 py-1 bg-[#262a35] hover:bg-[#313540] text-[#38bdf8] text-[11px] font-bold rounded-lg border border-[#313540]"
                    >
                      Change Photo
                    </button>
                  </div>

                  <div>
                    <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-2.5 py-1.5 text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                      User Handle
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-2.5 py-1.5 text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] font-data-mono-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                      Trading Bio / Philosophy
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-2.5 py-1.5 text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                        Risk Profile
                      </label>
                      <select
                        value={riskTolerance}
                        onChange={(e) => setRiskTolerance(e.target.value as any)}
                        className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-2 py-1.5 text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] text-[11px]"
                      >
                        <option value="Conservative">Conservative</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Aggressive">Aggressive</option>
                        <option value="Quantitative Dynamic">Quantitative Dynamic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#bdc8d1] font-label-caps text-[10px] mb-1">
                        Default Order Lot
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={defaultOrderSize}
                        onChange={(e) => setDefaultOrderSize(parseInt(e.target.value) || 10)}
                        className="w-full bg-[#1c1f2a] border border-[#262a35] rounded-lg px-2.5 py-1.5 text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] font-data-mono-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#001e2c] font-data-mono-md text-[12px] font-bold transition-all shadow-md active:scale-95"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg bg-[#262a35] text-[#dfe2f1] font-data-mono-md text-[12px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Portfolio & Balances in Rupees */}
        {activeTab === 'portfolio' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Paper Account Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-col">
                <span className="font-label-caps text-[10px] text-[#bdc8d1]">AVAILABLE CASH</span>
                <span className="font-data-mono-lg text-[18px] text-[#dfe2f1] font-bold">
                  {formatRupees(cashBalance)}
                </span>
                <span className="font-data-mono-sm text-[10px] text-[#56e5a9] mt-0.5">
                  Initial Capital: {formatRupees(100000)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-col">
                <span className="font-label-caps text-[10px] text-[#bdc8d1]">PORTFOLIO POSITIONS</span>
                <span className="font-data-mono-lg text-[18px] text-[#8ed5ff] font-bold">
                  {activeHoldingsCount} Equities
                </span>
                <span className="font-data-mono-sm text-[10px] text-[#bdc8d1] mt-0.5">
                  Multi-Factor Spread
                </span>
              </div>
            </div>

            {/* Current Positions */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold">
                  ACTIVE HOLDINGS ({activeHoldingsCount})
                </span>
                <span className="font-data-mono-sm text-[10px] text-[#56e5a9]">REAL-TIME PRICED</span>
              </div>
              <div className="bg-[#171b26] rounded-xl p-2.5 max-h-48 overflow-y-auto space-y-1 border border-[#262a35]">
                {activeHoldingsCount === 0 ? (
                  <p className="font-data-mono-sm text-[11px] text-[#bdc8d1] text-center py-4">
                    No active stock positions. Tap &apos;Simulate Buy&apos; on any of the 5,000+ stocks to trade!
                  </p>
                ) : (
                  Object.entries(holdings)
                    .filter(([_, qty]) => qty > 0)
                    .map(([ticker, qty]) => (
                      <div
                        key={ticker}
                        className="flex justify-between items-center text-[12px] font-data-mono-sm p-2 rounded-lg bg-[#1c1f2a] border border-[#262a35]/60 hover:border-[#38bdf8]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#262a35] flex items-center justify-center font-bold text-[#8ed5ff] text-[10px]">
                            {ticker.slice(0, 2)}
                          </span>
                          <div>
                            <span className="text-[#dfe2f1] font-bold block">{ticker}</span>
                            <span className="text-[#bdc8d1] text-[10px]">{qty} shares allocated</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[#56e5a9] font-bold block">Long Position</span>
                          <span className="text-[#bdc8d1] text-[10px]">Paper Asset</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Execution Log */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold block">
              EXECUTION AUDIT LOG ({trades.length} TRANSACTIONS)
            </span>
            <div className="bg-[#171b26] rounded-xl p-2.5 overflow-y-auto max-h-60 space-y-1.5 border border-[#262a35]">
              {trades.length === 0 ? (
                <p className="font-data-mono-sm text-[11px] text-[#bdc8d1] text-center py-6">
                  No simulated trade history recorded yet.
                </p>
              ) : (
                trades
                  .slice()
                  .reverse()
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center font-data-mono-sm text-[11px] p-2 rounded-lg bg-[#1c1f2a] border border-[#262a35]/60"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'BUY'
                              ? 'bg-[#30c88f]/20 text-[#56e5a9]'
                              : 'bg-[#93000a]/30 text-[#ffb4ab]'
                          }`}
                        >
                          {t.type}
                        </span>
                        <div>
                          <span className="text-[#dfe2f1] font-bold block">{t.ticker}</span>
                          <span className="text-[#bdc8d1] text-[10px]">
                            {t.quantity} shares @ {formatRupees(t.price)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[#dfe2f1] font-semibold block">
                          {formatRupees(t.total)}
                        </span>
                        <span className="text-[#87929a] text-[9px]">{t.timestamp}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-between items-center border-t border-[#262a35]">
          <button
            onClick={onResetPortfolio}
            className="text-[11px] font-data-mono-sm text-[#ffb4ab] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">restart_alt</span>
            Reset Paper Balance ({formatRupees(100000)})
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] text-[12px] font-bold rounded-lg transition-colors border border-[#313540]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export const UserModal = User;
