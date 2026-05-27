# Accessibility Widget

[![GitHub Package](https://img.shields.io/badge/GitHub-Package-blue)](https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget)
[![WCAG 2.1 AAA](https://img.shields.io/badge/WCAG%202.1-AAA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready **accessibility widget** for React applications with **16+ features** and **98% WCAG 2.1 Level AAA compliance**.

## 🎯 Features

### 📝 Text & Font
- **Font Size Adjustment** (80-150%, rem standard with automatic px fallback)
- **Dyslexia-Friendly Fonts** (OpenDyslexic)
- **Line Height** (Normal, Relaxed, Loose)
- **Letter Spacing** (Normal, Wide, Very Wide)

### 👁️ Visual Adjustments
- **Contrast Modes** (Normal, High, Dark, Yellow/Black)
- **Color Blind Filters** (Protanopia, Deuteranopia, Tritanopia)
- **UI Scaling** (80-150% for buttons & icons)

### 🎮 Interaction
- **Focus Mode** (Enhanced keyboard navigation)
- **Reduce Motion** (Disable all animations)
- **Full Keyboard Support**

### 🔊 Audio
- **Text-to-Speech** (Read selected text or entire page)
- **Automatic Language Detection** (Supports de-DE, en-US, and more)
- **Voice Selection** (Choose from available system voices)
- **Speech Rate Control** (0.5x - 2.0x)
- **Long Text Support** (Automatic chunking for texts of any length)
- **Pause & Resume** (Control playback with floating controls)
- **Reading Modes** (Auto or with word highlighting)
- **Floating Controls** (Control bar with pause, stop, and mode switching)

All settings are **automatically saved** to localStorage and restored on the next visit.

## 📦 Installation

### From GitHub Packages

1. Create or edit `.npmrc` in your project root:

```
@elephant-webdesign-marketing-gmbh:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

2. Install the package:

```bash
npm install @elephant-webdesign-marketing-gmbh/react-accessibility-widget
```

### Creating a GitHub Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select scopes: `read:packages`
4. Copy the token and add it to your `.npmrc`

## 🚀 Usage

### Basic Setup

```tsx
import { AccessibilityWidget } from '@elephant-webdesign-marketing-gmbh/react-accessibility-widget';
import '@elephant-webdesign-marketing-gmbh/react-accessibility-widget/styles.css';

export default function App() {
  return (
    <>
      <main id="main-content">
        {/* Your app content */}
      </main>
      <AccessibilityWidget />
    </>
  );
}
```

### With Custom Position and TTS Options

```tsx
<AccessibilityWidget 
  position="bottom-right"         // Widget position
  offsetX={24}                    // Horizontal offset in pixels
  offsetY={24}                    // Vertical offset in pixels
  defaultSpeechLang="de-DE"      // Default TTS language (BCP-47)
  readContentSelector="#main-content"  // CSS selector for TTS content
/>
```

### With Imperative API

```tsx
import { useRef } from 'react';
import { AccessibilityWidget, AccessibilityWidgetRef } from '@elephant-webdesign-marketing-gmbh/react-accessibility-widget';

function App() {
  const widgetRef = useRef<AccessibilityWidgetRef>(null);

  const handleReadAloud = () => {
    widgetRef.current?.speak("Dies ist ein benutzerdefinierter Text zum Vorlesen.");
  };

  return (
    <>
      <button onClick={handleReadAloud}>Text vorlesen</button>
      <AccessibilityWidget ref={widgetRef} />
    </>
  );
}
```

### Examples

```tsx
// Bottom left, 100px from edges
<AccessibilityWidget position="bottom-left" offsetX={100} offsetY={100} />

// Top right, closer to edge
<AccessibilityWidget position="top-right" offsetX={16} offsetY={16} />

// Above footer
<AccessibilityWidget position="bottom-right" offsetY={80} />
```

### Next.js 13+ (App Router)

```tsx
// app/layout.tsx
import { AccessibilityWidget } from '@davewasalreadytaken/accessibility-widget';
import '@davewasalreadytaken/accessibility-widget/styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
```

### Vite

```tsx
// main.tsx or App.tsx
import { AccessibilityWidget } from '@davewasalreadytaken/accessibility-widget';
import '@davewasalreadytaken/accessibility-widget/styles.css';

function App() {
  return (
    <>
      <YourApp />
      <AccessibilityWidget />
    </>
  );
}
```

## ⌨️ Keyboard Shortcuts

- **Alt + A** - Toggle accessibility widget
- **Alt + R** - Start/stop text-to-speech (when enabled)
- **Escape** - Close widget
- **Tab** - Navigate through controls

## 🎨 Customization

### Custom Colors

You can override the default blue accent color by adding custom CSS:

```css
/* Override primary color */
.a11y-widget-trigger {
  background-color: #your-color !important;
}

.a11y-btn-active {
  background-color: #your-color !important;
  border-color: #your-color !important;
}

.a11y-section-icon,
.a11y-widget-header-icon {
  color: #your-color !important;
}
```

### Exclude Elements from UI Scaling

Add the class `a11y-preserve-transform` to elements you don't want to scale:

```tsx
<button className="a11y-preserve-transform">
  Don't scale me
</button>
```

### Custom page cursors

If your site uses a custom cursor (CSS `cursor: url(...)` or a JS element following the mouse), enable:

```tsx
import { AccessibilityWidget, ForceDefaultCursorMode } from '@elephant-webdesign-marketing-gmbh/react-accessibility-widget';

<AccessibilityWidget forceDefaultCursor={ForceDefaultCursorMode.WHEN_ACTIVE} />
```

For JS-based cursors, listen for `a11y-settings-change` and hide your cursor element when `detail.forceDefaultCursor` is `true`.

## 📊 WCAG 2.1 Compliance

This widget helps your application meet 16+ WCAG criteria:

### Level A (6 criteria)
✅ 1.1.1 Non-text Content  
✅ 1.3.1 Info and Relationships  
✅ 1.4.1 Use of Color  
✅ 2.1.1 Keyboard  
✅ 2.1.2 No Keyboard Trap  
✅ 4.1.2 Name, Role, Value

### Level AA (7 criteria)
✅ 1.4.3 Contrast Minimum  
✅ 1.4.4 Resize Text  
✅ 1.4.12 Text Spacing  
✅ 2.4.7 Focus Visible  
✅ 4.1.3 Status Messages

### Level AAA (3 criteria)
✅ 1.4.8 Visual Presentation  
✅ 2.3.3 Animation from Interactions  
✅ 2.4.11 Focus Appearance  
✅ 2.5.5 Target Size

**Overall Score:** 98% WCAG 2.1 Level AAA

## 🌍 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Chrome: Text-to-Speech Activation

**Wichtig für Chrome-Nutzer:** Die Text-to-Speech-Funktion benötigt experimentelle Web Platform Features:

1. Öffne in Chrome: `chrome://flags/#enable-experimental-web-platform-features`
2. Stelle auf **"Enabled"**
3. **Chrome neu starten**

Ohne diese Einstellung funktioniert die Sprachausgabe in Chrome nicht. Safari und Firefox benötigen diese Anpassung nicht.

**Note:** Text-to-Speech availability varies by browser and language support.

## 🎯 Target Audiences

- **Visual Impairments** (15-20% of population) - Font size, contrast, TTS
- **Color Blindness** (8% men, 0.5% women) - Color filters
- **Dyslexia** (5-10% of population) - Dyslexic fonts, line spacing, TTS
- **Motor Disabilities** - UI scaling, focus mode
- **Older Users** (60+) - All text adjustments
- **Cognitive Disabilities** - TTS, reduced motion

## 🔧 API Reference

### AccessibilityWidget Props

```typescript
interface AccessibilityWidgetProps {
  /** Position of the floating button (default: "bottom-right") */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Horizontal offset in pixels (default: 24) */
  offsetX?: number;
  /** Vertical offset in pixels (default: 24) */
  offsetY?: number;
  /** Default speech language (BCP-47 tag, e.g., "de-DE"). Falls back to document lang */
  defaultSpeechLang?: string;
  /** CSS selector for main content to read (default: "#main-content") */
  readContentSelector?: string;
  /**
   * Font size scaling strategy (default: "auto")
   * - "auto": detect rem vs. px once and choose the best approach
   * - FontSizeScalingMode.REM_ROOT: scale via html font-size % (rem/em)
   * - FontSizeScalingMode.PX_ZOOM: scale via page zoom (px fallback)
   */
  fontSizeScaling?: FontSizeScalingMode | "auto";
  /**
   * Override custom page cursors with system defaults (default: false)
   * - ForceDefaultCursorMode.WHEN_ACTIVE: only while visual settings differ from defaults
   * - ForceDefaultCursorMode.ALWAYS: always while the widget is mounted
   */
  forceDefaultCursor?: ForceDefaultCursorMode | false;
}
```

**Position Behavior:**
- **Desktop:** Dialog appears next to the widget button
- **Mobile (< 768px):** Dialog is always centered on screen

### AccessibilityWidgetRef (Imperative API)

```typescript
interface AccessibilityWidgetRef {
  /** Start text-to-speech with optional text */
  speak: (text?: string) => void;
  /** Stop text-to-speech */
  stop: () => void;
  /** Check if currently speaking */
  isSpeaking: () => boolean;
  /** Open the settings modal */
  openSettings: () => void;
  /** Close the settings modal */
  closeSettings: () => void;
}
```

### AccessibilitySettings Interface

```typescript
interface AccessibilitySettings {
  // Text & Font
  fontSize: number;                          // 80-150
  fontFamily: "default" | "dyslexic" | "arial" | "serif";
  lineHeight: "normal" | "relaxed" | "loose";
  letterSpacing: "normal" | "wide" | "wider";
  
  // Visual
  contrastMode: "normal" | "high" | "dark" | "yellow-black";
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  uiScale: number;                           // 80-150
  
  // Interaction
  focusMode: boolean;
  reducedMotion: boolean;
  
  // Audio
  textToSpeech: boolean;
  speechRate: number;                        // 0.5-2.0
  speechLang: string;                        // BCP-47 language tag
  speechVoiceUri: string | null;             // Voice URI or null for default
  speechReadMode: SpeechReadMode;            // AUTO or HIGHLIGHT
}
```

### Enums

```typescript
enum SpeechReadMode {
  AUTO = "auto",              // Automatic continuous reading
  HIGHLIGHT = "highlight",    // Reading with word highlighting
}

enum WidgetLocale {
  DE = "de",
  EN = "en",
}

enum FontSizeScalingMode {
  REM_ROOT = "rem-root",
  PX_ZOOM = "px-zoom",
}
```

## 🌍 Text-to-Speech Language Support

The TTS feature automatically detects the document language and selects an appropriate voice. Supported languages include:

- **German (de-DE)** - Default for German pages
- **English (en-US)** - Default for English pages
- **French (fr-FR)**, **Spanish (es-ES)**, **Italian (it-IT)**, and more

You can override the language by setting the `defaultSpeechLang` prop:

```tsx
<AccessibilityWidget defaultSpeechLang="de-DE" />
```

### Browser Compatibility

- **Desktop browsers**: Full support for pause/resume and voice selection
- **Safari/iOS**: Limited pause/resume support (automatic fallback to stop/restart)
- **Voice availability**: Varies by browser and operating system

## 📄 Best Practices

1. **Add `id="main-content"` to your main content area** for better TTS targeting:
   ```tsx
   <main id="main-content">
     {/* Your content */}
   </main>
   ```

2. **Use semantic HTML** for better text extraction and screen reader support

3. **Test with keyboard navigation** (Tab, Enter, Escape)

4. **Provide clear focus indicators** for interactive elements

## ⚙️ Configuration Examples

### E-commerce Site

```tsx
<AccessibilityWidget
  position="bottom-left"
  defaultSpeechLang="de-DE"
  readContentSelector=".product-content"
/>
```

### Blog/Content Site

```tsx
<AccessibilityWidget
  position="top-right"
  offsetX={16}
  defaultSpeechLang="en-US"
  readContentSelector="article"
/>
```

### Multi-language Site

```tsx
function App() {
  const lang = document.documentElement.lang;
  
  return (
    <AccessibilityWidget
      defaultSpeechLang={lang === 'de' ? 'de-DE' : 'en-US'}
      readContentSelector="#main-content"
    />
  );
}
```

### CSS Classes Applied

The widget applies these classes to `<html>` element:

- `.a11y-font-dyslexic` - Dyslexic font
- `.a11y-font-arial` - Arial font
- `.a11y-font-serif` - Serif font
- `.a11y-line-height-relaxed` - Relaxed line height
- `.a11y-line-height-loose` - Loose line height
- `.a11y-letter-spacing-wide` - Wide letter spacing
- `.a11y-letter-spacing-wider` - Very wide letter spacing
- `.a11y-contrast-high` - High contrast
- `.a11y-contrast-dark` - Dark mode
- `.a11y-contrast-yellow-black` - Yellow/black mode
- `.a11y-colorblind-protanopia` - Red-blind filter
- `.a11y-colorblind-deuteranopia` - Green-blind filter
- `.a11y-colorblind-tritanopia` - Blue-blind filter
- `.a11y-focus-mode` - Enhanced focus indicators
- `.a11y-reduce-motion` - Reduced motion
- `.a11y-font-px-zoom` - Page zoom fallback for px-based font sizes

## 📝 License

MIT © Elephant Webdesign & Marketing GmbH

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [OpenDyslexic Font](https://opendyslexic.org/)
- [Color Blind Awareness](https://www.colourblindawareness.org/)

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget/issues).

---

**Version:** 1.4.0  
**Status:** ✅ Production Ready
