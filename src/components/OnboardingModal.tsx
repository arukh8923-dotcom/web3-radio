'use client';

import { useState } from 'react';

interface OnboardingModalProps {
  onClose: () => void;
}

const slides = [
  {
    icon: '📻',
    title: 'Welcome to Web3 Radio',
    description: 'A decentralized radio experience on Base. Discover stations, tune in, and connect with the community.',
  },
  {
    icon: '🎚️',
    title: 'Tune & Listen',
    description: 'Use the dial to find stations. Tap preset buttons to save your favorites. Long-press to save current station.',
  },
  {
    icon: '💜',
    title: 'React with Vibes',
    description: 'Send reactions to show your mood. Earn $VIBES tokens by participating in the community.',
  },
  {
    icon: '💬',
    title: 'Chat & Connect',
    description: 'Join live chat with other listeners. Send smoke signals in the 420 zone for ephemeral messages.',
  },
  {
    icon: '🎁',
    title: 'Tip Your DJs',
    description: 'Support your favorite DJs with tips. Build the decentralized radio community together.',
  },
];

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{slide.icon}</div>
          <h2 className="text-xl font-dial text-brass mb-3">{slide.title}</h2>
          <p className="text-dial-cream/80 text-sm leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-brass w-6'
                  : 'bg-dial-cream/30 hover:bg-dial-cream/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex border-t border-brass/30">
          <button
            onClick={handleSkip}
            className="flex-1 py-4 text-dial-cream/60 hover:text-dial-cream text-sm font-dial transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-brass/20 text-brass hover:bg-brass/30 text-sm font-dial transition-colors border-l border-brass/30"
          >
            {isLastSlide ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
