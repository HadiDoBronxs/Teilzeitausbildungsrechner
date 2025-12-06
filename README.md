# TZR Rechner

Eine leichtgewichtige React-Anwendung auf Basis von Vite. Das Projekt dient als Ausgangspunkt für den Teilzeitausbildungsrechner und bietet Hot Module Reloading sowie Tailwind CSS für das Styling.

## Voraussetzungen
- Node.js 20 oder neuer (empfohlen)
- npm 10 oder neuer

## Installation
```bash
npm install
```

## Lokale Entwicklung
```bash
npm run dev
```
Der Dev-Server läuft standardmäßig unter `http://localhost:5173`.

## Qualitätschecks
- `npm run lint` überprüft den Code mit ESLint.

## Produktion
```bash
npm run build
npm run preview
```
`build` erzeugt den Produktionsbuild im Ordner `dist`, `preview` dient zur lokalen Kontrolle des Builds.

## Docker
```bash
docker build -t tzr-rechner .
docker run -p 8080:80 tzr-rechner
```
Der Container liefert den Produktionsbuild über Nginx aus und ist anschließend unter `http://localhost:8080` erreichbar.

## Projektstruktur
- `src/` – React-Komponenten und Tailwind-Konfiguration
- `public/` – statische Assets
- `vite.config.js` – Vite-Konfiguration mit React-Plugin

Hinweis: Eine detaillierte Beschreibung der Architektur, der Ordnerstruktur und des Component-Designs findest du in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Weiterführende Links
- [Vite Dokumentation](https://vite.dev)
- [React Dokumentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)