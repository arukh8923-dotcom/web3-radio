'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function HelpGuide() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onboarded = localStorage.getItem('web3radio-onboarded');
    setShowOnboarding(!onboarded);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('web3radio-onboarded', 'true');
    setShowOnboarding(false);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null;

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-cabinet-dark border-2 border-brass rounded-xl max-w-md w-full p-6">
          <h2 className="nixie-tube text-2xl text-center mb-4">
            {t('welcome.title')}
          </h2>
          
          <div className="space-y-4 text-dial-cream/80 text-sm">
            <GuideItem icon="🎚️" title={t('control.tuning')} desc={t('control.tuning.desc')} />
            <GuideItem icon="🔘" title={t('control.preset')} desc={t('control.preset.desc')} />
            <GuideItem icon="📡" title={t('control.tunein')} desc={t('control.tunein.desc')} />
            <GuideItem icon="💜" title={t('control.vibes')} desc={t('control.vibes.desc')} />
            <GuideItem icon="🌿" title={t('control.420')} desc={t('control.420.desc')} />
          </div>

          <button
            onClick={completeOnboarding}
            className="w-full mt-6 preset-button bg-brass text-cabinet-dark py-3 text-lg"
          >
            {t('welcome.start')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-brass text-cabinet-dark flex items-center justify-center text-xl font-bold shadow-lg hover:scale-110 transition-transform z-40"
      >
        ?
      </button>

      {isOpen && (
        <HelpModal t={t} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}


function GuideItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-dial text-brass">{title}</p>
        <p>{desc}</p>
      </div>
    </div>
  );
}

function HelpModal({ t, onClose }: { t: (key: string) => string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="nixie-tube text-xl">{t('help.title')}</h2>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        <div className="space-y-4 text-dial-cream/80 text-sm">
          <Section title={`🎚️ ${t('help.controls')}`}>
            <li>{t('help.controls.dial')}</li>
            <li>{t('help.controls.volume')}</li>
            <li>{t('help.controls.eq')}</li>
            <li>{t('help.controls.power')}</li>
            <li>{t('help.controls.mute')}</li>
          </Section>

          <Section title={`🔘 ${t('help.presets')}`}>
            <li>{t('help.presets.tap')}</li>
            <li>{t('help.presets.hold')}</li>
            <li>{t('help.presets.sync')}</li>
          </Section>

          <Section title={`📡 ${t('help.stations')}`}>
            <li>{t('help.stations.find')}</li>
            <li>{t('help.stations.tunein')}</li>
            <li>{t('help.stations.tip')}</li>
            <li>{t('help.stations.live')}</li>
          </Section>

          <Section title={`💜 ${t('help.vibes')}`}>
            <li>{t('help.vibes.react')}</li>
            <li>{t('help.vibes.see')}</li>
            <li>{t('help.vibes.earn')}</li>
          </Section>

          <Section title={`🌿 ${t('help.420')}`}>
            <li>{t('help.420.click')}</li>
            <li>{t('help.420.theme')}</li>
            <li>{t('help.420.drops')}</li>
          </Section>

          <Section title={`👛 ${t('help.wallet')}`}>
            <li>{t('help.wallet.connect')}</li>
            <li>{t('help.wallet.required')}</li>
            <li>{t('help.wallet.works')}</li>
          </Section>
        </div>

        <button onClick={onClose} className="w-full mt-6 preset-button py-2">
          {t('help.gotit')}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-dial text-brass mb-1">{title}</p>
      <ul className="list-disc list-inside space-y-1 text-dial-cream/70">{children}</ul>
    </div>
  );
}
