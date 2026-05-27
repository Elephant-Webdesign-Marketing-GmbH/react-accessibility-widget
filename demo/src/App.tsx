import { useState } from 'react';
import { AccessibilityWidget, FontSizeScalingMode, WidgetPosition } from '../../src';
import '../../src/styles.css';
import './App.css';

type FontSizeScalingOption = FontSizeScalingMode | 'auto';

const FONT_SIZE_SCALING_OPTIONS: { value: FontSizeScalingOption; label: string }[] = [
  { value: 'auto', label: 'Auto (Erkennung)' },
  { value: FontSizeScalingMode.REM_ROOT, label: 'REM (Standard)' },
  { value: FontSizeScalingMode.PX_ZOOM, label: 'PX-Zoom (Fallback)' },
];

function App() {
  const [position, setPosition] = useState<WidgetPosition>('bottom-right');
  const [offsetX, setOffsetX] = useState(24);
  const [offsetY, setOffsetY] = useState(24);
  const [fontSizeScaling, setFontSizeScaling] = useState<FontSizeScalingOption>('auto');

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
      <main id="main-content" className="demo-main">
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
          <h2>📄 Beispielinhalt</h2>
          <p>
            Dies ist ein Beispieltext, um die Barrierefreiheits-Funktionen zu testen.
            Versuchen Sie, die Schriftgröße, Zeilenhöhe oder den Kontrast-Modus zu ändern.
            Sie können auch die Vorlesefunktion aktivieren und diesen Text vorlesen lassen.
          </p>
          <p>
            <strong>Tipp:</strong> Drücken Sie <kbd>Alt+A</kbd>, um das Barrierefreiheits-Menü zu öffnen,
            und <kbd>Alt+R</kbd>, um die Vorlesefunktion zu starten (wenn aktiviert).
          </p>
          <p>
            Die Vorlesefunktion unterstützt automatische Spracherkennung, wählt die passende deutsche Stimme
            und kann lange Texte in kleinere Abschnitte aufteilen. Sie können zwischen automatischem Vorlesen
            und Vorlesen mit Hervorhebung wechseln.
          </p>
          <p style={{ padding: "1rem", background: "#f3f4f6", borderRadius: "8px", userSelect: "text" }}>
            <strong>Markierbarer Absatz:</strong> Markieren Sie diesen Text und aktivieren Sie die Vorlesefunktion,
            um nur den ausgewählten Text vorlesen zu lassen. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="sample-button">Beispiel-Button</button>
          <a href="#" className="sample-link">Beispiel-Link</a>
        </section>

        {/* Font size scaling comparison */}
        <section className="font-size-demo" aria-labelledby="font-size-demo-title">
          <h2 id="font-size-demo-title">🔤 Schriftgröße: rem vs. px</h2>
          <p className="font-size-demo-intro">
            Ändere im Widget die Schriftgröße und vergleiche die beiden Blöcke.
            Der linke Block nutzt <code>rem</code>, der rechte feste <code>px</code>-Werte.
          </p>

          <div className="control-group font-size-demo-controls">
            <label htmlFor="font-size-scaling-select">Skalierungsmodus (Demo)</label>
            <select
              id="font-size-scaling-select"
              value={fontSizeScaling}
              onChange={(e) => setFontSizeScaling(e.target.value as FontSizeScalingOption)}
            >
              {FONT_SIZE_SCALING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="font-size-demo-hint">
              <strong>Auto:</strong> erkennt beim ersten Laden, ob die Seite eher rem oder px nutzt.
              {' '}<strong>REM:</strong> nur Root-<code>font-size</code> — px-Block bleibt oft unverändert.
              {' '}<strong>PX-Zoom:</strong> skaliert die ganze Seite — beide Blöcke wachsen sichtbar.
            </p>
          </div>

          <div className="font-size-demo-grid">
            <article className="font-size-demo-block font-size-demo-rem">
              <h3>rem-basiert</h3>
              <p className="font-size-demo-sample">
                Dieser Absatz verwendet <code>1rem</code> / <code>1.25rem</code> und skaliert
                mit dem REM-Standardpfad.
              </p>
              <p className="font-size-demo-sample font-size-demo-sample-small">
                Kleinere Zeile mit <code>0.875rem</code>.
              </p>
            </article>

            <article className="font-size-demo-block font-size-demo-px">
              <h3>px-basiert (Fallback-Test)</h3>
              <p className="font-size-demo-sample">
                Dieser Absatz ist fest auf <code>16px</code> gesetzt — ohne PX-Zoom-Fallback
                ändert sich die Größe oft nicht.
              </p>
              <p className="font-size-demo-sample font-size-demo-sample-small">
                Kleinere Zeile mit festen <code>14px</code>.
              </p>
            </article>
          </div>
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
        key={fontSizeScaling}
        position={position}
        offsetX={offsetX}
        offsetY={offsetY}
        defaultSpeechLang="de-DE"
        readContentSelector="#main-content"
        fontSizeScaling={fontSizeScaling}
      />
    </div>
  );
}

export default App;
