// 🔥 Firebase Echtzeit-Synchronisation für IT Asset Management
// Universelle Daten-Synchronisation zwischen allen Geräten und Benutzern

class UniversalSync {
    constructor() {
        this.db = null;
        this.isConnected = false;
        this.syncEnabled = false;
        this.lastSyncTime = null;
        this.autoSyncInterval = 15000; // 15 Sekunden
        this.syncTimer = null;
        
        console.log('🌐 Universal Sync System gestartet');
        this.initializeSync();
    }

    // Firebase initialisieren
    async initializeSync() {
        try {
            // Prüfe ob Firebase verfügbar ist
            if (typeof firebase === 'undefined') {
                console.log('⚠️ Firebase nicht verfügbar - lade Fallback');
                this.initFallbackSync();
                return;
            }

            // Firebase Konfiguration - DIESE WERTE MÜSSEN SIE ERSETZEN!
            const firebaseConfig = {
                apiKey: "IHRE_FIREBASE_API_KEY_HIER",
                authDomain: "ihr-projekt-name.firebaseapp.com", 
                databaseURL: "https://ihr-projekt-name-default-rtdb.europe-west1.firebasedatabase.app/",
                projectId: "ihr-projekt-name",
                storageBucket: "ihr-projekt-name.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef123456"
            };

            // Firebase initialisieren
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.database();
            console.log('✅ Firebase erfolgreich initialisiert');
            
            // Verbindung überwachen
            this.setupConnectionMonitoring();
            
            // Erste Synchronisation
            await this.loadFromCloud();
            
            // Echtzeit-Listener aktivieren
            this.setupRealtimeListener();
            
            // Auto-Sync starten
            this.startAutoSync();
            
        } catch (error) {
            console.error('❌ Firebase Fehler:', error);
            this.initFallbackSync();
        }
    }

    // Verbindungsüberwachung
    setupConnectionMonitoring() {
        if (!this.db) return;

        // Firebase Connection Status
        this.db.ref('.info/connected').on('value', (snapshot) => {
            this.isConnected = snapshot.val() === true;
            
            if (this.isConnected) {
                console.log('🌐 Firebase Online - Echtzeit-Sync aktiv');
                this.updateSyncStatus('🟢 Online - Echtzeit-Sync', 'success');
                this.syncEnabled = true;
                this.saveToCloud(); // Sofort hochladen
            } else {
                console.log('📱 Firebase Offline - Lokaler Modus');
                this.updateSyncStatus('📱 Offline - Lokaler Modus', 'warning');
                this.syncEnabled = false;
            }
        });

        // Browser Online/Offline
        window.addEventListener('online', () => {
            console.log('🌐 Internet verbunden');
            if (this.db) {
                setTimeout(() => this.saveToCloud(), 1000);
            }
        });

        window.addEventListener('offline', () => {
            console.log('📴 Internet getrennt');
            this.updateSyncStatus('📴 Offline', 'warning');
        });
    }

    // Echtzeit-Listener für automatische Updates
    setupRealtimeListener() {
        if (!this.db) return;

        // Lausche auf Änderungen in der Cloud
        this.db.ref('itAssetData').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            
            if (cloudData && cloudData.lastUpdated) {
                const cloudTime = new Date(cloudData.lastUpdated);
                const localTime = this.lastSyncTime || new Date(0);
                
                // Nur updaten wenn Cloud-Daten neuer sind
                if (cloudTime > localTime) {
                    console.log('🔄 Neues Update erhalten von anderem Gerät');
                    this.applyCloudData(cloudData);
                    this.updateSyncStatus('🔄 Update erhalten', 'success');
                    
                    // Kurz anzeigen, dann zurück zu normal
                    setTimeout(() => {
                        this.updateSyncStatus('🟢 Online - Echtzeit-Sync', 'success');
                    }, 2000);
                }
            }
        });

        console.log('👂 Echtzeit-Listener aktiviert');
    }

    // Cloud-Daten anwenden
    applyCloudData(cloudData) {
        try {
            // Backup der aktuellen Daten
            const currentDevices = JSON.parse(JSON.stringify(devices));
            const currentUsers = JSON.parse(JSON.stringify(users));
            const currentAdminPasswords = JSON.parse(JSON.stringify(adminPasswords));

            // Cloud-Daten übernehmen
            if (cloudData.devices) {
                Object.assign(devices, cloudData.devices);
            }
            if (cloudData.users) {
                Object.assign(users, cloudData.users);
            }
            if (cloudData.adminPasswords) {
                Object.assign(adminPasswords, cloudData.adminPasswords);
            }

            // Lokale Speicherung aktualisieren
            this.saveToLocalStorage();
            
            // UI aktualisieren
            this.refreshUI();
            
            this.lastSyncTime = new Date(cloudData.lastUpdated);
            
            console.log('✅ Cloud-Daten erfolgreich angewendet');
            
        } catch (error) {
            console.error('❌ Fehler beim Anwenden der Cloud-Daten:', error);
        }
    }

    // Daten in die Cloud speichern
    async saveToCloud() {
        if (!this.db || !this.isConnected || !this.syncEnabled) {
            this.saveToLocalStorage();
            return false;
        }

        try {
            this.updateSyncStatus('⬆️ Speichere...', 'syncing');
            
            const syncData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                updatedBy: currentUser ? currentUser.fullName : 'System',
                version: Date.now() // Versionierung für Konflikte
            };

            await this.db.ref('itAssetData').set(syncData);
            
            this.lastSyncTime = new Date();
            this.saveToLocalStorage(); // Lokales Backup
            
            console.log('☁️ Daten erfolgreich in Cloud gespeichert');
            this.updateSyncStatus('✅ Gespeichert', 'success');
            
            // Status nach 2 Sekunden zurücksetzen
            setTimeout(() => {
                this.updateSyncStatus('🟢 Online - Echtzeit-Sync', 'success');
            }, 2000);
            
            return true;
            
        } catch (error) {
            console.error('❌ Cloud-Speicherung fehlgeschlagen:', error);
            this.updateSyncStatus('❌ Speichern fehlgeschlagen', 'error');
            this.saveToLocalStorage(); // Fallback
            return false;
        }
    }

    // Daten aus der Cloud laden
    async loadFromCloud() {
        if (!this.db || !this.isConnected) {
            this.loadFromLocalStorage();
            return false;
        }

        try {
            this.updateSyncStatus('⬇️ Lade Daten...', 'syncing');
            
            const snapshot = await this.db.ref('itAssetData').once('value');
            const cloudData = snapshot.val();
            
            if (cloudData) {
                this.applyCloudData(cloudData);
                console.log('📥 Daten aus Cloud geladen');
                return true;
            } else {
                console.log('📂 Keine Cloud-Daten gefunden - verwende lokale Daten');
                this.loadFromLocalStorage();
                // Erste Daten in Cloud speichern
                setTimeout(() => this.saveToCloud(), 1000);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Cloud-Laden fehlgeschlagen:', error);
            this.updateSyncStatus('❌ Laden fehlgeschlagen', 'error');
            this.loadFromLocalStorage();
            return false;
        }
    }

    // Auto-Sync Management
    startAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(() => {
            if (this.isConnected && this.syncEnabled) {
                this.saveToCloud();
            } else {
                this.saveToLocalStorage();
            }
        }, this.autoSyncInterval);

        console.log(`🔄 Auto-Sync aktiviert (alle ${this.autoSyncInterval/1000}s)`);
    }

    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        console.log('⏸️ Auto-Sync gestoppt');
    }

    // Manueller Sync
    async manualSync() {
        console.log('🔄 Manueller Sync gestartet');
        
        if (this.isConnected && this.syncEnabled) {
            await this.saveToCloud();
            await this.loadFromCloud();
        } else {
            this.saveToLocalStorage();
        }
    }

    // LocalStorage Funktionen (Fallback)
    saveToLocalStorage() {
        try {
            const syncData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                timestamp: new Date().toISOString(),
                offline: true
            };
            
            localStorage.setItem('it-asset-sync-data', JSON.stringify(syncData));
            
            // Für Cross-Tab Synchronisation
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'it-asset-sync-data',
                newValue: JSON.stringify(syncData)
            }));
            
            console.log('💾 Lokale Speicherung erfolgreich');
            
        } catch (error) {
            console.error('❌ Lokale Speicherung fehlgeschlagen:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('it-asset-sync-data');
            if (savedData) {
                const syncData = JSON.parse(savedData);
                
                if (syncData.devices) Object.assign(devices, syncData.devices);
                if (syncData.users) Object.assign(users, syncData.users);
                if (syncData.adminPasswords) Object.assign(adminPasswords, syncData.adminPasswords);
                
                this.refreshUI();
                console.log('📁 Lokale Daten geladen');
                return true;
            }
        } catch (error) {
            console.error('❌ Lokale Daten laden fehlgeschlagen:', error);
        }
        return false;
    }

    // Fallback-Sync ohne Firebase
    initFallbackSync() {
        console.log('📱 Initialisiere Fallback-Sync (localStorage + Cross-Tab)');
        
        this.loadFromLocalStorage();
        this.updateSyncStatus('📱 Lokaler Modus', 'warning');
        
        // Cross-Tab Synchronisation
        window.addEventListener('storage', (e) => {
            if (e.key === 'it-asset-sync-data' && e.newValue) {
                console.log('🔄 Update von anderem Tab erhalten');
                const syncData = JSON.parse(e.newValue);
                
                if (syncData.devices) Object.assign(devices, syncData.devices);
                if (syncData.users) Object.assign(users, syncData.users);
                if (syncData.adminPasswords) Object.assign(adminPasswords, syncData.adminPasswords);
                
                this.refreshUI();
            }
        });

        // Regelmäßiges Speichern
        setInterval(() => {
            this.saveToLocalStorage();
        }, 10000);
    }

    // UI Funktionen
    refreshUI() {
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

    updateSyncStatus(message, type = 'info') {
        const statusElement = document.getElementById('syncStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `sync-status ${type}`;
        }

        const lastSyncElement = document.getElementById('lastSyncTime');
        if (lastSyncElement && this.lastSyncTime) {
            lastSyncElement.textContent = `Letzte Sync: ${this.lastSyncTime.toLocaleTimeString('de-DE')}`;
        }
    }
}

// Event Listeners für automatische Synchronisation
document.addEventListener('DOMContentLoaded', () => {
    // Warte bis alle anderen Scripts geladen sind
    setTimeout(() => {
        window.universalSync = new UniversalSync();
    }, 1000);
});

// Vor dem Verlassen der Seite speichern
window.addEventListener('beforeunload', () => {
    if (window.universalSync) {
        window.universalSync.saveToCloud();
    }
});

// Bei Sichtbarkeitsänderung (Tab-Wechsel) synchronisieren
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.universalSync) {
        window.universalSync.loadFromCloud();
    }
});

console.log('🚀 Universal Sync Module geladen');