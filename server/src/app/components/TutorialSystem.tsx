'use client';

import { useState, useEffect, useRef } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  action: 'click' | 'hover' | 'wait' | 'scroll';
  content?: React.ReactNode;
  validation?: () => boolean;
  hints?: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: TutorialStep[];
}

interface TutorialSystemProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTutorial?: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'create-first-layout',
    title: 'Create Your First Layout',
    description: 'Learn the basics of creating a digital signage layout from scratch.',
    icon: '🎨',
    estimatedTime: '5 minutes',
    difficulty: 'beginner',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to the Tutorial',
        description: 'Let\'s create your first digital signage layout step by step.',
        target: 'body',
        action: 'wait',
        content: (
          <div className="text-center space-y-4">
            <div className="text-4xl">🎨</div>
            <h3 className="text-xl font-semibold text-white">Create Your First Layout</h3>
            <p className="text-slate-300">
              In this tutorial, you'll learn how to create a basic digital signage layout with widgets.
            </p>
          </div>
        )
      },
      {
        id: 'add-weather-widget',
        title: 'Add a Weather Widget',
        description: 'Let\'s start by adding a weather widget to your layout.',
        target: '[data-tutorial="weather-widget"]',
        action: 'click',
        hints: ['Look for the weather widget in the Component Library', 'Drag it to the canvas']
      },
      {
        id: 'add-clock-widget',
        title: 'Add a Clock Widget',
        description: 'Now let\'s add a clock widget to show the current time.',
        target: '[data-tutorial="clock-widget"]',
        action: 'click',
        hints: ['Find the clock widget in the Component Library', 'Place it next to the weather widget']
      },
      {
        id: 'customize-widgets',
        title: 'Customize Your Widgets',
        description: 'Select a widget and customize its appearance using the Properties Panel.',
        target: '[data-tutorial="properties-panel"]',
        action: 'click',
        hints: ['Click on a widget to select it', 'Use the Properties Panel to change colors and settings']
      },
      {
        id: 'preview-layout',
        title: 'Preview Your Layout',
        description: 'Switch to the Live Preview to see how your layout looks.',
        target: '[data-tutorial="preview-tab"]',
        action: 'click',
        hints: ['Click the Live Preview tab', 'Try different device sizes to test responsiveness']
      },
      {
        id: 'save-template',
        title: 'Save as Template',
        description: 'Save your layout as a template for future use.',
        target: '[data-tutorial="templates-tab"]',
        action: 'click',
        hints: ['Go to the Templates tab', 'Click "Save Current Layout"', 'Give it a name and description']
      }
    ]
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design Mastery',
    description: 'Learn how to create layouts that work perfectly on all device sizes.',
    icon: '📱',
    estimatedTime: '10 minutes',
    difficulty: 'intermediate',
    steps: [
      {
        id: 'responsive-intro',
        title: 'Understanding Responsive Design',
        description: 'Learn why responsive design is important for digital signage.',
        target: 'body',
        action: 'wait',
        content: (
          <div className="text-center space-y-4">
            <div className="text-4xl">📱</div>
            <h3 className="text-xl font-semibold text-white">Responsive Design</h3>
            <p className="text-slate-300">
              Your layouts need to work on different screen sizes. Let's learn how to make them responsive.
            </p>
          </div>
        )
      },
      {
        id: 'test-desktop',
        title: 'Test Desktop View',
        description: 'Switch to desktop preview mode to see how your layout looks on large screens.',
        target: '[data-tutorial="desktop-preview"]',
        action: 'click',
        hints: ['Go to Live Preview tab', 'Click the Desktop device button']
      },
      {
        id: 'test-tablet',
        title: 'Test Tablet View',
        description: 'Now test how your layout adapts to tablet screens.',
        target: '[data-tutorial="tablet-preview"]',
        action: 'click',
        hints: ['Click the Tablet device button', 'Notice how widgets adjust their size']
      },
      {
        id: 'test-mobile',
        title: 'Test Mobile View',
        description: 'Check how your layout looks on mobile devices.',
        target: '[data-tutorial="mobile-preview"]',
        action: 'click',
        hints: ['Click the Mobile device button', 'Widgets should stack vertically on mobile']
      },
      {
        id: 'responsive-mode',
        title: 'Enable Responsive Mode',
        description: 'Switch to responsive mode to see automatic adaptations.',
        target: '[data-tutorial="responsive-mode"]',
        action: 'click',
        hints: ['Click the Responsive mode button', 'Compare with normal mode']
      },
      {
        id: 'adjust-layout',
        title: 'Adjust for Mobile',
        description: 'Make adjustments to ensure your layout works well on mobile.',
        target: '[data-tutorial="layout-canvas"]',
        action: 'click',
        hints: ['Select widgets that look too small on mobile', 'Adjust their properties if needed']
      }
    ]
  },
  {
    id: 'advanced-customization',
    title: 'Advanced Customization',
    description: 'Master advanced features like visual editing, plugins, and custom styling.',
    icon: '⚡',
    estimatedTime: '15 minutes',
    difficulty: 'advanced',
    steps: [
      {
        id: 'visual-editor',
        title: 'Use Visual Editor',
        description: 'Learn how to use the visual property editor for advanced styling.',
        target: '[data-tutorial="visual-editor-tab"]',
        action: 'click',
        hints: ['Select a widget', 'Switch to Visual Editor tab in Properties Panel', 'Try different color schemes']
      },
      {
        id: 'install-plugin',
        title: 'Install a Plugin',
        description: 'Add new functionality by installing plugins from the marketplace.',
        target: '[data-tutorial="plugins-tab"]',
        action: 'click',
        hints: ['Go to Plugins tab', 'Browse available plugins', 'Install one that interests you']
      },
      {
        id: 'configure-plugin',
        title: 'Configure Plugin',
        description: 'Set up your newly installed plugin with custom settings.',
        target: '[data-tutorial="plugin-config"]',
        action: 'click',
        hints: ['Find your installed plugin', 'Click the configure button', 'Adjust settings as needed']
      },
      {
        id: 'custom-css',
        title: 'Add Custom CSS',
        description: 'Apply custom CSS styling for unique designs.',
        target: '[data-tutorial="custom-css"]',
        action: 'click',
        hints: ['In Visual Editor, find Custom CSS section', 'Add your CSS code', 'See the changes in real-time']
      },
      {
        id: 'export-layout',
        title: 'Export Your Layout',
        description: 'Export your layout for deployment or sharing.',
        target: '[data-tutorial="export-layout"]',
        action: 'click',
        hints: ['Go to Templates tab', 'Find your saved template', 'Click Export to download']
      }
    ]
  }
];

export default function TutorialSystem({ isOpen, onClose, selectedTutorial }: TutorialSystemProps) {
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedTutorial) {
      const tutorial = tutorials.find(t => t.id === selectedTutorial);
      if (tutorial) {
        setCurrentTutorial(tutorial);
        setCurrentStep(0);
        setIsRunning(true);
      }
    } else if (isOpen) {
      setCurrentTutorial(null);
      setIsRunning(false);
    }
  }, [isOpen, selectedTutorial]);

  useEffect(() => {
    if (isRunning && currentTutorial && currentStep < currentTutorial.steps.length) {
      const step = currentTutorial.steps[currentStep];
      executeStep(step);
    }
  }, [currentStep, isRunning, currentTutorial]);

  const executeStep = (step: TutorialStep) => {
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      switch (step.action) {
        case 'click':
          setTimeout(() => {
            element.click();
            markStepComplete(step.id);
          }, 1000);
          break;
        case 'hover':
          // Simulate hover effect
          element.style.transform = 'scale(1.05)';
          element.style.transition = 'transform 0.2s ease';
          setTimeout(() => {
            element.style.transform = 'scale(1)';
            markStepComplete(step.id);
          }, 2000);
          break;
        case 'wait':
          setTimeout(() => {
            markStepComplete(step.id);
          }, 3000);
          break;
        case 'scroll':
          setTimeout(() => {
            markStepComplete(step.id);
          }, 1000);
          break;
      }
    } else {
      // If target not found, wait a bit and try again
      setTimeout(() => {
        executeStep(step);
      }, 500);
    }
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const nextStep = () => {
    if (currentTutorial && currentStep < currentTutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTutorial = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  const startTutorial = (tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setCurrentStep(0);
    setIsRunning(true);
    setCompletedSteps(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">Interactive Tutorials</h2>
            <p className="text-slate-400 mt-1">Learn GB-CMS with guided, hands-on tutorials</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Tutorial List */}
          {!isRunning && (
            <div className="w-96 border-r border-slate-700 bg-slate-900/50 p-6 overflow-y-auto">
              <div className="space-y-4">
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    onClick={() => startTutorial(tutorial)}
                    className="p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{tutorial.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{tutorial.title}</h3>
                        <p className="text-sm text-slate-300 mb-2">{tutorial.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>⏱️ {tutorial.estimatedTime}</span>
                          <span className={`px-2 py-1 rounded ${
                            tutorial.difficulty === 'beginner' ? 'bg-green-600' :
                            tutorial.difficulty === 'intermediate' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}>
                            {tutorial.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tutorial Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isRunning && currentTutorial ? (
              <div ref={stepRef} className="space-y-6">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                    <span>Step {currentStep + 1} of {currentTutorial.steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / currentTutorial.steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / currentTutorial.steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Step */}
                {(() => {
                  const step = currentTutorial.steps[currentStep];
                  return (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-300 text-lg">{step.description}</p>
                      </div>

                      {step.content && (
                        <div className="bg-slate-900 p-6 rounded-lg">
                          {step.content}
                        </div>
                      )}

                      {/* Hints */}
                      {step.hints && step.hints.length > 0 && (
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-blue-400">💡</span>
                            <span className="font-medium text-blue-300">Hints:</span>
                            <button
                              onClick={() => setShowHints(!showHints)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              {showHints ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          {showHints && (
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
                              {step.hints.map((hint, index) => (
                                <li key={index}>{hint}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4">
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
                          <button
                            onClick={() => setShowHints(!showHints)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            {showHints ? 'Hide Hints' : 'Show Hints'}
                          </button>
                          <button
                            onClick={nextStep}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                          >
                            {currentStep === currentTutorial.steps.length - 1 ? 'Complete' : 'Next →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <div className="text-4xl mb-4">🎓</div>
                <div className="text-lg mb-2">Choose a Tutorial</div>
                <div className="text-sm">Select a tutorial from the list to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
