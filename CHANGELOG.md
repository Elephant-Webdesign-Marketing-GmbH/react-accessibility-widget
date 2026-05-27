# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2026-05-27

### Fixed

- Dialog and overlay UI render above host page content via React portal and maximum z-index stacking

### Added

- Installed package version shown in the settings dialog footer

## [1.3.0] - 2026-05-27

### Added

- **Text-to-Speech**: Read selected text or page content with automatic language detection
- **TTS controls**: Floating control bar with pause, resume, stop, and speech rate
- **Reading modes**: Automatic continuous reading (`SpeechReadMode.AUTO`) or reading with word highlighting (`SpeechReadMode.HIGHLIGHT`)
- **Long text support**: Automatic chunking for reliable playback of long content
- **Voice selection**: Choose from available system voices; prefers enhanced/premium voices when available
- **Imperative API**: `speak()`, `stop()`, `isSpeaking()`, `openSettings()`, `closeSettings()` via widget ref
- **Keyboard shortcut**: `Alt+R` to start/stop text-to-speech when enabled
- **Font size px fallback**: Automatic detection of rem vs. px-based pages; `PX_ZOOM` fallback for fixed pixel font sizes
- **`fontSizeScaling` prop**: Force `auto`, `rem-root`, or `px-zoom` scaling strategy
- **`FontSizeScalingMode` enum** exported from the package
- **Demo**: Side-by-side rem vs. px comparison section with scaling mode selector
- **i18n** for speech UI strings (`WidgetLocale` DE/EN)

### Changed

- Extended `AccessibilityWidget` props: `defaultSpeechLang`, `readContentSelector`, `fontSizeScaling`
- Updated README with TTS setup, API reference, and Chrome activation notes

## [1.2.3] - 2026-03-11

### Changed

- Style enhancements for AccessibilityWidget

## [1.2.2] - 2026-03-10

### Changed

- Improved modal functionality and viewport handling

## [1.2.0] - 2026-03-09

### Fixed

- Dialog viewport constraints on small screens

## [1.1.0] - 2026-03-08

### Added

- Interactive demo for widget position and offset configuration
- `position`, `offsetX`, and `offsetY` props
