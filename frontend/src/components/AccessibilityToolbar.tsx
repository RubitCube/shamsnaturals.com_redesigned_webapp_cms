import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AccessibilityToolbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [fontSize, setFontSize] = useState(100); // Percentage
  const [highContrast, setHighContrast] = useState(false);
  const [textSpacing, setTextSpacing] = useState(false);
  const [focusIndicator, setFocusIndicator] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<string>('none'); // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Auto-hide toolbar when dropdown is closed and not hovering
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        const toolbar = document.querySelector('.accessibility-toolbar');
        const trigger = document.querySelector('.accessibility-toolbar-trigger');
        // Check if mouse is not over toolbar or trigger
        if (toolbar && !toolbar.matches(':hover') && trigger && !trigger.matches(':hover')) {
          setIsToolbarVisible(false);
        }
      }, 300); // Small delay to allow for smooth transitions

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedTextSpacing = localStorage.getItem('accessibility-text-spacing');
    const savedFocusIndicator = localStorage.getItem('accessibility-focus-indicator');
    const savedTextToSpeech = localStorage.getItem('accessibility-text-to-speech');
    const savedColorBlindMode = localStorage.getItem('accessibility-color-blind-mode');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast === 'true') setHighContrast(true);
    if (savedTextSpacing === 'true') setTextSpacing(true);
    if (savedFocusIndicator === 'false') setFocusIndicator(false);
    if (savedTextToSpeech === 'true') setTextToSpeech(true);
    if (savedColorBlindMode) setColorBlindMode(savedColorBlindMode);

    // Apply initial settings
    applyAccessibilitySettings(
      savedFontSize ? parseInt(savedFontSize) : 100,
      savedHighContrast === 'true',
      savedTextSpacing === 'true',
      savedFocusIndicator !== 'false',
      savedColorBlindMode || 'none'
    );

    // Initialize text-to-speech if enabled
    if (savedTextToSpeech === 'true') {
      initializeTextToSpeech();
    }
  }, []);

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = (
    size: number,
    contrast: boolean,
    spacing: boolean,
    focus: boolean,
    colorBlind: string = 'none'
  ) => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${size}%`;

    // High contrast
    if (contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Text spacing
    if (spacing) {
      root.classList.add('text-spacing');
    } else {
      root.classList.remove('text-spacing');
    }

    // Focus indicator
    if (focus) {
      root.classList.add('focus-indicator');
    } else {
      root.classList.remove('focus-indicator');
    }

    // Color blind mode
    root.classList.remove('color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
    if (colorBlind !== 'none') {
      root.classList.add(`color-blind-${colorBlind}`);
    }
  };

  // Initialize text-to-speech
  const initializeTextToSpeech = () => {
    if (!textToSpeech || !speechSynthesis) return;

    // Add click handlers to read text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div[role="article"]');
    const handleTextToSpeechClick = (e: MouseEvent) => {
      if (!textToSpeech || !speechSynthesis) return;

      const target = e.target as HTMLElement;
      // Don't read if clicking on interactive elements
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a')) {
        return;
      }

      const text = target.textContent || target.innerText || '';
      if (text.trim() && text.length > 10) { // Only read meaningful text
        speakText(text.substring(0, 500)); // Limit to 500 characters
      }
    };

    textElements.forEach((element) => {
      element.addEventListener('click', handleTextToSpeechClick as EventListener);
      (element as any).__ttsHandler = handleTextToSpeechClick; // Store reference for cleanup
    });
  };

  // Speak text using Web Speech API
  const speakText = (text: string) => {
    if (!speechSynthesis) return;

    // Stop any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  // Stop text-to-speech
  const stopTextToSpeech = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (newSize: number) => {
    const clampedSize = Math.max(75, Math.min(200, newSize));
    setFontSize(clampedSize);
    localStorage.setItem('accessibility-font-size', clampedSize.toString());
    applyAccessibilitySettings(clampedSize, highContrast, textSpacing, focusIndicator, colorBlindMode);
  };

  // Handle high contrast toggle
  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
    applyAccessibilitySettings(fontSize, newValue, textSpacing, focusIndicator, colorBlindMode);
  };

  // Handle text spacing toggle
  const handleTextSpacingToggle = () => {
    const newValue = !textSpacing;
    setTextSpacing(newValue);
    localStorage.setItem('accessibility-text-spacing', newValue.toString());
    applyAccessibilitySettings(fontSize, highContrast, newValue, focusIndicator, colorBlindMode);
  };

  // Handle focus indicator toggle
  const handleFocusIndicatorToggle = () => {
    const newValue = !focusIndicator;
    setFocusIndicator(newValue);
    localStorage.setItem('accessibility-focus-indicator', newValue.toString());
    applyAccessibilitySettings(fontSize, highContrast, textSpacing, newValue, colorBlindMode);
  };

  // Handle text-to-speech toggle
  const handleTextToSpeechToggle = () => {
    const newValue = !textToSpeech;
    setTextToSpeech(newValue);
    localStorage.setItem('accessibility-text-to-speech', newValue.toString());
    
    if (newValue) {
      initializeTextToSpeech();
      speakText('Text to speech enabled. Click on any text to hear it read aloud.');
    } else {
      stopTextToSpeech();
      // Remove event listeners
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div[role="article"]');
      textElements.forEach((element) => {
        const handler = (element as any).__ttsHandler;
        if (handler) {
          element.removeEventListener('click', handler as EventListener);
          delete (element as any).__ttsHandler;
        }
      });
    }
  };

  // Handle color blind mode change
  const handleColorBlindModeChange = (mode: string) => {
    setColorBlindMode(mode);
    localStorage.setItem('accessibility-color-blind-mode', mode);
    applyAccessibilitySettings(fontSize, highContrast, textSpacing, focusIndicator, mode);
  };

  // Reset all settings
  const handleReset = () => {
    setFontSize(100);
    setHighContrast(false);
    setTextSpacing(false);
    setFocusIndicator(true);
    setTextToSpeech(false);
    setColorBlindMode('none');
    localStorage.removeItem('accessibility-font-size');
    localStorage.removeItem('accessibility-high-contrast');
    localStorage.removeItem('accessibility-text-spacing');
    localStorage.removeItem('accessibility-focus-indicator');
    localStorage.removeItem('accessibility-text-to-speech');
    localStorage.removeItem('accessibility-color-blind-mode');
    stopTextToSpeech();
    applyAccessibilitySettings(100, false, false, true, 'none');
  };

  // Skip to main content
  const handleSkipToContent = () => {
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="accessibility-toolbar-wrapper group" role="region" aria-label="Accessibility toolbar">
      {/* Hover trigger area - thin strip at top */}
      <div 
        className="accessibility-toolbar-trigger fixed top-0 left-0 right-0 h-2 z-[10000] cursor-pointer transition-all duration-300 hover:h-3 group-hover:h-3"
        onMouseEnter={() => setIsToolbarVisible(true)}
        onMouseLeave={() => !isOpen && setIsToolbarVisible(false)}
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={() => !isOpen && setIsToolbarVisible(false)}
        onClick={() => {
          setIsToolbarVisible(true);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsToolbarVisible(true);
            setIsOpen(true);
          }
        }}
        aria-label="Show accessibility options"
        role="button"
        tabIndex={0}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Accessibility Options
          </span>
        </div>
      </div>

      {/* Main toolbar - hidden by default, shown on hover */}
      <div 
        className={`accessibility-toolbar fixed top-0 left-0 right-0 z-[9999] bg-gray-800 text-white shadow-lg transition-transform duration-300 ease-in-out ${
          isToolbarVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => setIsToolbarVisible(true)}
        onMouseLeave={() => {
          // Only hide if dropdown is closed
          if (!isOpen) {
            setIsToolbarVisible(false);
          }
        }}
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={(e) => {
          // Don't hide if focus is moving to a child element or dropdown is open
          if (!e.currentTarget.contains(e.relatedTarget as Node) && !isOpen) {
            setIsToolbarVisible(false);
          }
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          {/* Left side - Skip to content and toggle button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSkipToContent}
              className="text-sm px-3 py-1 bg-[#a8d5a3] hover:bg-[#8fc489] text-gray-900 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Skip to main content"
            >
              Skip to Content
            </button>
            <button
              onClick={() => {
                const newIsOpen = !isOpen;
                setIsOpen(newIsOpen);
                // If closing the dropdown, hide the toolbar after a short delay
                // This allows the user to hover back if they want to keep it open
                if (!newIsOpen) {
                  setTimeout(() => {
                    const toolbar = document.querySelector('.accessibility-toolbar');
                    const trigger = document.querySelector('.accessibility-toolbar-trigger');
                    // Only hide if not hovering over toolbar or trigger
                    if (toolbar && !toolbar.matches(':hover') && trigger && !trigger.matches(':hover')) {
                      setIsToolbarVisible(false);
                    }
                  }, 200);
                }
              }}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label={isOpen ? 'Close accessibility toolbar' : 'Open accessibility toolbar'}
              aria-expanded={isOpen}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span className="text-sm font-medium">Accessibility</span>
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Right side - Quick actions (always visible) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFontSizeChange(fontSize - 10)}
              className="p-2 hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Decrease font size"
              title="Decrease font size"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm px-2 min-w-[3rem] text-center">{fontSize}%</span>
            <button
              onClick={() => handleFontSizeChange(fontSize + 10)}
              className="p-2 hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Increase font size"
              title="Increase font size"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded toolbar menu */}
        {isOpen && (
          <div className="border-t border-gray-700 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Font Size Control */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Size</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFontSizeChange(fontSize - 10)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Decrease font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="75"
                    max="200"
                    step="10"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                    className="flex-1"
                    aria-label="Font size slider"
                  />
                  <button
                    onClick={() => handleFontSizeChange(fontSize + 10)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Increase font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-400">Current: {fontSize}%</div>
              </div>

              {/* High Contrast Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">High Contrast</label>
                <button
                  onClick={handleHighContrastToggle}
                  className={`w-full px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    highContrast
                      ? 'bg-[#a8d5a3] hover:bg-[#8fc489] text-gray-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-pressed={highContrast}
                >
                  {highContrast ? 'On' : 'Off'}
                </button>
                <div className="text-xs text-gray-400">Improves readability</div>
              </div>

              {/* Text Spacing Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Text Spacing</label>
                <button
                  onClick={handleTextSpacingToggle}
                  className={`w-full px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    textSpacing
                      ? 'bg-[#a8d5a3] hover:bg-[#8fc489] text-gray-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-pressed={textSpacing}
                >
                  {textSpacing ? 'On' : 'Off'}
                </button>
                <div className="text-xs text-gray-400">Increases line spacing</div>
              </div>

              {/* Focus Indicator Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Focus Indicator</label>
                <button
                  onClick={handleFocusIndicatorToggle}
                  className={`w-full px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    focusIndicator
                      ? 'bg-[#a8d5a3] hover:bg-[#8fc489] text-gray-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-pressed={focusIndicator}
                >
                  {focusIndicator ? 'On' : 'Off'}
                </button>
                <div className="text-xs text-gray-400">Shows keyboard focus</div>
              </div>
            </div>

            {/* Second Row - New Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Text-to-Speech Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Text-to-Speech</label>
                <button
                  onClick={handleTextToSpeechToggle}
                  className={`w-full px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    textToSpeech
                      ? 'bg-[#a8d5a3] hover:bg-[#8fc489] text-gray-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-pressed={textToSpeech}
                >
                  {textToSpeech ? (isSpeaking ? 'Speaking...' : 'On') : 'Off'}
                </button>
                <div className="text-xs text-gray-400">Click text to hear it read</div>
                {textToSpeech && isSpeaking && (
                  <button
                    onClick={stopTextToSpeech}
                    className="text-xs text-[#a8d5a3] hover:underline"
                    aria-label="Stop speaking"
                  >
                    Stop
                  </button>
                )}
              </div>

              {/* Color Blind Mode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Color Blind Mode</label>
                <select
                  value={colorBlindMode}
                  onChange={(e) => handleColorBlindModeChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white text-white"
                  aria-label="Color blind mode selector"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                </select>
                <div className="text-xs text-gray-400">Adjusts colors for vision</div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Reset all accessibility settings"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;

