# 🖥️ IT Asset Management System

Eine moderne Web-Anwendung zur Verwaltung von IT-Assets mit **Echtzeit-Synchronisation** zwischen allen Geräten.

## 🌐 Live Demo
**Website:** [https://ihr-username.github.io/it-asset-management](https://ihr-username.github.io/it-asset-management)

## ✨ Features

### 📱 **Geräte-Management**
- ✅ Laptops, iPads & PCs verwalten
- ✅ Barcode-Generator & Scanner
- ✅ CSV Import/Export
- ✅ Defekt-Meldungen

### 🔄 **Ausleihe-System** 
- ✅ Geräte-Ausleihe mit Tracking
- ✅ Rückgabe-Management  
- ✅ Überfälligkeits-Warnungen

### 👥 **Benutzer-Verwaltung**
- ✅ Rollen-basierte Zugriffe
- ✅ Admin-Panel
- ✅ Passwort-Management

### 🌐 **Echtzeit-Synchronisation**
- ✅ **Universal Sync** - Alle Geräte synchron
- ✅ **Automatische Updates** zwischen Benutzern
- ✅ **Offline-Support** mit Auto-Sync
- ✅ **Mehrere Benutzer gleichzeitig**

## 🚀 Setup

### 1. Firebase konfigurieren
1. [Firebase Console](https://console.firebase.google.com) → Projekt erstellen
2. Realtime Database aktivieren (Testmodus)
3. Web-App registrieren → Config kopieren
4. In `universal-sync.js` (Zeile 16-24) einfügen

### 2. GitHub Pages aktivieren
1. Repository Settings → Pages
2. Source: "Deploy from branch" 
3. Branch: `main` / Folder: `/ (root)`
4. ✅ Website läuft unter: `username.github.io/repository-name`

## 👥 Standard-Login
- **Admin:** admin / Start123
- **User 1:** mads.duewel / Start123  
- **User 2:** jona.snoek / Start123

*Beim ersten Login Passwort ändern erforderlich*

## 🔄 Sync-Status
- 🟢 **Online - Echtzeit-Sync** = Perfekt!
- ⬆️ **Speichere...** = Upload läuft
- 🔄 **Update erhalten** = Neues Update von anderem Gerät
- 📱 **Offline** = Lokaler Modus

## 💰 Kosten
- **GitHub Pages:** ✅ Kostenlos (unbegrenzt)
- **Firebase:** ✅ Kostenlos (10GB + 100GB Traffic)
- **Gesamt:** ✅ **100% kostenlos!**

## 🛠️ Technologie
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Sync:** Firebase Realtime Database
- **Hosting:** GitHub Pages
- **Barcode:** JsBarcode + html5-qrcode
- **Icons:** Font Awesome

## 📁 Dateien
- `index.html` - Haupt-Anwendung
- `universal-sync.js` - Echtzeit-Synchronisation
- `enhanced-functions.js` - Erweiterte Features
- `COMPLETE-SETUP-GUIDE.md` - Detaillierte Anleitung

## 🌟 Highlights
- 🔥 **Echtzeit-Updates** ohne Reload
- 👥 **Multi-User fähig** 
- 📱 **Responsive Design**
- 🔒 **Sichere Authentifizierung**
- 📊 **Export-Funktionen**
- ⚡ **Schnelle Performance**

---

**Entwickelt für moderne IT-Asset-Verwaltung** 🚀