import { useState } from 'react';
import { AccessibilityWidget, WidgetPosition } from '../../src';
import '../../src/styles.css';
import './App.css';

function App() {
  const [position, setPosition] = useState<WidgetPosition>('bottom-right');
  const [offsetX, setOffsetX] = useState(24);
  const [offsetY, setOffsetY] = useState(24);

  return (
    <div className="demo-container">
      {/* Header */}
      <header className="demo-header">
        <h1>🎨 React Accessibility Widget</h1>
        <p className="subtitle">by Elephant Webdesign & Marketing GmbH</p>
        <div className="badges">
          <span className="badge">16+ Features</span>
          <span className="badge">WCAG 2.1 AAA</span>
          <span className="badge">TypeScript</span>
        </div>
      </header>

      {/* Configuration Panel */}
      <main className="demo-main">
        <section className="config-panel">
          <h2>⚙️ Widget Configuration</h2>
          
          <div className="control-group">
            <label>Position</label>
            <div className="button-grid">
              <button
                className={position === 'top-left' ? 'active' : ''}
                onClick={() => setPosition('top-left')}
              >
                Top Left
              </button>
              <button
                className={position === 'top-right' ? 'active' : ''}
                onClick={() => setPosition('top-right')}
              >
                Top Right
              </button>
              <button
                className={position === 'bottom-left' ? 'active' : ''}
                onClick={() => setPosition('bottom-left')}
              >
                Bottom Left
              </button>
              <button
                className={position === 'bottom-right' ? 'active' : ''}
                onClick={() => setPosition('bottom-right')}
              >
                Bottom Right
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>
              Offset X: <strong>{offsetX}px</strong>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={offsetX}
              onChange={(e) => setOffsetX(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>
              Offset Y: <strong>{offsetY}px</strong>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={offsetY}
              onChange={(e) => setOffsetY(Number(e.target.value))}
            />
          </div>

          <div className="code-preview">
            <h3>📋 Code</h3>
            <pre><code>{`<AccessibilityWidget 
  position="${position}"
  offsetX={${offsetX}}
  offsetY={${offsetY}}
/>`}</code></pre>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <h2>✨ Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">📝</span>
              <h3>Text & Font</h3>
              <p>Size, family, line-height, letter-spacing</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👁️</span>
              <h3>Visual Modes</h3>
              <p>High contrast, dark mode, color blind filters</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎮</span>
              <h3>Interaction</h3>
              <p>Focus mode, keyboard navigation</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔊</span>
              <h3>Text-to-Speech</h3>
              <p>Read aloud with adjustable speed</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎨</span>
              <h3>UI Scaling</h3>
              <p>Enlarge buttons and interactive elements</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💾</span>
              <h3>Persistent</h3>
              <p>All settings saved in localStorage</p>
            </div>
          </div>
        </section>

        {/* Sample Content */}
        <section className="sample-content">
          <h2>📄 Sample Content</h2>
          <p>
            This is sample text content to test the accessibility features. 
            Try adjusting the font size, line height, or enabling high contrast mode.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris.
          </p>
          <button className="sample-button">Sample Button</button>
          <a href="#" className="sample-link">Sample Link</a>
        </section>
      </main>

      {/* Footer */}
      <footer className="demo-footer">
        <p>
          © 2026 Elephant Webdesign & Marketing GmbH | 
          <a href="https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>

      {/* The Actual Widget */}
      <AccessibilityWidget 
        position={position}
        offsetX={offsetX}
        offsetY={offsetY}
      />
    </div>
  );
}

export default App;
