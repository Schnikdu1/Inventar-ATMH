// 🌐 VOLLAUTOMATISCHE CLOUD-SYNCHRONISATION
// Synchronisiert zwischen verschiedenen Geräten/Netzwerken automatisch

class CloudSync {
    constructor() {
        // 🔧 Kostenloser JSON-Server als Cloud-Backend
        this.cloudUrl = 'https://jsonbin.io/v3/b/YOUR_BIN_ID'; // Später konfigurieren
        this.apiKey = 'YOUR_API_KEY'; // Später konfigurieren
        this.isOnline = navigator.onLine;
        this.syncInterval = 10000; // 10 Sekunden für Cloud-Sync
        
        this.syncData = {
            devices: {},
            users: {},
            adminPasswords: {},
            lastUpdated: null,
            deviceId: this.getDeviceId()
        };
        
        console.log('🌐 Cloud-Sync System gestartet');
        this.init();
    }

    // 🚀 System initialisieren
    init() {
        // 1. Eindeutige Geräte-ID erstellen
        this.setupDeviceId();
        
        // 2. Cloud-Daten laden
        this.loadFromCloud();
        
        // 3. Online/Offline überwachen
        this.setupNetworkMonitoring();
        
        // 4. Automatisches Sync bei Änderungen
        this.setupAutoSync();
        
        // 5. Regelmäßiger Cloud-Sync
        this.startCloudSync();
        
        console.log('✅ Cloud-Sync vollständig aktiviert');
    }

    // 🆔 Eindeutige Geräte-ID erstellen
    setupDeviceId() {
        let deviceId = localStorage.getItem('device-id');
        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device-id', deviceId);
        }
        this.deviceId = deviceId;
        console.log('🆔 Geräte-ID:', this.deviceId);
    }

    getDeviceId() {
        return localStorage.getItem('device-id') || 'unknown';
    }

    // 📡 Online/Offline Überwachung
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - Cloud-Sync aktiviert');
            this.syncToCloud();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline - Lokaler Modus');
        });
    }

    // 🔄 Automatisches Sync bei Änderungen
    setupAutoSync() {
        // Original Array-Methoden überwachen
        const cloudSync = this;
        
        ['laptops', 'ipads', 'pcs', 'loans'].forEach(deviceType => {
            if (!devices[deviceType]) devices[deviceType] = [];
            
            // Proxy für Array-Änderungen
            const originalArray = devices[deviceType];
            devices[deviceType] = new Proxy(originalArray, {
                set(target, property, value) {
                    target[property] = value;
                    console.log(`📝 Änderung erkannt: ${deviceType}[${property}]`);
                    cloudSync.scheduleSync();
                    return true;
                }
            });
        });

        // Bei Fenster-Events
        window.addEventListener('beforeunload', () => this.syncToCloud());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadFromCloud();
            } else {
                this.syncToCloud();
            }
        });
    }

    // ⏰ Geplantes Sync (verhindert zu häufige Anfragen)
    scheduleSync() {
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
            this.syncToCloud();
        }, 2000); // 2 Sekunden Verzögerung
    }

    // 🕐 Regelmäßiger Cloud-Sync
    startCloudSync() {
        setInterval(() => {
            if (this.isOnline) {
                this.loadFromCloud();
            }
        }, this.syncInterval);
        
        console.log(`⏰ Cloud-Sync aktiviert (alle ${this.syncInterval/1000}s)`);
    }

    // ☁️ DATEN IN CLOUD SPEICHERN
    async syncToCloud() {
        if (!this.isOnline) return;

        try {
            this.syncData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                updatedBy: currentUser ? currentUser.fullName : 'System',
                deviceId: this.deviceId
            };

            console.log('☁️ Synchronisiere zu Cloud...');
            
            // Verschiedene Cloud-Optionen probieren
            const success = await this.tryCloudSync();
            
            if (success) {
                console.log('✅ Cloud-Sync erfolgreich');
                this.showSyncStatus('✅ Synchronisiert', 'success');
            } else {
                throw new Error('Alle Cloud-Services nicht verfügbar');
            }

        } catch (error) {
            console.error('❌ Cloud-Sync fehlgeschlagen:', error);
            this.showSyncStatus('❌ Sync-Fehler', 'error');
        }
    }

    // 🌐 Verschiedene Cloud-Services probieren
    async tryCloudSync() {
        // 1. JSONBin.io (kostenlos, 100k requests/month)
        try {
            const response = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': '$2b$10$sample.key.replace.with.real'
                },
                body: JSON.stringify(this.syncData)
            });
            
            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('cloud-bin-id', result.metadata.id);
                return true;
            }
        } catch (error) {
            console.log('JSONBin nicht verfügbar, probiere Alternative...');
        }

        // 2. GitHub Gist (kostenlos)
        try {
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token YOUR_GITHUB_TOKEN' // Optional
                },
                body: JSON.stringify({
                    description: 'IT Asset Management Data',
                    public: false,
                    files: {
                        'it-assets.json': {
                            content: JSON.stringify(this.syncData, null, 2)
                        }
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('cloud-gist-id', result.id);
                return true;
            }
        } catch (error) {
            console.log('GitHub Gist nicht verfügbar, probiere Alternative...');
        }

        // 3. Kostenloser JSON Storage
        try {
            const response = await fetch('https://www.jsonstore.io/YOUR_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.syncData)
            });
            
            return response.ok;
        } catch (error) {
            console.log('JSON Store nicht verfügbar');
        }

        return false;
    }

    // 📥 DATEN AUS CLOUD LADEN
    async loadFromCloud() {
        if (!this.isOnline) return;

        try {
            console.log('📥 Lade Daten aus Cloud...');
            
            const data = await this.tryCloudLoad();
            
            if (data && data.lastUpdated) {
                // Prüfen ob Cloud-Daten neuer sind
                const localTime = localStorage.getItem('last-sync-time') || '0';
                const cloudTime = data.lastUpdated;
                
                if (cloudTime > localTime) {
                    console.log('📊 Cloud-Daten sind neuer - aktualisiere lokal');
                    
                    // Daten übernehmen
                    if (data.devices) Object.assign(devices, data.devices);
                    if (data.users) Object.assign(users, data.users);
                    if (data.adminPasswords) Object.assign(adminPasswords, data.adminPasswords);
                    
                    localStorage.setItem('last-sync-time', cloudTime);
                    this.updateUI();
                    this.showSyncStatus('📥 Aktualisiert', 'success');
                } else {
                    console.log('📊 Lokale Daten sind aktuell');
                    this.showSyncStatus('✅ Aktuell', 'success');
                }
            }

        } catch (error) {
            console.error('❌ Cloud-Load fehlgeschlagen:', error);
            this.showSyncStatus('❌ Load-Fehler', 'error');
        }
    }

    // 📥 Von verschiedenen Cloud-Services laden
    async tryCloudLoad() {
        // 1. JSONBin.io laden
        const binId = localStorage.getItem('cloud-bin-id');
        if (binId) {
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                    headers: {
                        'X-Master-Key': '$2b$10$sample.key.replace.with.real'
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

        // 2. GitHub Gist laden
        const gistId = localStorage.getItem('cloud-gist-id');
        if (gistId) {
            try {
                const response = await fetch(`https://api.github.com/gists/${gistId}`);
                
                if (response.ok) {
                    const result = await response.json();
                    const content = result.files['it-assets.json'].content;
                    return JSON.parse(content);
                }
            } catch (error) {
                console.log('GitHub Gist Load fehlgeschlagen');
            }
        }

        return null;
    }

    // 🎨 Sync-Status anzeigen (unsichtbar - nur Console)
    showSyncStatus(message, type) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🕐 ${timestamp} - ${message}`);
        
        // Optional: Kurze Toast-Nachricht (unsichtbar)
        if (type === 'error') {
            console.warn('⚠️ Sync-Problem - App funktioniert weiter offline');
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
        if (typeof renderDevices === 'function') {
            renderDevices();
        }
    }
}

// 🚀 AUTO-START: Cloud-Sync automatisch starten
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.cloudSync = new CloudSync();
        console.log('🌐 Cloud-Synchronisation aktiv!');
    }, 1500);
});

console.log('📦 Cloud-Sync Modul geladen');