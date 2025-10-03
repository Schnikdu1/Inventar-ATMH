// 🚀 GitHub als Datenbank - Super einfache Synchronisation
// Keine komplizierten Configs - nur GitHub Repository nötig!

class GitHubSync {
    constructor() {
        // DIESE WERTE MÜSSEN SIE ANPASSEN:
        this.githubUser = 'IHR_GITHUB_USERNAME';          // z.B. 'schnikdu'
        this.githubRepo = 'it-asset-data';                // Repository Name
        this.githubToken = 'IHR_GITHUB_TOKEN';            // Personal Access Token
        this.dataFile = 'assets-data.json';               // Datei für Daten
        
        this.isOnline = navigator.onLine;
        this.lastSync = null;
        this.syncTimer = null;
        this.autoSyncInterval = 30000; // 30 Sekunden
        
        console.log('📁 GitHub Sync System gestartet');
        this.initialize();
    }

    // System initialisieren
    async initialize() {
        console.log('🚀 GitHub Sync Initialisierung...');
        
        // Prüfe ob alle Einstellungen da sind
        if (this.githubUser === 'IHR_GITHUB_USERNAME' || 
            this.githubRepo === 'it-asset-data' || 
            this.githubToken === 'IHR_GITHUB_TOKEN') {
            console.log('⚠️ GitHub noch nicht konfiguriert - verwende lokalen Modus');
            this.initLocalMode();
            return;
        }
        
        // Lade lokale Daten zuerst
        this.loadFromLocalStorage();
        
        // Online-Überwachung
        this.setupOnlineMonitoring();
        
        // Versuche von GitHub zu laden
        if (this.isOnline) {
            await this.loadFromGitHub();
            this.startAutoSync();
        }
    }

    // Online/Offline Überwachung
    setupOnlineMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - GitHub Sync aktiviert');
            this.updateSyncStatus('🌐 Online - GitHub verbunden', 'success');
            this.loadFromGitHub();
            this.startAutoSync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline - Lokaler Modus');
            this.updateSyncStatus('📱 Offline - Lokaler Modus', 'warning');
            this.stopAutoSync();
        });
    }

    // Daten von GitHub laden
    async loadFromGitHub() {
        if (!this.isOnline) {
            this.loadFromLocalStorage();
            return false;
        }

        try {
            this.updateSyncStatus('⬇️ Lade von GitHub...', 'syncing');
            
            const url = `https://api.github.com/repos/${this.githubUser}/${this.githubRepo}/contents/${this.dataFile}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const fileData = await response.json();
                const content = atob(fileData.content); // Base64 dekodieren
                const githubData = JSON.parse(content);
                
                // Daten anwenden
                if (githubData.devices) Object.assign(devices, githubData.devices);
                if (githubData.users) Object.assign(users, githubData.users);
                if (githubData.adminPasswords) Object.assign(adminPasswords, githubData.adminPasswords);
                
                // UI aktualisieren
                this.refreshUI();
                this.saveToLocalStorage();
                
                this.lastSync = new Date();
                console.log('📥 Daten von GitHub geladen:', githubData.lastUpdated);
                this.updateSyncStatus('✅ Von GitHub geladen', 'success');
                
                return true;
            } else if (response.status === 404) {
                // Datei existiert noch nicht - erste Daten speichern
                console.log('📂 Noch keine GitHub-Daten - erstelle erste Datei');
                await this.saveToGitHub();
                return false;
            } else {
                throw new Error(`GitHub API Fehler: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ GitHub Laden fehlgeschlagen:', error);
            this.updateSyncStatus('❌ GitHub Laden fehlgeschlagen', 'error');
            this.loadFromLocalStorage();
            return false;
        }
    }

    // Daten zu GitHub speichern
    async saveToGitHub() {
        if (!this.isOnline) {
            this.saveToLocalStorage();
            return false;
        }

        try {
            this.updateSyncStatus('⬆️ Speichere zu GitHub...', 'syncing');
            
            const syncData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                lastUpdated: new Date().toISOString(),
                updatedBy: currentUser ? currentUser.fullName : 'System',
                version: Date.now()
            };

            // Aktuelle SHA holen (für Updates)
            const checkUrl = `https://api.github.com/repos/${this.githubUser}/${this.githubRepo}/contents/${this.dataFile}`;
            let sha = null;
            
            try {
                const checkResponse = await fetch(checkUrl, {
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (checkResponse.ok) {
                    const existingFile = await checkResponse.json();
                    sha = existingFile.sha;
                }
            } catch (e) {
                // Datei existiert noch nicht - SHA bleibt null
            }

            // Content Base64 enkodieren
            const content = btoa(JSON.stringify(syncData, null, 2));
            
            // Zu GitHub hochladen
            const uploadData = {
                message: `Update IT Assets - ${new Date().toLocaleString('de-DE')}`,
                content: content,
                branch: 'main'
            };
            
            if (sha) {
                uploadData.sha = sha; // Für Updates
            }

            const uploadUrl = `https://api.github.com/repos/${this.githubUser}/${this.githubRepo}/contents/${this.dataFile}`;
            
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            });

            if (response.ok) {
                this.lastSync = new Date();
                this.saveToLocalStorage();
                
                console.log('☁️ Daten zu GitHub gespeichert');
                this.updateSyncStatus('✅ Zu GitHub gespeichert', 'success');
                
                // Status nach 2 Sekunden zurücksetzen
                setTimeout(() => {
                    this.updateSyncStatus('🌐 Online - GitHub verbunden', 'success');
                }, 2000);
                
                return true;
            } else {
                const errorData = await response.json();
                throw new Error(`GitHub Upload Fehler: ${errorData.message}`);
            }
            
        } catch (error) {
            console.error('❌ GitHub Speichern fehlgeschlagen:', error);
            this.updateSyncStatus('❌ GitHub Speichern fehlgeschlagen', 'error');
            this.saveToLocalStorage();
            return false;
        }
    }

    // Lokaler Modus (Fallback)
    initLocalMode() {
        console.log('📱 Lokaler Modus aktiviert');
        this.loadFromLocalStorage();
        this.updateSyncStatus('📱 Lokaler Modus - GitHub nicht konfiguriert', 'warning');
        
        // Cross-Tab Synchronisation
        window.addEventListener('storage', (e) => {
            if (e.key === 'it-asset-github-data' && e.newValue) {
                console.log('🔄 Update von anderem Tab');
                this.loadFromLocalStorage();
                this.refreshUI();
            }
        });

        // Regelmäßiges lokales Speichern
        setInterval(() => {
            this.saveToLocalStorage();
        }, 10000);
    }

    // LocalStorage Funktionen
    saveToLocalStorage() {
        try {
            const syncData = {
                devices: devices,
                users: users,
                adminPasswords: adminPasswords,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('it-asset-github-data', JSON.stringify(syncData));
            
            // Cross-Tab Event
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'it-asset-github-data',
                newValue: JSON.stringify(syncData)
            }));
            
            console.log('💾 Lokal gespeichert');
            
        } catch (error) {
            console.error('❌ Lokales Speichern fehlgeschlagen:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('it-asset-github-data');
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
            console.error('❌ Lokales Laden fehlgeschlagen:', error);
        }
        return false;
    }

    // Auto-Sync Management
    startAutoSync() {
        if (this.syncTimer) clearInterval(this.syncTimer);

        this.syncTimer = setInterval(() => {
            if (this.isOnline) {
                this.loadFromGitHub(); // Prüfe auf Updates
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
        
        if (this.isOnline && this.githubToken !== 'IHR_GITHUB_TOKEN') {
            await this.saveToGitHub();
            await this.loadFromGitHub();
        } else {
            this.saveToLocalStorage();
        }
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
        if (lastSyncElement && this.lastSync) {
            lastSyncElement.textContent = `Letzte Sync: ${this.lastSync.toLocaleTimeString('de-DE')}`;
        }
    }
}

// Helper function
function getCurrentUser() {
    return window.currentUser || null;
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.githubSync = new GitHubSync();
    }, 1000);
});

// Vor Seitenverlassen speichern
window.addEventListener('beforeunload', () => {
    if (window.githubSync) {
        window.githubSync.saveToGitHub();
    }
});

console.log('🚀 GitHub Sync Module geladen');