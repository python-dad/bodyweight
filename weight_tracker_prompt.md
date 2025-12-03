# 1-Shot Prompt: Körpergewicht & Körperfett-Tracking App

## Projektanforderung
Entwickle eine Mac OS X-kompatible Anwendung (Browser-basiert oder eigenständige App) zur Aufzeichnung und Visualisierung von Körpergewicht und Körperfettgehalt mit folgenden Spezifikationen:

## Funktionale Anforderungen

### 1. Dateneingabe
- **Körpergewicht**: Numerische Eingabe mit Dezimalstellen (kg)
- **Körperfettgehalt**: Prozentuale Eingabe nach Fat Caliper Methode
- **Messzeitpunkt**: Automatische Zeitstempel mit manueller Bearbeitungsmöglichkeit
- **Notizen**: Freitext-Feld für zusätzliche Informationen
- **Bilder**: Upload-Funktion für Fotos zum jeweiligen Messzeitpunkt

### 2. Dashboard & Visualisierung
- **Übersichtsdashboard** mit aktuellen Werten und Trends
- **Zeitverlaufs-Diagramme**: 
  - Körpergewicht über Zeit (Liniendiagramm)
  - Körperfettgehalt über Zeit (Liniendiagramm)
  - Vergleichsdarstellung beider Werte
- **Statistiken**:
  - Gesamtgewichtsverlust/-zunahme
  - Körperfettveränderung
  - Zeitraum-Statistiken (Woche, Monat, Jahr)
- **Export-Funktion**: CSV/PDF Export der Daten

### 3. Datenmanagement
- **Lokale Speicherung**: Verwendung von IndexedDB oder localStorage
- **Backup/Import**: JSON-basierte Datensicherung
- **Datenvalidierung**: Eingabevalidierung und Plausibilitätsprüfungen
- **Suchfunktion**: Filterung nach Datum, Gewichtsbereichen, etc.

## Technische Spezifikationen

### Platform-Anforderungen
- **Primär**: Mac OS X (10.15+)
- **Browser-Support**: Safari 14+, Chrome 90+, Firefox 88+
- **Responsive Design**: Optimiert für Desktop (primary) und Tablet

### Technologie-Stack (Empfehlung)
```
Frontend: HTML5, CSS3, JavaScript (ES6+)
Charts: Chart.js oder D3.js
UI Framework: Bootstrap 5 oder Vanilla CSS
Icons: Font Awesome oder Heroicons
Storage: IndexedDB für Bilder, localStorage für Metadaten
```

### UI/UX-Anforderungen
- **Sauberes, minimalistisches Design**
- **Intuitive Navigation** zwischen Eingabe und Dashboard
- **Mobile-First Ansatz** für responsive Darstellung
- **Accessibility**: WCAG 2.1 AA konform
- **Dunkler/Heller Modus** Toggle

## Datenstruktur

### Messwerte-Schema
```json
{
  "id": "uuid",
  "date": "2025-12-03T19:19:03Z",
  "weight": 75.5,
  "bodyFat": 15.2,
  "notes": "Optional notes",
  "images": ["image1.jpg", "image2.jpg"],
  "createdAt": "2025-12-03T19:19:03Z"
}
```

### Bild-Management
- **Thumbnail-Erstellung**: Automatische Größenanpassung für Vorschau
- **Komprimierung**: Optimierte Speicherung
- **Bildformate**: JPG, PNG, HEIC Support

## Implementierungsschritte

1. **Projekt-Setup**
   - Ordnerstruktur erstellen
   - Package.json (falls Node.js verwendet)
   - Build-Tools konfigurieren

2. **Core-Funktionalität**
   - Datenmodelle und Storage-Layer
   - CRUD-Operationen für Messwerte
   - Bild-Upload und -Management

3. **UI-Entwicklung**
   - Eingabeformular
   - Dashboard mit Charts
   - Responsive Layout

4. **Features**
   - Datenvalidierung
   - Export/Import-Funktionen
   - Theme-System (Light/Dark)

5. **Testing & Optimierung**
   - Cross-Browser-Tests
   - Performance-Optimierung
   - Mac OS X spezifische Tests

## Besondere Anforderungen

### Fat Caliper Integration
- **Hinweise zur Messmethode**: Tooltip oder Hilfefunktion
- **Messpunkte**: Dokumentation der Standard-Messstellen
- **Genauigkeit**: Hinweise zur Messgenauigkeit

### Performance
- **Optimierte Charts**: Für große Datensätze
- **Lazy Loading**: Für Bilder
- **Caching**: Für bessere Performance

## Deliverables
1. Vollständiger Quellcode
2. Installation/Setup-Anleitung
3. Benutzerhandbuch
4. Datenbank-Schema-Dokumentation
5. Test-Daten für Demo-Zwecke

## Zusätzliche Features (Nice-to-Have)
- **Zielsetzung**: Gewichts- und Körperfett-Ziele definieren
- **Erinnerungen**: Push-Benachrichtigungen für regelmäßige Messungen
- **Ernährungstagebuch**: Integration mit Kalorien-Tracking
- **Wettbewerbe**: Vergleich mit anderen Nutzern (anonym)
- **Apple Health Integration**: Datenimport aus Health App

Erstelle eine vollständige, funktionsfähige Anwendung mit sauberem, dokumentiertem Code und einer benutzerfreundlichen Oberfläche.