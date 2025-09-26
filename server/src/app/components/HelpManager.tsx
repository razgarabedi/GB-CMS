'use client';

import { useState, useEffect } from 'react';
import OnboardingSystem from './OnboardingSystem';
import HelpSystem from './HelpSystem';
import TutorialSystem from './TutorialSystem';
import { Tooltip, QuickTooltip, HelpTooltip } from './TooltipSystem';

interface HelpManagerProps {
  children: React.ReactNode;
}

export default function HelpManager({ children }: HelpManagerProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<string | undefined>();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(true);

  // Check if user has completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem('gb-cms-onboarding-completed');
    setHasCompletedOnboarding(completed === 'true');
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('gb-cms-onboarding-completed', 'true');
    setHasCompletedOnboarding(true);
  };

  const openHelp = (topic?: string) => {
    setShowHelp(true);
    if (topic) {
      // Set initial topic if provided
      setTimeout(() => {
        const topicElement = document.querySelector(`[data-help-topic="${topic}"]`);
        if (topicElement) {
          (topicElement as HTMLElement).click();
        }
      }, 100);
    }
  };

  const openTutorial = (tutorialId?: string) => {
    setSelectedTutorial(tutorialId);
    setShowTutorials(true);
  };

  const openOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <>
      {children}
      
      {/* Help Button */}
      {showHelpButton && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="flex flex-col space-y-2">
            {/* Main Help Button */}
            <div className="relative group">
              <button
                onClick={() => openHelp()}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group-hover:scale-110"
                title="Help & Support"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Help & Support
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>

            {/* Quick Actions Menu */}
            <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Tooltip content="Interactive Tutorials" position="left">
                <button
                  onClick={() => openTutorial()}
                  className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                  title="Tutorials"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip content="Restart Onboarding" position="left">
                <button
                  onClick={openOnboarding}
                  className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                  title="Onboarding"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip content="Toggle Help Hints" position="left">
                <button
                  onClick={() => setShowHelpButton(!showHelpButton)}
                  className="w-12 h-12 bg-slate-600 hover:bg-slate-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                  title="Toggle Help"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding System */}
      <OnboardingSystem
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Help System */}
      <HelpSystem
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Tutorial System */}
      <TutorialSystem
        isOpen={showTutorials}
        onClose={() => setShowTutorials(false)}
        selectedTutorial={selectedTutorial}
      />
    </>
  );
}

// Export tooltip components for use throughout the app
export { Tooltip, QuickTooltip, HelpTooltip };
