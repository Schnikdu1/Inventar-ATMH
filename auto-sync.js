// 🔄 VOLLAUTOMATISCHE SYNCHRONISATION
// Läuft komplett unsichtbar im Hintergrund - KEINE Buttons nötig!

class AutoSync {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncData = {
            devices: {},
            users: {},
            adminPasswords: {},
            lastUpdated: null
        };
        
        console.log('🔄 Auto-Sync System gestartet (vollautomatisch)');
        this.init();
    }

    // System starten
    init() {
        // 1. Lokale Daten laden
        this.loadLocal();
        
        // 2. Online/Offline überwachen
        this.setupNetworkMonitoring();
        
        // 3. Cross-Tab Synchronisation (zwischen Browser-Tabs)
        this.setupCrossTabSync();
        
        // 4. Automatisches Speichern bei Änderungen
        this.setupAutoSave();
        
        // 5. Regelmäßiger Sync alle 30 Sekunden
        this.startPeriodicSync();
        
        console.log('✅ Auto-Sync vollständig aktiviert');
    }

    // 📡 Online/Offline Überwachung
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online erkannt - Sync aktiviert');
            this.syncNow();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline erkannt - Lokaler Modus');
        });
    }

    // 🔄 Cross-Tab Synchronisation (zwischen Browser-Tabs)
    setupCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'it-assets-auto-sync' && e.newValue) {
                console.log('📨 Update von anderem Tab erhalten');
                this.loadLocal();
                this.updateUI();
            }
        });
    }

    // 💾 Automatisches Speichern bei jeder Änderung
    setupAutoSave() {
        // Überwache Änderungen an den globalen Daten
        const originalPush = Array.prototype.push;
        const autoSync = this;
        
        // Überwache devices Array Änderungen
        ['laptops', 'ipads', 'pcs', 'loans'].forEach(deviceType => {
            if (!devices[deviceType]) devices[deviceType] = [];
            
            // Wenn neue Geräte hinzugefügt werden
            const originalArray = devices[deviceType];
            devices[deviceType] = new Proxy(originalArray, {
                set(target, property, value) {
                    target[property] = value;
                    console.log(`📝 Änderung erkannt: ${deviceType}[${property}]`);
                    autoSync.syncNow();
                    return true;
                }
            });
        });

        // Speichere auch bei Fenster schließen
        window.addEventListener('beforeunload', () => {
            this.syncNow();
        });

        // Speichere bei Tab-Wechsel
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.syncNow(); // Speichern beim Verlassen
            } else {
                this.loadLocal(); // Laden beim Zurückkommen
                this.updateUI();
            }
        });
    }

    // ⏰ Regelmäßiger Sync alle 30 Sekunden
    startPeriodicSync() {
        setInterval(() => {
            this.syncNow();
        }, 30000); // 30 Sekunden

        console.log('⏰ Periodischer Sync aktiviert (alle 30s)');
    }

    // 🚀 HAUPTFUNKTION: Jetzt synchronisieren
    syncNow() {
        // Sammle aktuelle Daten
        this.syncData = {
            devices: devices,
            users: users,
            adminPasswords: adminPasswords,
            lastUpdated: new Date().toISOString(),
            updatedBy: currentUser ? currentUser.fullName : 'System'
        };

        // Speichere lokal (für Cross-Tab Sync)
        this.saveLocal();

        // Wenn online: Auch in Cloud speichern (optional)
        if (this.isOnline) {
            this.saveToCloud();
        }

        console.log('💾 Auto-Sync abgeschlossen:', new Date().toLocaleTimeString());
    }

    // 📁 Lokale Speicherung (Cross-Tab Sync)
    saveLocal() {
        try {
            localStorage.setItem('it-assets-auto-sync', JSON.stringify(this.syncData));
            
            // Event für andere Tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'it-assets-auto-sync',
                newValue: JSON.stringify(this.syncData)
            }));
            
        } catch (error) {
            console.error('❌ Lokales Speichern fehlgeschlagen:', error);
        }
    }

    // 📂 Lokale Daten laden
    loadLocal() {
        try {
            const saved = localStorage.getItem('it-assets-auto-sync');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Daten in globale Variablen laden
                if (data.devices) Object.assign(devices, data.devices);
                if (data.users) Object.assign(users, data.users);
                if (data.adminPasswords) Object.assign(adminPasswords, data.adminPasswords);
                
                console.log('📂 Lokale Daten geladen');
                return true;
            }
        } catch (error) {
            console.error('❌ Lokales Laden fehlgeschlagen:', error);
        }
        return false;
    }

    // ☁️ Cloud-Speicherung (optional - Sie können das weglassen)
    async saveToCloud() {
        // Hier können Sie später eine Cloud-Lösung einfügen
        // Für jetzt läuft alles lokal + Cross-Tab
        console.log('☁️ Cloud-Sync bereit (noch nicht konfiguriert)');
    }

    // 🖥️ UI aktualisieren
    updateUI() {
        // Aktualisiere die Anzeige
        if (typeof renderCurrentTab === 'function') {
            renderCurrentTab();
        }
        if (typeof renderLoans === 'function' && currentTab === 3) {
            renderLoans();
        }
        if (typeof renderDevices === 'function') {
            renderDevices();
        }
    }
}

// 🚀 AUTO-START: System startet automatisch
document.addEventListener('DOMContentLoaded', () => {
    // Kurz warten bis alles geladen ist
    setTimeout(() => {
        window.autoSync = new AutoSync();
        console.log('🎉 Vollautomatische Synchronisation aktiv!');
    }, 1000);
});

console.log('📦 Auto-Sync Modul geladen');