// 🌐 SUPABASE CLOUD-DATENBANK KONFIGURATION
// Professionelle PostgreSQL-Datenbank mit Real-time Updates

class SupabaseCloudDB {
    constructor() {
        // 🔧 Supabase Konfiguration
        this.config = {
            // 📝 SUPABASE KONFIGURATION (AKTIVIERT!)
            supabaseUrl: DATABASE_CONFIG?.SUPABASE_URL || 'https://pdrbeubvcterqvoqaffz.supabase.co',
            supabaseAnonKey: DATABASE_CONFIG?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmJldWJ2Y3RlcnF2b3FhZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTY2MTAsImV4cCI6MjA3NDk3MjYxMH0.B6StQzRDFZRZ9rHiug824dgyKIbqIvJMBW7Cf1CCQmI',
            
            // 📊 Tabellen-Namen
            tableName: 'it_assets',
            
            // ⚙️ Einstellungen
            autoRetry: true,
            maxRetries: 3,
            retryDelay: 2000,
            syncInterval: 10000 // 10 Sekunden (schneller als JSONBin)
        };

        this.isConfigured = this.checkConfiguration();
        this.isOnline = navigator.onLine;
        this.lastSync = localStorage.getItem('supabase-last-sync') || '0';
        
        console.log('🌐 Supabase Cloud-DB initialisiert');
        this.init();
    }

    // ✅ Prüfe ob Supabase konfiguriert ist
    checkConfiguration() {
        const hasValidUrl = this.config.supabaseUrl && !this.config.supabaseUrl.includes('IHRE_');
        const hasValidKey = this.config.supabaseAnonKey && !this.config.supabaseAnonKey.includes('IHRE_');
        
        if (!hasValidUrl || !hasValidKey) {
            console.log('⚠️ Supabase noch nicht konfiguriert - nutze Fallback-System');
            this.showSupabaseInstructions();
            return false;
        }
        
        console.log('✅ Supabase konfiguriert');
        return true;
    }

    // 📋 Supabase Konfigurationsanweisungen
    showSupabaseInstructions() {
        console.log(`
🔧 SUPABASE SETUP:

1️⃣ Supabase Projekt-URL: Projekt Dashboard → Settings → API
2️⃣ Anon Key: Projekt Dashboard → Settings → API → anon/public key
3️⃣ In database-config.js einfügen

📊 Aktuelle Status: Fallback-System aktiv (funktioniert trotzdem!)
        `);
    }

    // 🚀 System starten
    init() {
        this.setupNetworkMonitoring();
        this.setupAutoSync();
        this.startPeriodicSync();
        
        // Tabelle erstellen (falls noch nicht vorhanden)
        if (this.isConfigured && this.isOnline) {
            this.ensureTableExists();
            this.loadFromSupabase();
        }
        
        console.log('✅ Supabase Cloud-DB aktiv');
    }

    // 📡 Netzwerk überwachen
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - Supabase aktiv');
            if (this.isConfigured) {
                this.syncToSupabase();
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
                    console.log(`🌐 Supabase Sync: ${type}[${prop}]`);
                    db.scheduleSync();
                    return true;
                }
            });
        });

        // Bei wichtigen Events
        window.addEventListener('beforeunload', () => this.syncToSupabase());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isConfigured) {
                this.loadFromSupabase();
            }
        });
    }

    // ⏰ Geplante Synchronisation
    scheduleSync() {
        if (this.syncTimer) clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => {
            if (this.isConfigured) {
                this.syncToSupabase();
            }
        }, 2000); // 2 Sekunden (schneller für Supabase)
    }

    // 🕐 Regelmäßige Synchronisation
    startPeriodicSync() {
        setInterval(() => {
            if (this.isOnline && this.isConfigured) {
                this.loadFromSupabase();
            }
        }, this.config.syncInterval);
        
        console.log(`⏰ Supabase Sync aktiv (${this.config.syncInterval/1000}s)`);
    }

    // 📊 Tabelle erstellen (automatisch)
    async ensureTableExists() {
        try {
            // Prüfe ob Tabelle existiert durch einen einfachen Query
            const response = await fetch(`${this.config.supabaseUrl}/rest/v1/${this.config.tableName}?select=id&limit=1`, {
                headers: {
                    'apikey': this.config.supabaseAnonKey,
                    'Authorization': `Bearer ${this.config.supabaseAnonKey}`
                }
            });

            if (response.ok) {
                console.log('✅ Supabase Tabelle existiert');
            } else if (response.status === 404) {
                console.log('📋 Erstelle Supabase Tabelle...');
                await this.createTable();
            }
        } catch (error) {
            console.log('⚠️ Tabellen-Prüfung fehlgeschlagen:', error);
        }
    }

    // 🏗️ Tabelle erstellen
    async createTable() {
        console.log(`
📋 SUPABASE TABELLE ERSTELLEN:

1. Öffnen Sie Ihr Supabase Dashboard
2. Gehen Sie zu "SQL Editor"
3. Führen Sie diesen SQL-Befehl aus:

CREATE TABLE it_assets (
    id SERIAL PRIMARY KEY,
    data JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security) aktivieren
ALTER TABLE it_assets ENABLE ROW LEVEL SECURITY;

-- Policy für öffentlichen Zugriff (für Demo)
CREATE POLICY "Allow all operations" ON it_assets FOR ALL USING (true);

4. Tabelle ist erstellt! ✅
        `);
    }

    // ☁️ ZU SUPABASE SPEICHERN
    async syncToSupabase() {
        if (!this.isOnline || !this.isConfigured) return;

        try {
            const cloudData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                timestamp: Date.now(),
                version: '2.0-supabase',
                source: 'IT-Asset-Management'
            };

            console.log('☁️ Synchronisiere zu Supabase...');
            
            const success = await this.uploadToSupabase(cloudData);
            
            if (success) {
                this.lastSync = cloudData.lastUpdated;
                localStorage.setItem('supabase-last-sync', this.lastSync);
                console.log('✅ Supabase Sync erfolgreich');
                this.showStatus('✅ Supabase synchronisiert');
            } else {
                throw new Error('Supabase nicht erreichbar');
            }

        } catch (error) {
            console.error('❌ Supabase Sync fehlgeschlagen:', error);
            this.showStatus('❌ Supabase-Fehler');
            
            // Fallback zu Backup-Systemen
            this.syncToBackupSystems();
        }
    }

    // 📤 Upload zu Supabase
    async uploadToSupabase(data) {
        try {
            // Upsert (Update oder Insert) Operation
            const response = await fetch(`${this.config.supabaseUrl}/rest/v1/${this.config.tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.supabaseAnonKey,
                    'Authorization': `Bearer ${this.config.supabaseAnonKey}`,
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    id: 1, // Feste ID für unsere Daten
                    data: data
                })
            });

            if (response.ok) {
                console.log('✅ Supabase Upload erfolgreich');
                return true;
            } else {
                const error = await response.text();
                console.error('❌ Supabase Upload-Fehler:', error);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Supabase Upload fehlgeschlagen:', error);
            return false;
        }
    }

    // 📥 Von Supabase laden
    async loadFromSupabase() {
        if (!this.isOnline || !this.isConfigured) return;

        try {
            console.log('📥 Lade von Supabase...');
            
            const response = await fetch(`${this.config.supabaseUrl}/rest/v1/${this.config.tableName}?id=eq.1&select=data`, {
                headers: {
                    'apikey': this.config.supabaseAnonKey,
                    'Authorization': `Bearer ${this.config.supabaseAnonKey}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result && result.length > 0) {
                    const cloudData = result[0].data;
                    
                    if (cloudData && cloudData.lastUpdated) {
                        // Prüfen ob Cloud-Daten neuer sind
                        if (cloudData.lastUpdated > this.lastSync) {
                            console.log('🔄 Supabase Updates gefunden');
                            this.applyCloudData(cloudData);
                            this.showStatus('🔄 Supabase Update');
                        } else {
                            console.log('📊 Lokale Daten sind aktuell');
                            this.showStatus('✅ Supabase Synchron');
                        }
                    }
                }
            } else {
                console.log('⚠️ Supabase Load-Fehler:', response.status);
            }

        } catch (error) {
            console.error('❌ Supabase Load fehlgeschlagen:', error);
            this.showStatus('❌ Supabase-Fehler');
        }
    }

    // 📊 Cloud-Daten anwenden
    applyCloudData(data) {
        if (!data || !data.lastUpdated) return;

        console.log('🔄 Wende Supabase Updates an');
        
        if (data.devices) Object.assign(devices, data.devices);
        if (data.users) Object.assign(users, data.users);
        if (data.adminPasswords) Object.assign(adminPasswords, data.adminPasswords);

        this.lastSync = data.lastUpdated;
        localStorage.setItem('supabase-last-sync', this.lastSync);
        
        this.updateUI();
        console.log('✅ Supabase Updates angewendet');
    }

    // 🛡️ Backup-Systeme
    async syncToBackupSystems() {
        console.log('🛡️ Nutze Backup-Systeme...');
        
        const backupData = {
            devices: devices,
            users: users,
            adminPasswords: adminPasswords,
            lastUpdated: new Date().toISOString(),
            source: 'supabase-backup'
        };

        localStorage.setItem('supabase-backup', JSON.stringify(backupData));
    }

    // 🎨 Status anzeigen
    showStatus(message) {
        console.log(`🌐 Supabase: ${message}`);
        
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
    configure(supabaseUrl, supabaseAnonKey) {
        this.config.supabaseUrl = supabaseUrl;
        this.config.supabaseAnonKey = supabaseAnonKey;
        this.isConfigured = this.checkConfiguration();
        
        if (this.isConfigured) {
            console.log('✅ Supabase konfiguriert');
            this.ensureTableExists();
            this.syncToSupabase();
        }
    }
}

// 🚀 AUTO-START: Supabase Cloud-Datenbank
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.supabaseCloudDB = new SupabaseCloudDB();
        console.log('🌐 Supabase Cloud-Datenbank gestartet!');
    }, 3000);
});

console.log('🌐 Supabase Cloud-DB Modul geladen');