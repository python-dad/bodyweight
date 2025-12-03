# BodyTracker - Körpergewicht & Körperfett Tracking App

Eine Desktop-Anwendung zur Aufzeichnung und Visualisierung von Körpergewicht und Körperfettgehalt mit permanenter lokaler Datenspeicherung.

## Features

- **Dateneingabe**: Gewicht, Körperfett (Jackson/Pollock 3-Falten-Methode), Notizen und Fotos
- **Dashboard**: Übersicht mit aktuellen Werten, Trends und Statistiken
- **Visualisierung**: Interaktive Charts für Gewichts- und Körperfettverlauf
- **Permanente Speicherung**: Alle Daten werden in lokalen JSON-Dateien gespeichert
- **Datenmanagement**: Export (JSON, CSV, PDF), Import, Backup
- **Theme-System**: Hell/Dunkel-Modus
- **Responsive Design**: Optimiert für Desktop

## Installation (Electron Desktop-App)

### Voraussetzungen
- [Node.js](https://nodejs.org/) (Version 18 oder höher)

### Schritte

1. **Öffnen Sie ein Terminal und navigieren Sie zum Projektordner:**
   ```bash
   cd /Users/Username/BodyWeight
   ```

2. **Installieren Sie die Abhängigkeiten:**
   ```bash
   npm install
   ```

3. **Starten Sie die Anwendung:**
   ```bash
   npm start
   ```

### App als eigenständige Anwendung bauen (optional)

```bash
# Für macOS
npm run build:mac

# Für Windows
npm run build:win

# Für Linux
npm run build:linux
```

Die fertige App wird im `dist/` Ordner erstellt.

## Datenspeicherung

### Speicherort
Die Daten werden automatisch im Benutzer-Datenverzeichnis gespeichert:

- **macOS**: `~/Library/Application Support/bodytracker/data/`
- **Windows**: `%APPDATA%/bodytracker/data/`
- **Linux**: `~/.config/bodytracker/data/`

### Dateien
- `entries.json` - Alle Messeinträge (Gewicht, Körperfett, Datum, etc.)
- `settings.json` - Einstellungen (Ziele, Theme, Standardwerte)
- `images/` - Ordner mit gespeicherten Fotos

Die Daten bleiben permanent erhalten und überleben App-Updates, Neustarts und Browser-Cache-Löschungen.

## Projektstruktur

```
BodyWeight/
├── index.html          # Haupt-HTML-Datei
├── main.js             # Electron Hauptprozess
├── preload.js          # Electron Preload Script
├── package.json        # Node.js Projektkonfiguration
├── css/
│   └── styles.css      # Alle Styles inkl. Theme-System
├── js/
│   ├── storage.js      # Datenspeicherung (Dateisystem)
│   ├── charts.js       # Chart.js Visualisierungen
│   └── app.js          # Hauptanwendungslogik
├── assets/
│   └── illustration.jpg # Messpunkt-Illustration
└── README.md           # Diese Datei
```

## Bedienung

### Neue Messung hinzufügen
1. Klicken Sie auf "Neue Messung" in der Navigation
2. Geben Sie Datum und Gewicht ein
3. Aktivieren Sie optional die Caliper-Messung für die Jackson/Pollock Methode
4. Wählen Sie Geschlecht und Alter, dann geben Sie die Hautfaltenwerte ein
5. Der Körperfettanteil wird automatisch berechnet
6. Fügen Sie bei Bedarf Notizen und Fotos hinzu
7. Speichern Sie die Messung

### Jackson/Pollock 3-Falten-Methode

**Messpunkte für Männer:**
1. Brust (diagonal)
2. Bauch (vertikal)
3. Oberschenkel (vertikal)

**Messpunkte für Frauen:**
1. Trizeps (vertikal)
2. Hüfte/Suprailiac (diagonal)
3. Oberschenkel (vertikal)

### Daten exportieren/importieren
- **JSON Export**: Vollständiges Backup inklusive Bilder
- **CSV Export**: Tabellenformat für Excel/Numbers
- **PDF Export**: Druckbare Übersicht
- **Import**: JSON-Dateien aus vorherigen Exporten

### Ziele setzen
In den Einstellungen können Sie Ihr Zielgewicht und Ziel-Körperfett definieren.

## Technische Details

### Verwendete Technologien
- Electron (Desktop-Framework)
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js für Visualisierungen
- Node.js Dateisystem-APIs
- Font Awesome für Icons

### Performance
- Bilder werden automatisch komprimiert (max. 1200px)
- Thumbnails werden für Vorschauen generiert
- Effiziente JSON-Dateispeicherung

## Datenschutz

Alle Daten werden ausschließlich lokal auf Ihrem Computer gespeichert. Es werden keine Daten an externe Server übertragen.

## Lizenz

MIT License - Freie Verwendung und Anpassung erlaubt.
