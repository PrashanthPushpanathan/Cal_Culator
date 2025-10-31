# CalCulator

## Was ist CalCulator
Lerne mehr über Cal-Culator im [Wiki](https://github.com/PrashanthPushpanathan/Cal_Culator/wiki).

CalCulator ist eine mobile Anwendung zur Ernährungsanalyse. Sie ermöglicht es Benutzern, Lebensmittel zu scannen oder manuell einzugeben, um Nährwertinformationen wie Kalorien, Proteine, Fette und Kohlenhydrate zu erhalten.

## Features

- 𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃 **Barcode Scannen für Lebensmittel:** Die Kamera erkennt den Barcode eines Lebensmittels und fügt das Produkt direkt zum Ernährungskalender hinzu, um die Mahlzeiten zu dokumentieren.

- 💾 **Speichern aller Nährwerte und Inhaltsstoffe:** Jedes gescannte oder manuell eingegebene Lebensmittel wird mit allen relevanten Nährwerten und Inhaltsstoffen gespeichert, um eine präzisere Dokumentation der Mahlzeiten zu ermöglichen.

- 📅 **Kalenderansicht für Ernährungshistorie:** Benutzer können auf einen Kalender zugreifen, der vergangene Mahlzeiten und die zugehörigen Kalorien anzeigt. Dies bietet einen klaren Überblick über die Ernährungsgewohnheiten.

- **Farbliche Markierung der Kaloriendaten:** Tage, an denen das Kalorienziel überschritten wurde, werden rot markiert, während Tage, an denen das Ziel eingehalten wurde, grün angezeigt werden, um eine schnelle visuelle Rückmeldung zur Einhaltung des Kalorienziels zu bieten.

- 🔥 **Tägliche Schrittzählung und Kalorienverbrauch:** Die App berechnet und zeigt den Kalorienverbrauch basierend auf den täglichen Schritten des Benutzers und persönlichen Daten wie Gewicht, Größe und Alter an.

- ⌕ **Lebensmittel-Suchfunktion (Food API Integration):** Benutzer können Lebensmittel suchen, um die Nährwertinformationen schnell zu finden und in ihren Ernährungskalender aufzunehmen.

- ⚠️ **Allergie-Management mit AI-Unterstützung:** Die App ermöglicht es Benutzern, ihre Allergien zu hinterlegen. Wenn ein Lebensmittel hinzugefügt wird, prüft die AI, ob es Inhaltsstoffe enthält, die den Allergien des Benutzers entsprechen und warnt bei einem Allergieverdacht.

- 🔐 **Login und Benutzerverwaltung:** Ein sicherer Login- und Registrierungsprozess ermöglicht es neuen Benutzern, ein Konto zu erstellen, ihre persönlichen Daten zu speichern und sich sicher anzumelden.

## Start App
### Expo
[Mehr](./docs/StartExpo.md)

1. **Installiere Abhängigkeiten:**
   ```bash
   npm install

2. **Starte die App:**
   `npx expo start`
   
Im Output wirst du Optionen finden, die App in einem Entwicklungsbuild, Android Emulator, iOS Simulator oder mit Expo Go zu öffnen.

## Tech Stack
- **Frontend:** React Native
- **Backend:** Node.js, OpenAI API (Bildanalyse)
- **Datenbank:** AsyncStorage (für lokale Speicherung)
- **Sicherheit:** JWT, OAuth 2.0, TLS/SSL Verschlüsselung

## Lizenz
CalCulator ist unter der [MIT Lizenz](LICENSE) lizenziert.

## Contributing
1. Forke das Repository.
2. Erstelle einen neuen Branch für deine Änderungen (`git checkout -b feature-xyz`).
3. Committe deine Änderungen (`git commit -am 'Add new feature'`).
4. Push den Branch (`git push origin feature-xyz`).
5. Erstelle einen Pull Request.

## Kontakt
Für Fragen oder Unterstützung, kontaktiere uns über das [Projekt-Repository](https://github.com/PrashanthPushpanathan/Cal_Culator).
