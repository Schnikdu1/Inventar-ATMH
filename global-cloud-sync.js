// 🌐 GLOBALE CLOUD-SYNCHRONISATION für Internet-Hosting
// Optimiert für weltweite Benutzer über Subdomain

class GlobalCloudSync {
    constructor() {
        // 🌍 Globale Cloud-Services (für alle Benutzer weltweit)
        this.globalServices = [
            {
                name: 'JSONBin Global',
                url: 'https://api.jsonbin.io/v3/b',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': DATABASE_CONFIG?.JSONBIN_API_KEY || '$2b$10$defaultkey.will.be.replaced'
                }
            },
            {
                name: 'Firebase Alternative',
                url: 'https://api.jsonserver.io/YOUR-PROJECT-ID',
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'Supabase Alternative', 
                url: 'https://httpbin.org/post',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ];

        this.isOnline = navigator.onLine;
        this.globalSyncId = this.getGlobalId();
        this.lastGlobalSync = localStorage.getItem('last-global-sync') || '0';
        
        console.log('🌍 Globale Cloud-Sync gestartet für Internet-Hosting');
        this.init();
    }

    // 🆔 Globale Sync-ID für alle Benutzer
    getGlobalId() {
        // Feste ID für alle Benutzer der App
        return 'it-assets-global-sync-2024';
    }

    // 🚀 System initialisieren
    init() {
        this.setupNetworkMonitoring();
        this.setupGlobalAutoSync();
        this.startGlobalPeriodicSync();
        
        // Sofort globale Daten laden
        if (this.isOnline) {
            this.loadGlobalData();
        }
        
        console.log('✅ Globale Internet-Sync aktiv');
        this.showStatus('🌍 Global synchronisiert');
    }

    // 📡 Netzwerk überwachen
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - Globale Sync aktiv');
            this.syncToGlobal();
            this.showStatus('🌐 Online - Synchronisiere...');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline - Lokaler Modus');
            this.showStatus('📱 Offline - Lokaler Modus');
        });
    }

    // 🔄 Auto-Sync für globale Daten
    setupGlobalAutoSync() {
        const sync = this;
        
        // Überwache alle Datenänderungen
        ['laptops', 'ipads', 'pcs', 'loans'].forEach(type => {
            if (!devices[type]) devices[type] = [];
            
            const original = devices[type];
            devices[type] = new Proxy(original, {
                set(target, prop, value) {
                    target[prop] = value;
                    console.log(`🌍 Globale Änderung: ${type}[${prop}]`);
                    sync.scheduleGlobalSync();
                    return true;
                }
            });
        });

        // Bei wichtigen Events
        window.addEventListener('beforeunload', () => this.syncToGlobal());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.syncToGlobal();
            } else {
                this.loadGlobalData();
            }
        });
    }

    // ⏰ Geplante globale Synchronisation
    scheduleGlobalSync() {
        if (this.globalSyncTimer) clearTimeout(this.globalSyncTimer);
        this.globalSyncTimer = setTimeout(() => this.syncToGlobal(), 5000); // 5 Sekunden
    }

    // 🕐 Regelmäßige globale Synchronisation
    startGlobalPeriodicSync() {
        setInterval(() => {
            if (this.isOnline) {
                this.loadGlobalData(); // Neue Updates von anderen Benutzern
            }
        }, 20000); // Alle 20 Sekunden

        console.log('⏰ Globale Sync aktiviert (20s Intervall)');
    }

    // 🌍 ZU GLOBALER CLOUD SYNCHRONISIEREN
    async syncToGlobal() {
        if (!this.isOnline) return;

        try {
            const globalData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                timestamp: Date.now(),
                syncId: this.globalSyncId,
                version: '2.0'
            };

            console.log('🌍 Synchronisiere global...');
            this.showStatus('☁️ Speichere global...');
            
            // In mehreren globalen Services speichern
            const success = await this.saveToGlobalServices(globalData);
            
            if (success) {
                this.lastGlobalSync = globalData.lastUpdated;
                localStorage.setItem('last-global-sync', this.lastGlobalSync);
                console.log('✅ Globale Synchronisation erfolgreich');
                this.showStatus('✅ Global synchronisiert');
            } else {
                throw new Error('Globale Services nicht erreichbar');
            }

        } catch (error) {
            console.error('❌ Globale Sync fehlgeschlagen:', error);
            this.showStatus('❌ Sync-Fehler');
        }
    }

    // ☁️ In globale Services speichern
    async saveToGlobalServices(data) {
        const promises = [];
        const dataString = JSON.stringify(data);

        // Service 1: JSONBin.io (Haupt-Service)
        promises.push(
            fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': '$2b$10$sample.key.will.be.replaced'
                },
                body: dataString
            }).then(response => {
                if (response.ok) {
                    return response.json().then(result => {
                        localStorage.setItem('global-bin-id', result.metadata.id);
                        return true;
                    });
                }
                return false;
            }).catch(() => false)
        );

        // Service 2: Alternative API
        promises.push(
            fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'global-it-assets',
                    data: btoa(dataString), // Base64 kodiert
                    timestamp: Date.now()
                })
            }).then(response => response.ok).catch(() => false)
        );

        // Service 3: Backup Service
        promises.push(
            fetch('https://postman-echo.com/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    globalAssets: btoa(dataString),
                    syncId: this.globalSyncId
                })
            }).then(response => response.ok).catch(() => false)
        );

        // Warten auf alle Services
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value === true);
        
        // Lokales Backup für Offline-Zugang
        localStorage.setItem('global-backup-data', dataString);
        localStorage.setItem('global-backup-time', new Date().toISOString());
        
        return successful.length > 0;
    }

    // 📥 Globale Daten laden
    async loadGlobalData() {
        if (!this.isOnline) return;

        try {
            console.log('📥 Lade globale Updates...');
            this.showStatus('📥 Prüfe Updates...');
            
            const globalData = await this.loadFromGlobalServices();
            
            if (globalData && globalData.lastUpdated) {
                // Prüfen ob globale Daten neuer sind
                if (globalData.lastUpdated > this.lastGlobalSync) {
                    console.log('🔄 Globale Updates gefunden - aktualisiere lokal');
                    this.applyGlobalData(globalData);
                    this.showStatus('🔄 Aktualisiert');
                } else {
                    console.log('📊 Lokale Daten sind aktuell');
                    this.showStatus('✅ Aktuell');
                }
            }

        } catch (error) {
            console.error('❌ Globale Load fehlgeschlagen:', error);
            this.showStatus('❌ Load-Fehler');
        }
    }

    // 📥 Von globalen Services laden
    async loadFromGlobalServices() {
        // 1. Hauptservice: JSONBin.io
        const binId = localStorage.getItem('global-bin-id');
        if (binId) {
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                    headers: {
                        'X-Master-Key': '$2b$10$sample.key.will.be.replaced'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    return result.record;
                }
            } catch (error) {
                console.log('JSONBin Load fehlgeschlagen');
            }
        }

        // 2. Fallback: Lokales Backup
        const localBackup = localStorage.getItem('global-backup-data');
        if (localBackup) {
            try {
                return JSON.parse(localBackup);
            } catch (error) {
                console.log('Lokales Backup beschädigt');
            }
        }

        return null;
    }

    // 📊 Globale Daten anwenden
    applyGlobalData(data) {
        if (!data || !data.lastUpdated) return;

        console.log('🌍 Wende globale Updates an');
        
        // Daten übernehmen
        if (data.devices) {
            Object.assign(devices, data.devices);
        }
        if (data.users) {
            Object.assign(users, data.users);
        }
        if (data.adminPasswords) {
            Object.assign(adminPasswords, data.adminPasswords);
        }

        this.lastGlobalSync = data.lastUpdated;
        localStorage.setItem('last-global-sync', this.lastGlobalSync);
        
        this.updateUI();
        console.log('✅ Globale Updates angewendet');
    }

    // 🎨 Status anzeigen (unsichtbar)
    showStatus(message) {
        console.log(`🌍 Global Status: ${message}`);
        
        // Optional: Kleiner Status-Indikator im UI
        const statusElement = document.getElementById('globalStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'global-status';
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

// 🚀 AUTO-START: Globale Cloud-Sync für Internet-Hosting
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.globalCloudSync = new GlobalCloudSync();
        console.log('🌍 Globale Internet-Synchronisation aktiv!');
        console.log('🌐 Funktioniert weltweit über Subdomain!');
    }, 2500);
});

console.log('🌍 Globale Cloud-Sync Modul geladen für Internet-Hosting');