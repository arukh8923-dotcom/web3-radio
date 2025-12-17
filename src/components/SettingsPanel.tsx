'use client';

import { useTheme } from './ThemeProvider';
import { useLanguage } from '@/hooks/useLanguage';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <h2 className="text-lg font-dial text-brass">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Settings List */}
        <div className="p-4 space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dial-cream font-dial">Theme</p>
              <p className="text-dial-cream/50 text-xs">Switch between light and dark</p>
            </div>
            <button
              onClick={toggleTheme}
              className="preset-button text-xs px-4"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dial-cream font-dial">Language</p>
              <p className="text-dial-cream/50 text-xs">Select your language</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'id')}
              className="preset-button text-xs px-3 py-2 bg-cabinet-dark"
            >
              <option value="en">English</option>
              <option value="id">Indonesia</option>
            </select>
          </div>

          {/* About */}
          <div className="pt-4 border-t border-brass/30">
            <p className="text-dial-cream/50 text-xs text-center">
              Web3 Radio v1.0.0<br />
              Built on Base • Powered by $RADIO & $VIBES
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
