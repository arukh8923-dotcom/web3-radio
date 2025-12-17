'use client';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpItems = [
  { icon: '🎚️', title: 'Tuning', desc: 'Drag the dial or use +/- to find stations' },
  { icon: '📻', title: 'Presets', desc: 'Tap to load, hold to save current station' },
  { icon: '🔊', title: 'Controls', desc: 'Adjust volume, bass, and treble knobs' },
  { icon: '💜', title: 'Vibes', desc: 'React to show your mood and earn $VIBES' },
  { icon: '💬', title: 'Chat', desc: 'Join live chat with other listeners' },
  { icon: '🎁', title: 'Tips', desc: 'Support DJs with $RADIO tips' },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <h2 className="text-lg font-dial text-brass">❓ How to Use</h2>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Help Items */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {helpItems.map((item, index) => (
            <div key={index} className="flex gap-3 items-start">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-dial-cream font-dial text-sm">{item.title}</p>
                <p className="text-dial-cream/60 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-brass/30">
          <button
            onClick={onClose}
            className="w-full preset-button"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
