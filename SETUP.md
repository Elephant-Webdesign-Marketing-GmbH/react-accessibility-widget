# Setup Guide - Accessibility Widget Package

Schritt-für-Schritt Anleitung zum Veröffentlichen des Packages auf GitHub Packages.

## 📋 Voraussetzungen

- Node.js 18+ installiert
- Git installiert
- GitHub Account

## 🚀 Setup Schritte

### 1. Dependencies installieren

```bash
cd /Users/davidzimmert/Projects/accessibility-widget
npm install
```

### 2. Package bauen (testen)

```bash
npm run build
```

Das erstellt den `dist/` Ordner mit:
- `index.js` (CommonJS)
- `index.mjs` (ES Modules)
- `index.d.ts` (TypeScript Definitionen)
- `style.css` (Styles)

### 3. Git Repository erstellen

```bash
# Git initialisieren
git init

# Dateien hinzufügen
git add .

# Erster Commit
git commit -m "Initial commit: Accessibility Widget v1.0.0"
```

### 4. GitHub Repository erstellen

1. Gehe zu: https://github.com/new
2. Repository Name: `react-accessibility-widget`
3. **Organization:** Wähle `Elephant-Webdesign-Marketing-GmbH`
4. Beschreibung: "Comprehensive accessibility widget for React - WCAG 2.1 AAA compliant"
5. **WICHTIG:** Setze das Repo auf **Public** (für kostenloses GitHub Packages)
6. **NICHT** README, .gitignore oder License hinzufügen (haben wir schon)
7. Klicke auf "Create repository"

### 5. Repository mit GitHub verbinden

```bash
# Remote hinzufügen
git remote add origin https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget.git

# Branch umbenennen (falls nötig)
git branch -M main

# Pushen
git push -u origin main
```

### 6. GitHub Personal Access Token erstellen

1. Gehe zu: https://github.com/settings/tokens
2. Klicke auf "Generate new token (classic)"
3. Name: `accessibility-widget-publish`
4. Expiration: `No expiration` (oder nach Wunsch)
5. Scopes auswählen:
   - ✅ `write:packages` (beinhaltet read:packages)
   - ✅ `delete:packages` (optional, für löschen)
6. Token kopieren (wird nur einmal angezeigt!)

### 7. Manuelles Publishing (erstes Mal)

```bash
# .npmrc erstellen mit deinem Token
echo "@elephant-webdesign-marketing-gmbh:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE" > .npmrc

# WICHTIG: .npmrc zu .gitignore hinzufügen (Token geheim halten!)
echo ".npmrc" >> .gitignore
git add .gitignore
git commit -m "Add .npmrc to gitignore"
git push

# Package publishen
npm publish
```

### 8. Automatisches Publishing mit GitHub Actions (empfohlen)

Die GitHub Action ist bereits konfiguriert (`.github/workflows/publish.yml`).

**Option A: Via GitHub Release**

1. Gehe zu: https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget/releases/new
2. Tag: `v1.0.0`
3. Release title: `v1.0.0 - Initial Release`
4. Beschreibung hinzufügen
5. Klicke "Publish release"
6. GitHub Actions published automatisch!

**Option B: Manuell triggern**

1. Gehe zu: https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget/actions
2. Wähle "Publish to GitHub Packages"
3. Klicke "Run workflow"

## 📦 Package in anderem Projekt nutzen

### Setup im Ziel-Projekt

1. `.npmrc` erstellen:

```bash
# Im Projekt-Root
echo "@elephant-webdesign-marketing-gmbh:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE" > .npmrc
```

2. Package installieren:

```bash
npm install @elephant-webdesign-marketing-gmbh/react-accessibility-widget
```

3. Importieren:

```tsx
// In deiner App
import { AccessibilityWidget } from '@elephant-webdesign-marketing-gmbh/react-accessibility-widget';
import '@elephant-webdesign-marketing-gmbh/react-accessibility-widget/styles.css';

function App() {
  return (
    <>
      <YourContent />
      <AccessibilityWidget />
    </>
  );
}
```

## 🔄 Package aktualisieren

### Neue Version veröffentlichen

1. **Version in package.json erhöhen:**

```bash
# Minor Update (z.B. 1.0.0 -> 1.1.0)
npm version minor

# Patch Update (z.B. 1.0.0 -> 1.0.1)
npm version patch

# Major Update (z.B. 1.0.0 -> 2.0.0)
npm version major
```

2. **Änderungen committen & pushen:**

```bash
git push
git push --tags
```

3. **GitHub Release erstellen** (siehe Schritt 8)

## ⚠️ Wichtige Hinweise

### Token-Sicherheit

- **NIEMALS** Token in Git committen
- `.npmrc` ist in `.gitignore`
- Nutze `.npmrc.example` als Template

### GitHub Packages Kosten

- **Public Packages:** Kostenlos
- **Private Packages:** 500 MB + 1 GB Transfer/Monat kostenlos

### Repository Visibility

Das GitHub Repository **muss public** sein für kostenloses Package Hosting.
Alternativ kannst du private Packages nutzen (siehe Kosten).

## 🐛 Troubleshooting

### "npm ERR! 404 Not Found"

- Token hat nicht die richtigen Scopes
- `.npmrc` nicht korrekt konfiguriert
- Package noch nicht published

### "npm ERR! 403 Forbidden"

- Token ist abgelaufen
- Keine Berechtigung zum Package
- Falscher Registry-URL

### Build-Fehler

```bash
# Node modules löschen und neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Nächste Schritte

1. ✅ Package bauen und testen
2. ✅ Auf GitHub pushen
3. ✅ Erstes Release erstellen
4. ✅ In anderem Projekt installieren
5. 🎉 Fertig!

## 🤝 Support

Bei Problemen:
- GitHub Issues: https://github.com/Elephant-Webdesign-Marketing-GmbH/react-accessibility-widget/issues
- Email: [deine-email]

---

**Viel Erfolg! 🚀**
