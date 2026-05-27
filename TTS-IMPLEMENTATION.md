# Text-to-Speech Implementation Details

## Übersicht

Die Vorlese-Funktion basiert auf der Web Speech API und bietet erweiterte Features wie Pause/Resume, lange Text-Unterstützung und intelligente Textextraktion.

## Architektur

### Module

1. **`useSpeechSynthesis.ts`** - Haupt-Hook für TTS-Funktionalität
   - Verwaltet den Lebenszyklus der Sprachausgabe
   - Koordiniert Text-Extraktion und Queue-Management
   - Stellt stabile Callbacks bereit (vermeidet React Re-Render-Loops)

2. **`SpeechChunkQueue.ts`** - Queue-Manager für lange Texte
   - Splittet Text in Chunks (max. 3000 Zeichen)
   - Sequentielle Wiedergabe
   - Pause/Resume/Stop-State-Machine
   - Fortschrittsanzeige

3. **`extractReadableText.ts`** - Intelligente Text-Extraktion
   - Erkennt sichtbare Inhalte
   - Ignoriert versteckte/script/style Elemente
   - Cached Selection für Modal-Dialoge
   - Entfernt Emojis und problematische Zeichen

4. **`speechSynthesisBrowserFixes.ts`** - Browser-spezifische Fixes
   - Voice-Loading mit `onvoiceschanged` Event
   - Pause/Resume-Support-Detection (Safari-Fix)
   - **Wichtig**: Bevorzugt lokale macOS-Stimmen über Chrome's "Google Deutsch"

5. **`SpeechFloatingControls.tsx`** - Schwebender Control-Dialog
   - Play/Pause/Stop Buttons
   - Lesemodus-Toggle (Auto/Highlight)
   - Fortschrittsanzeige
   - Minimale, nicht-aufdringliche UI

## Implementierungs-Details

### Voice Selection (KRITISCH für Chrome!)

Die Voice-Selection bevorzugt **lokale System-Stimmen** über Chrome's eigene Cloud-Stimmen:

```typescript
// Priorität:
// 1. Lokale System-Stimmen (Anna, Yannick, etc.) - ZUVERLÄSSIG
// 2. Premium/Enhanced Stimmen
// 3. Erste passende Stimme

const localVoice = matchingVoices.find((voice) => 
  voice.localService && !voice.name.toLowerCase().includes('google')
);
```

**Warum?** Chrome's "Google Deutsch" Stimme funktioniert nicht zuverlässig auf macOS Chrome, während lokale Stimmen (wie "Anna") perfekt funktionieren.

### React State Management

**Problem**: Callbacks in `useCallback` mit sich ändernden Dependencies führen zu Render-Loops.

**Lösung**: `useRef` für Callbacks + leere Dependencies:

```typescript
// Statt:
const handleStatus = useCallback((status) => {
  onStatusChange(status); // Re-rendert bei jedem onStatusChange-Update
}, [onStatusChange]);

// Besser:
const onStatusChangeRef = useRef(onStatusChange);
useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

const handleStatus = useCallback((status) => {
  onStatusChangeRef.current?.(status); // Stabiler Callback
}, []); // Leere Dependencies!
```

### Text Chunking

Lange Texte werden automatisch in Chunks aufgeteilt:

- **Max. 3000 Zeichen** pro Chunk
- Splitting an **Satzgrenzen** (`. ! ?`)
- Sequentielle Wiedergabe mit 50ms Pause zwischen Chunks
- Fortschrittsanzeige: `current / total` Chunks

### Emoji & Special Character Handling

Emojis und bestimmte Zeichen verursachen Probleme mit TTS-Engines:

```typescript
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .trim();
}
```

## Browser Quirks & Fixes

### Chrome

**Problem**: Speech API funktioniert nicht ohne experimentelle Features.

**Lösung**: User muss `chrome://flags/#enable-experimental-web-platform-features` aktivieren.

**Problem**: "Google Deutsch" Stimme silent failure.

**Lösung**: Bevorzuge lokale System-Stimmen (siehe Voice Selection).

### Safari

**Problem**: `pause()` / `resume()` funktionieren inkonsistent.

**Lösung**: Detection mit `isPauseResumeSupported()`, Fallback auf Stop/Restart.

### Firefox

Funktioniert zuverlässig, keine besonderen Fixes nötig.

## Testing

### Manueller Test

1. Chrome: `chrome://flags/#enable-experimental-web-platform-features` aktivieren
2. Demo öffnen
3. Vorlesefunktion aktivieren
4. Auf "Play" klicken
5. **Erwartete Stimme**: "Anna" (macOS) oder andere lokale Stimme
6. **Nicht**: "Google Deutsch"

### Debug-Modus

Setze in `speechSynthesisBrowserFixes.ts`:

```typescript
export function findBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  console.log('Available voices:', voices.map(v => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService
  })));
  // ... rest of code
}
```

## Performance

- **Initial Load**: ~50ms (Voice-Loading ist async und blockiert nicht)
- **Text Extraction**: O(n) mit n = DOM-Elemente
- **Chunking**: O(n) mit n = Text-Länge
- **Memory**: ~1-2KB pro Chunk im Queue

## Known Limitations

1. **Chrome ohne Experimental Features**: Keine Sprachausgabe
2. **Sehr lange Texte** (>100.000 Zeichen): Kann langsam werden
3. **Dynamischer Content**: Text-Änderungen während Wiedergabe werden nicht erkannt
4. **Highlight-Modus**: Noch nicht implementiert (TODO)

## Future Improvements (TODO)

- [ ] SpeechHighlightController implementieren
- [ ] Alt+R Shortcut
- [ ] Vitest Unit-Tests
- [ ] E2E Tests mit Playwright
- [ ] Unterstützung für mehr Sprachen (französisch, spanisch, etc.)
- [ ] Voice-Caching für schnellere Initialisierung
