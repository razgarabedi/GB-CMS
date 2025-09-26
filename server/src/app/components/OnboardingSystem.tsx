'use client';

import { useState, useEffect, useRef } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'hover' | 'scroll' | 'wait';
    selector?: string;
    duration?: number;
  };
  content?: React.ReactNode;
  skipable?: boolean;
}

interface OnboardingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to GB-CMS!',
    description: 'Let\'s take a quick tour to get you started with your digital signage management system.',
    target: 'body',
    position: 'center',
    content: (
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white">Welcome to GB-CMS</h2>
        <p className="text-slate-300">
          Your comprehensive digital signage management platform. Let's explore the key features together.
        </p>
      </div>
    ),
    skipable: true
  },
  {
    id: 'component-library',
    title: 'Component Library',
    description: 'This is where you\'ll find all available widgets to add to your displays. Drag and drop widgets onto the canvas.',
    target: '[data-tour="component-library"]',
    position: 'right',
    action: {
      type: 'click',
      selector: '[data-tour="component-library"]'
    },
    skipable: true
  },
  {
    id: 'layout-canvas',
    title: 'Layout Canvas',
    description: 'This is your main workspace where you\'ll design your digital signage layouts. Drag widgets here to create your displays.',
    target: '[data-tour="layout-canvas"]',
    position: 'left',
    action: {
      type: 'hover',
      selector: '[data-tour="layout-canvas"]'
    },
    skipable: true
  },
  {
    id: 'properties-panel',
    title: 'Properties Panel',
    description: 'When you select a widget, use this panel to customize its appearance, content, and behavior.',
    target: '[data-tour="properties-panel"]',
    position: 'left',
    action: {
      type: 'click',
      selector: '[data-tour="properties-panel"]'
    },
    skipable: true
  },
  {
    id: 'preview-system',
    title: 'Live Preview',
    description: 'Switch to this tab to see how your layout will look on different devices and screen sizes.',
    target: '[data-tour="preview-tab"]',
    position: 'bottom',
    action: {
      type: 'click',
      selector: '[data-tour="preview-tab"]'
    },
    skipable: true
  },
  {
    id: 'template-manager',
    title: 'Template Manager',
    description: 'Save your layouts as templates and load pre-designed templates for quick setup.',
    target: '[data-tour="templates-tab"]',
    position: 'bottom',
    action: {
      type: 'click',
      selector: '[data-tour="templates-tab"]'
    },
    skipable: true
  },
  {
    id: 'plugin-manager',
    title: 'Plugin Manager',
    description: 'Install and manage plugins to extend your system\'s functionality with additional widgets and features.',
    target: '[data-tour="plugins-tab"]',
    position: 'bottom',
    action: {
      type: 'click',
      selector: '[data-tour="plugins-tab"]'
    },
    skipable: true
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tour! You can always access help and tutorials from the help menu.',
    target: 'body',
    position: 'center',
    content: (
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-white">Ready to Create!</h2>
        <p className="text-slate-300">
          Start building amazing digital signage displays. Need help? Check out our tutorials and documentation.
        </p>
      </div>
    ),
    skipable: false
  }
];

export default function OnboardingSystem({ isOpen, onClose, onComplete }: OnboardingSystemProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVisible && currentStep < onboardingSteps.length) {
      const step = onboardingSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);
      
      // Ensure the target element is visible
      if (element && step.target !== 'body') {
        // Wait a bit for any layout changes to complete
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 100);
      }
      
      if (element && step.action) {
        executeAction(step.action);
      }
    }
  }, [currentStep, isVisible]);

  // Calculate optimal position for step content
  const getStepPosition = () => {
    if (currentStepData.target === 'body' || !targetElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '400px'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = rect.bottom + 20;
    let left = rect.left;
    let maxWidth = '400px';

    // Adjust if step content would go off screen
    if (top + 300 > viewport.height) {
      top = Math.max(20, rect.top - 320);
    }
    if (left + 420 > viewport.width) {
      left = Math.max(20, viewport.width - 420);
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'none',
      maxWidth,
      maxHeight: '80vh'
    };
  };

  const executeAction = (action: OnboardingStep['action']) => {
    if (!action) return;

    switch (action.type) {
      case 'click':
        if (action.selector) {
          const element = document.querySelector(action.selector) as HTMLElement;
          if (element) {
            element.click();
          }
        }
        break;
      case 'hover':
        if (action.selector) {
          const element = document.querySelector(action.selector) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        break;
      case 'wait':
        if (action.duration) {
          setTimeout(() => {
            nextStep();
          }, action.duration);
        }
        break;
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  // Force scroll to step content if it's not visible
  const ensureStepVisible = () => {
    if (stepRef.current) {
      stepRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const completeOnboarding = () => {
    setIsVisible(false);
    onComplete();
    onClose();
  };

  const skipOnboarding = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={currentStepData.skipable ? skipOnboarding : undefined}
      />

      {/* Spotlight Effect */}
      {targetElement && currentStepData.target !== 'body' && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            top: targetElement.offsetTop - 8,
            left: targetElement.offsetLeft - 8,
            width: targetElement.offsetWidth + 16,
            height: targetElement.offsetHeight + 16,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Step Content */}
      <div
        ref={stepRef}
        className="fixed z-50 transition-all duration-300"
        style={{
          ...getStepPosition(),
          overflowY: 'auto'
        }}
      >
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-slate-300 mb-4">
              {currentStepData.description}
            </p>
            {currentStepData.content}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              {currentStepData.skipable && (
                <button
                  onClick={skipStep}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={() => {
                  nextStep();
                  // Ensure next step is visible after a short delay
                  setTimeout(ensureStepVisible, 300);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Skip Tour */}
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
            <button
              onClick={skipOnboarding}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
            >
              Skip entire tour
            </button>
            <button
              onClick={ensureStepVisible}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
              title="Scroll to step content"
            >
              <span>📍</span>
              <span>Center View</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
