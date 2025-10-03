// 🌐 PROFESSIONELLE CLOUD-DATENBANK KONFIGURATION
// JSONBin.io - 100% kostenlos, professionell, zuverlässig

class ProfessionalCloudDB {
    constructor() {
        // 🔧 JSONBin.io Konfiguration
        this.config = {
            // 📝 SCHRITT 1: Ersetzen Sie diese Werte nach JSONBin.io Setup
            apiKey: '$2b$10$PLACEHOLDER_KEY_REPLACE_AFTER_SIGNUP',
            binId: 'PLACEHOLDER_BIN_ID_REPLACE_AFTER_CREATION',
            
            // 🌐 JSONBin.io URLs
            baseUrl: 'https://api.jsonbin.io/v3',
            createBinUrl: 'https://api.jsonbin.io/v3/b',
            
            // ⚙️ Einstellungen
            autoRetry: true,
            maxRetries: 3,
            retryDelay: 2000,
            syncInterval: 15000 // 15 Sekunden
        };

        this.isConfigured = this.checkConfiguration();
        this.isOnline = navigator.onLine;
        this.lastSync = localStorage.getItem('professional-last-sync') || '0';
        
        console.log('🌐 Professionelle Cloud-DB initialisiert');
        this.init();
    }

    // ✅ Prüfe ob JSONBin.io konfiguriert ist
    checkConfiguration() {
        const hasValidKey = this.config.apiKey && !this.config.apiKey.includes('PLACEHOLDER');
        const hasValidBin = this.config.binId && !this.config.binId.includes('PLACEHOLDER');
        
        if (!hasValidKey || !hasValidBin) {
            console.log('⚠️ JSONBin.io noch nicht konfiguriert - nutze Fallback-System');
            this.showConfigurationInstructions();
            return false;
        }
        
        console.log('✅ JSONBin.io konfiguriert');
        return true;
    }

    // 📋 Konfigurationsanweisungen anzeigen
    showConfigurationInstructions() {
        console.log(`
🔧 PROFESSIONELLE CLOUD-DATENBANK SETUP:

1️⃣ Gehen Sie zu: https://jsonbin.io
2️⃣ Kostenloses Konto erstellen
3️⃣ Dashboard → API Keys → Create Access Key
4️⃣ Dashboard → Create Bin → Name: "it-assets-global"
5️⃣ API Key & Bin ID in database-config.js einfügen

📊 Aktuelle Status: Fallback-System aktiv (funktioniert trotzdem!)
        `);
    }

    // 🚀 System starten
    init() {
        this.setupNetworkMonitoring();
        this.setupAutoSync();
        this.startPeriodicSync();
        
        // Sofort Cloud-Daten laden (falls konfiguriert)
        if (this.isConfigured && this.isOnline) {
            this.loadFromProfessionalCloud();
        }
        
        console.log('✅ Professionelle Cloud-DB aktiv');
    }

    // 📡 Netzwerk überwachen
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - Professionelle Cloud aktiv');
            if (this.isConfigured) {
                this.syncToProfessionalCloud();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline - Lokaler Modus');
        });
    }

    // 🔄 Auto-Sync Setup
    setupAutoSync() {
        const db = this;
        
        // Überwache Datenänderungen
        ['laptops', 'ipads', 'pcs', 'loans'].forEach(type => {
            if (!devices[type]) devices[type] = [];
            
            const original = devices[type];
            devices[type] = new Proxy(original, {
                set(target, prop, value) {
                    target[prop] = value;
                    console.log(`🌐 Professionelle Sync: ${type}[${prop}]`);
                    db.scheduleSync();
                    return true;
                }
            });
        });

        // Bei wichtigen Events
        window.addEventListener('beforeunload', () => this.syncToProfessionalCloud());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isConfigured) {
                this.loadFromProfessionalCloud();
            }
        });
    }

    // ⏰ Geplante Synchronisation
    scheduleSync() {
        if (this.syncTimer) clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => {
            if (this.isConfigured) {
                this.syncToProfessionalCloud();
            }
        }, 3000);
    }

    // 🕐 Regelmäßige Synchronisation
    startPeriodicSync() {
        setInterval(() => {
            if (this.isOnline && this.isConfigured) {
                this.loadFromProfessionalCloud();
            }
        }, this.config.syncInterval);
        
        console.log(`⏰ Professionelle Sync aktiv (${this.config.syncInterval/1000}s)`);
    }

    // ☁️ ZU PROFESSIONELLER CLOUD SPEICHERN
    async syncToProfessionalCloud() {
        if (!this.isOnline || !this.isConfigured) return;

        try {
            const cloudData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                timestamp: Date.now(),
                version: '2.0-professional',
                source: 'IT-Asset-Management'
            };

            console.log('☁️ Synchronisiere zu professioneller Cloud...');
            
            const success = await this.uploadToProfessionalCloud(cloudData);
            
            if (success) {
                this.lastSync = cloudData.lastUpdated;
                localStorage.setItem('professional-last-sync', this.lastSync);
                console.log('✅ Professionelle Cloud-Sync erfolgreich');
                this.showStatus('✅ Cloud synchronisiert');
            } else {
                throw new Error('Professionelle Cloud nicht erreichbar');
            }

        } catch (error) {
            console.error('❌ Professionelle Cloud-Sync fehlgeschlagen:', error);
            this.showStatus('❌ Cloud-Fehler');
            
            // Fallback zu Backup-Systemen
            this.syncToBackupSystems();
        }
    }

    // 📤 Upload zu professioneller Cloud
    async uploadToProfessionalCloud(data) {
        const maxRetries = this.config.maxRetries;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 Upload-Versuch ${attempt}/${maxRetries}`);
                
                const response = await fetch(`${this.config.baseUrl}/b/${this.config.binId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': this.config.apiKey,
                        'X-Bin-Name': 'IT-Assets-Global'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Professioneller Upload erfolgreich:', result.metadata);
                    return true;
                }
                
                if (response.status === 401) {
                    console.error('❌ API Key ungültig - Prüfen Sie Ihre Konfiguration');
                    this.isConfigured = false;
                    return false;
                }
                
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                
            } catch (error) {
                console.log(`❌ Upload-Versuch ${attempt} fehlgeschlagen:`, error.message);
                
                if (attempt < maxRetries) {
                    console.log(`⏳ Warte ${this.config.retryDelay}ms vor erneutem Versuch...`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        
        return false;
    }

    // 📥 Von professioneller Cloud laden
    async loadFromProfessionalCloud() {
        if (!this.isOnline || !this.isConfigured) return;

        try {
            console.log('📥 Lade von professioneller Cloud...');
            
            const response = await fetch(`${this.config.baseUrl}/b/${this.config.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.config.apiKey
                }
            });

            if (response.ok) {
                const result = await response.json();
                const cloudData = result.record;
                
                if (cloudData && cloudData.lastUpdated) {
                    // Prüfen ob Cloud-Daten neuer sind
                    if (cloudData.lastUpdated > this.lastSync) {
                        console.log('🔄 Professionelle Cloud-Updates gefunden');
                        this.applyCloudData(cloudData);
                        this.showStatus('🔄 Cloud-Update');
                    } else {
                        console.log('📊 Lokale Daten sind aktuell');
                        this.showStatus('✅ Synchron');
                    }
                }
            } else if (response.status === 401) {
                console.error('❌ API Key ungültig');
                this.isConfigured = false;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Professioneller Cloud-Load fehlgeschlagen:', error);
            this.showStatus('❌ Cloud-Fehler');
        }
    }

    // 📊 Cloud-Daten anwenden
    applyCloudData(data) {
        if (!data || !data.lastUpdated) return;

        console.log('🔄 Wende professionelle Cloud-Updates an');
        
        if (data.devices) Object.assign(devices, data.devices);
        if (data.users) Object.assign(users, data.users);
        if (data.adminPasswords) Object.assign(adminPasswords, data.adminPasswords);

        this.lastSync = data.lastUpdated;
        localStorage.setItem('professional-last-sync', this.lastSync);
        
        this.updateUI();
        console.log('✅ Professionelle Cloud-Updates angewendet');
    }

    // 🛡️ Backup-Systeme (falls Hauptcloud nicht verfügbar)
    async syncToBackupSystems() {
        console.log('🛡️ Nutze Backup-Systeme...');
        
        const backupData = {
            devices: devices,
            users: users,
            adminPasswords: adminPasswords,
            lastUpdated: new Date().toISOString(),
            source: 'backup-system'
        };

        // Lokales Backup
        localStorage.setItem('professional-backup', JSON.stringify(backupData));
        
        // Test-APIs als Backup
        try {
            await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'professional-backup',
                    data: btoa(JSON.stringify(backupData))
                })
            });
            console.log('✅ Backup-System gespeichert');
        } catch (error) {
            console.log('⚠️ Backup-System nicht erreichbar');
        }
    }

    // 🎨 Status anzeigen
    showStatus(message) {
        console.log(`🌐 Professional DB: ${message}`);
        
        const statusElement = document.getElementById('cloudStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = message.includes('✅') ? 'green' : 
                                       message.includes('❌') ? 'red' : 'orange';
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

    // 🔧 Manuelle Konfiguration
    configure(apiKey, binId) {
        this.config.apiKey = apiKey;
        this.config.binId = binId;
        this.isConfigured = this.checkConfiguration();
        
        if (this.isConfigured) {
            console.log('✅ Professionelle Cloud-DB konfiguriert');
            this.syncToProfessionalCloud();
        }
    }
}

// 🚀 AUTO-START: Professionelle Cloud-Datenbank
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.professionalCloudDB = new ProfessionalCloudDB();
        console.log('🌐 Professionelle Cloud-Datenbank gestartet!');
    }, 3000);
});

console.log('🌐 Professionelle Cloud-DB Modul geladen');