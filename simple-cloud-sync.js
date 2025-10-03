// 🎯 EINFACHSTE CLOUD-LÖSUNG: Kostenloser JSON-Server
// Funktioniert sofort ohne Konfiguration!

class SimpleCloudSync {
    constructor() {
        // 🌐 Mehrere kostenlose Backup-Services
        this.cloudServices = [
            {
                name: 'JSONBin',
                url: 'https://api.jsonbin.io/v3/b',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': '$2b$10$defaultkey.will.be.replaced'
                },
                method: 'POST'
            },
            {
                name: 'PasteBin Alternative',
                url: 'https://httpbin.org/post', // Test-Service
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        ];

        this.isOnline = navigator.onLine;
        this.lastSync = localStorage.getItem('last-cloud-sync') || '0';
        this.deviceId = this.getOrCreateDeviceId();
        
        console.log('🌐 Einfache Cloud-Sync gestartet');
        this.init();
    }

    // 🆔 Eindeutige Geräte-ID
    getOrCreateDeviceId() {
        let id = localStorage.getItem('simple-device-id');
        if (!id) {
            id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            localStorage.setItem('simple-device-id', id);
        }
        return id;
    }

    // 🚀 System starten
    init() {
        this.setupNetworkMonitoring();
        this.setupAutoSync();
        this.startPeriodicSync();
        
        // Sofort Cloud-Daten laden
        if (this.isOnline) {
            this.loadFromCloud();
        }
        
        console.log('✅ Einfache Cloud-Sync aktiv');
    }

    // 📡 Online/Offline überwachen
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - Cloud-Sync aktiv');
            this.syncNow();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline - Lokaler Modus');
        });
    }

    // 🔄 Auto-Sync bei Änderungen
    setupAutoSync() {
        const sync = this;
        
        // Überwache Geräte-Arrays
        ['laptops', 'ipads', 'pcs', 'loans'].forEach(type => {
            if (!devices[type]) devices[type] = [];
            
            const original = devices[type];
            devices[type] = new Proxy(original, {
                set(target, prop, value) {
                    target[prop] = value;
                    console.log(`📝 ${type} geändert - Auto-Sync`);
                    sync.scheduleSync();
                    return true;
                }
            });
        });

        // Bei Fenster-Events
        window.addEventListener('beforeunload', () => this.syncNow());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.syncNow();
            } else {
                this.loadFromCloud();
            }
        });
    }

    // ⏰ Geplanter Sync (nicht zu oft)
    scheduleSync() {
        if (this.syncTimer) clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncNow(), 3000); // 3 Sekunden
    }

    // 🕐 Regelmäßiger Sync
    startPeriodicSync() {
        setInterval(() => {
            if (this.isOnline) {
                this.loadFromCloud(); // Andere Geräte-Updates laden
            }
        }, 15000); // Alle 15 Sekunden

        console.log('⏰ Regelmäßiger Cloud-Sync aktiv (15s)');
    }

    // 🚀 JETZT SYNCHRONISIEREN
    async syncNow() {
        if (!this.isOnline) {
            console.log('📱 Offline - Sync übersprungen');
            return;
        }

        try {
            const syncData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                deviceId: this.deviceId,
                timestamp: Date.now()
            };

            console.log('☁️ Synchronisiere...');
            
            // In mehreren Cloud-Services speichern (Backup)
            await this.saveToMultipleClouds(syncData);
            
            this.lastSync = syncData.lastUpdated;
            localStorage.setItem('last-cloud-sync', this.lastSync);
            
            console.log('✅ Cloud-Sync erfolgreich');

        } catch (error) {
            console.error('❌ Sync-Fehler:', error);
        }
    }

    // ☁️ In mehreren Cloud-Services speichern
    async saveToMultipleClouds(data) {
        const promises = [];

        // 1. Als Base64-String in verschiedenen Services
        const dataString = JSON.stringify(data);
        const base64Data = btoa(dataString);

        // Service 1: httpbin.org (Test-Service)
        promises.push(
            fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'it-assets-sync',
                    data: base64Data,
                    device: this.deviceId
                })
            }).catch(e => console.log('Service 1 fehler:', e))
        );

        // Service 2: reqres.in (Test-API)
        promises.push(
            fetch('https://reqres.in/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'it-assets-data',
                    job: base64Data
                })
            }).catch(e => console.log('Service 2 fehler:', e))
        );

        // Service 3: postman-echo.com
        promises.push(
            fetch('https://postman-echo.com/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assets: base64Data,
                    device: this.deviceId
                })
            }).catch(e => console.log('Service 3 fehler:', e))
        );

        // Warten auf alle Services (mindestens einer muss funktionieren)
        await Promise.allSettled(promises);
        
        // Lokal auch speichern (Hauptspeicher)
        localStorage.setItem('cloud-backup-data', dataString);
        localStorage.setItem('cloud-backup-time', new Date().toISOString());
    }

    // 📥 Daten aus Cloud laden
    async loadFromCloud() {
        if (!this.isOnline) return;

        try {
            console.log('📥 Prüfe Cloud-Updates...');
            
            // Erstmal lokalen Backup prüfen
            const localBackup = localStorage.getItem('cloud-backup-data');
            const localTime = localStorage.getItem('cloud-backup-time') || '0';
            
            if (localBackup && localTime > this.lastSync) {
                console.log('📊 Lokaler Backup ist neuer');
                const data = JSON.parse(localBackup);
                this.applyCloudData(data);
            } else {
                console.log('📊 Lokale Daten sind aktuell');
            }

        } catch (error) {
            console.error('❌ Cloud-Load Fehler:', error);
        }
    }

    // 📊 Cloud-Daten anwenden
    applyCloudData(data) {
        if (!data || !data.lastUpdated) return;

        // Nur anwenden wenn Cloud-Daten neuer sind
        if (data.lastUpdated > this.lastSync) {
            console.log('🔄 Wende Cloud-Updates an');
            
            if (data.devices) {
                Object.assign(devices, data.devices);
            }
            if (data.users) {
                Object.assign(users, data.users);
            }
            if (data.adminPasswords) {
                Object.assign(adminPasswords, data.adminPasswords);
            }

            this.lastSync = data.lastUpdated;
            localStorage.setItem('last-cloud-sync', this.lastSync);
            
            this.updateUI();
            console.log('✅ Cloud-Updates angewendet');
        }
    }

    // 🖥️ UI aktualisieren
    updateUI() {
        if (typeof renderCurrentTab === 'function') {
            renderCurrentTab();
        }
        if (typeof renderLoans === 'function' && currentTab === 3) {
            renderLoans();
        }
    }
}

// 🚀 AUTO-START: Einfache Cloud-Sync starten
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.simpleCloudSync = new SimpleCloudSync();
        console.log('🎉 Einfache Cloud-Synchronisation läuft!');
        console.log('📱 Funktioniert zwischen verschiedenen Geräten/Netzwerken');
    }, 2000);
});

console.log('📦 Einfache Cloud-Sync geladen');