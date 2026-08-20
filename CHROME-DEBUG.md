# Chrome Speech API Debug-Anleitung

## Problem
`window.speechSynthesis.speak()` wird aufgerufen, aber `onstart` Event feuert nie.

## ✅ LÖSUNG (erfolgreich getestet)

### **Chrome Experimental Features aktivieren** (WICHTIGSTE LÖSUNG!)

1. Öffne in Chrome: `chrome://flags/#enable-experimental-web-platform-features`
2. Stelle auf **"Enabled"**
3. **Chrome neu starten** (sehr wichtig!)
4. Testen

**Dies war das Problem!** Chrome blockiert standardmäßig die Speech API ohne experimentelle Features.

---

## Weitere Lösungsschritte (falls das obige nicht hilft)

### 1. Chrome-Audio-Einstellungen prüfen

1. Öffne Chrome
2. Gehe zu: `chrome://settings/content/sound`
3. Stelle sicher, dass:
   - ✅ "Websites können Audio abspielen" aktiviert ist
   - ✅ Keine blockierten Sites in der Liste sind

### 2. macOS-Systemeinstellungen prüfen

1. Öffne **Systemeinstellungen** → **Sicherheit & Datenschutz** → **Datenschutz**
2. Suche nach **"Sprachwiedergabe"** oder **"Bedienungshilfen"**
3. Stelle sicher, dass **Google Chrome** in der Liste ist und ein Häkchen hat
4. Falls nicht: Klicke auf das Schloss, füge Chrome hinzu

### 3. Autoplay-Policy anpassen (optional)

Falls die Speech API weiterhin nicht funktioniert:
1. Gehe zu `chrome://flags/#autoplay-policy`
2. Stelle auf **"No user gesture is required"**
3. Chrome neu starten

### 4. Inkognito-Modus testen

1. Öffne Chrome im **Inkognito-Modus** (`Cmd+Shift+N`)
2. Öffne `test-speech-v2.html`
3. Klicke auf "Sprechen"
4. **Funktioniert es jetzt?** → Problem ist eine Extension

### 5. Audio-Ausgabegerät prüfen

1. Gehe zu: `chrome://settings/content/sound`
2. Prüfe **"Audioausgabe"**
3. Stelle sicher, dass das richtige Gerät ausgewählt ist (nicht Bluetooth während des Tests!)
4. **Bekanntes Problem**: Bluetooth-Headsets können Speech API blockieren

### 6. macOS-Stimmen prüfen

1. Öffne **Systemeinstellungen** → **Bedienungshilfen** → **Gesprochener Inhalt**
2. Klicke auf **"Systemstimme"**
3. Teste, ob die Stimme "Google Deutsch" funktioniert
4. Falls nicht: Lade die Stimme neu herunter

### 7. Chrome neu installieren (letzter Ausweg)

Falls nichts hilft:
1. Chrome komplett deinstallieren
2. Alle Chrome-Ordner löschen:
   - `~/Library/Application Support/Google/Chrome`
   - `~/Library/Caches/Google/Chrome`
3. Chrome neu installieren
4. Test erneut durchführen

## Vergleich: Safari

**Teste bitte auch Safari:**

1. Öffne `test-speech-v2.html` in Safari
2. Klicke auf "Sprechen"
3. **Funktioniert es?**

Falls Safari funktioniert, aber Chrome nicht → Es ist definitiv ein Chrome-spezifisches Problem auf deinem System.

## Quick-Test: macOS `say` Befehl

Öffne das Terminal und führe aus:

```bash
say -v "Anna" "Hallo, dies ist ein Test"
```

**Hörst du etwas?**
- ✅ Ja → macOS TTS funktioniert grundsätzlich
- ❌ Nein → macOS-Systemproblem

## Nächste Schritte

Bitte arbeite die Punkte 1-6 durch und teile mir mit:
1. Welche Einstellung falsch war (falls gefunden)
2. Ob Inkognito-Modus funktioniert
3. Ob Safari funktioniert
4. Ob der `say` Befehl funktioniert
