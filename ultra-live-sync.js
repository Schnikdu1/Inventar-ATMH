// ⚡ ULTRA-LIVE REAL-TIME SYNCHRONISATION
// Jede Änderung wird SOFORT synchronisiert - kein Delay!

class UltraLiveSync {
    constructor() {
        this.isActive = false;
        this.syncQueue = [];
        this.isSyncing = false;
        this.lastDataHash = '';
        
        // Supabase Config von bestehender Konfiguration
        this.supabaseUrl = 'https://pdrbeubvcterqvoqaffz.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmJldWJ2Y3RlcnF2b3FhZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTY2MTAsImV4cCI6MjA3NDk3MjYxMH0.B6StQzRDFZRZ9rHiug824dgyKIbqIvJMBW7Cf1CCQmI';
        
        console.log('⚡ Ultra-Live Sync initialisiert');
        this.init();
    }

    // 🚀 System starten
    init() {
        this.setupInstantDataWatch();
        this.setupInstantSync();
        this.setupLivePolling();
        this.setupCrossTabLiveSync();
        
        this.isActive = true;
        console.log('⚡ Ultra-Live Synchronisation AKTIV');
    }

    // 👁️ SOFORTIGE Datenüberwachung - jede kleinste Änderung
    setupInstantDataWatch() {
        // Überwache ALLE globalen Variablen
        const watchTargets = ['devices', 'users', 'adminPasswords', 'currentUser', 'currentTab'];
        
        watchTargets.forEach(target => {
            if (window[target]) {
                this.makeReactive(target, window[target]);
            }
        });

        // Überwache HTML-Änderungen (für UI-Updates)
        this.setupDOMObserver();
        
        // Überwache localStorage-Änderungen
        this.setupStorageWatch();
        
        console.log('👁️ Instant Data Watch aktiv für:', watchTargets);
    }

    // 🔄 Mache Objekte reaktiv (jede Änderung triggert Sync)
    makeReactive(name, obj) {
        if (!obj || typeof obj !== 'object') return;

        const sync = this;
        
        // Für Arrays
        if (Array.isArray(obj)) {
            // Überwache Array-Methoden
            ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
                const original = obj[method];
                obj[method] = function(...args) {
                    const result = original.apply(this, args);
                    console.log(`⚡ LIVE: ${name}.${method}() ausgeführt`);
                    sync.instantSync(`${name}.${method}`);
                    return result;
                };
            });

            // Überwache Array-Index-Zuweisungen
            obj.forEach((item, index) => {
                if (typeof item === 'object') {
                    this.makeReactive(`${name}[${index}]`, item);
                }
            });
        }

        // Für Objekte - Proxy für alle Property-Änderungen
        const proxy = new Proxy(obj, {
            set(target, property, value, receiver) {
                const oldValue = target[property];
                target[property] = value;
                
                if (oldValue !== value) {
                    console.log(`⚡ LIVE: ${name}.${property} geändert von`, oldValue, 'zu', value);
                    sync.instantSync(`${name}.${property}`);
                }
                
                return true;
            },
            
            deleteProperty(target, property) {
                if (property in target) {
                    delete target[property];
                    console.log(`⚡ LIVE: ${name}.${property} gelöscht`);
                    sync.instantSync(`${name}.delete.${property}`);
                }
                return true;
            }
        });

        // Ersetze globale Variable mit Proxy
        window[name] = proxy;
    }

    // 👀 DOM-Änderungen überwachen
    setupDOMObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    console.log('⚡ LIVE: DOM geändert');
                    this.instantSync('DOM-Change');
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['value', 'checked', 'selected']
        });
    }

    // 💾 localStorage-Änderungen überwachen
    setupStorageWatch() {
        const originalSetItem = localStorage.setItem;
        const sync = this;
        
        localStorage.setItem = function(key, value) {
            originalSetItem.call(this, key, value);
            console.log(`⚡ LIVE: localStorage.${key} gesetzt`);
            sync.instantSync(`localStorage.${key}`);
        };

        // Storage-Events von anderen Tabs
        window.addEventListener('storage', (e) => {
            console.log(`⚡ LIVE: Storage-Event von anderem Tab:`, e.key);
            this.loadFromSupabaseInstant();
        });
    }

    // ⚡ SOFORTIGE Synchronisation (keine Verzögerung)
    instantSync(trigger) {
        if (this.isSyncing) {
            this.syncQueue.push(trigger);
            return;
        }

        console.log(`⚡ INSTANT SYNC: Ausgelöst durch ${trigger}`);
        this.performInstantSync();
    }

    // 🚀 Sofortige Sync-Ausführung
    async performInstantSync() {
        this.isSyncing = true;

        try {
            // Sammle ALLE Daten
            const allData = {
                devices: window.devices || {},
                users: window.users || {},
                adminPasswords: window.adminPasswords || {},
                currentUser: window.currentUser || null,
                currentTab: window.currentTab || 0,
                timestamp: Date.now(),
                lastUpdated: new Date().toISOString(),
                syncType: 'ultra-live'
            };

            // Hash berechnen um unnötige Syncs zu vermeiden
            const dataHash = this.calculateHash(JSON.stringify(allData));
            
            if (dataHash === this.lastDataHash) {
                console.log('⚡ Daten unverändert - Skip Sync');
                this.isSyncing = false;
                return;
            }

            this.lastDataHash = dataHash;

            // SOFORT zu Supabase
            const success = await this.uploadToSupabaseInstant(allData);
            
            if (success) {
                console.log('✅ INSTANT SYNC erfolgreich');
                
                // Lokale Backups
                localStorage.setItem('ultra-live-backup', JSON.stringify(allData));
                localStorage.setItem('ultra-live-time', allData.lastUpdated);
                
                // Andere Tabs benachrichtigen
                this.notifyOtherTabs(allData);
            }

        } catch (error) {
            console.error('❌ INSTANT SYNC Fehler:', error);
        }

        this.isSyncing = false;

        // Warteschlange abarbeiten
        if (this.syncQueue.length > 0) {
            const nextTrigger = this.syncQueue.shift();
            setTimeout(() => this.instantSync(nextTrigger), 100);
        }
    }

    // 📤 Ultra-schneller Supabase Upload
    async uploadToSupabaseInstant(data) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/it_assets?id=eq.1`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    data: data,
                    updated_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                return true;
            } else {
                // Fallback: INSERT falls UPDATE fehlschlägt
                return await this.insertToSupabaseInstant(data);
            }
        } catch (error) {
            console.error('❌ Instant Upload Fehler:', error);
            return false;
        }
    }

    // 📥 INSERT als Fallback
    async insertToSupabaseInstant(data) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/it_assets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                },
                body: JSON.stringify({
                    id: 1,
                    data: data,
                    updated_at: new Date().toISOString()
                })
            });

            return response.ok;
        } catch (error) {
            console.error('❌ Instant Insert Fehler:', error);
            return false;
        }
    }

    // 📡 ULTRA-SCHNELLES Polling (alle 2 Sekunden)
    setupLivePolling() {
        setInterval(() => {
            this.loadFromSupabaseInstant();
        }, 2000); // 2 Sekunden für Live-Feeling

        console.log('📡 Ultra-Live Polling aktiv (2s)');
    }

    // 📥 Sofortiges Laden von Supabase
    async loadFromSupabaseInstant() {
        if (this.isSyncing) return; // Nicht während Upload

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/it_assets?id=eq.1&select=data,updated_at`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result && result.length > 0) {
                    const cloudData = result[0].data;
                    const cloudTime = result[0].updated_at;
                    const localTime = localStorage.getItem('ultra-live-time') || '0';
                    
                    if (cloudTime > localTime) {
                        console.log('⚡ LIVE UPDATE von Cloud erkannt');
                        this.applyLiveData(cloudData);
                        localStorage.setItem('ultra-live-time', cloudTime);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Live Load Fehler:', error);
        }
    }

    // 🔄 Live-Daten anwenden (ohne UI-Flackern)
    applyLiveData(data) {
        if (!data) return;

        console.log('🔄 Wende Live-Updates an');

        // Temporär Sync deaktivieren um Loops zu vermeiden
        const wasActive = this.isActive;
        this.isActive = false;

        try {
            // Daten vorsichtig übernehmen
            if (data.devices) {
                Object.assign(window.devices || {}, data.devices);
            }
            if (data.users) {
                Object.assign(window.users || {}, data.users);
            }
            if (data.adminPasswords) {
                Object.assign(window.adminPasswords || {}, data.adminPasswords);
            }
            if (data.currentUser) {
                window.currentUser = data.currentUser;
            }

            // UI sofort aktualisieren
            this.updateUIInstant();
            
        } finally {
            this.isActive = wasActive;
        }

        console.log('✅ Live-Updates angewendet');
    }

    // 🖥️ UI sofort aktualisieren
    updateUIInstant() {
        // Alle bekannten UI-Update-Funktionen aufrufen
        const updateFunctions = [
            'renderCurrentTab',
            'renderDevices', 
            'renderLoans',
            'updateUserDisplay',
            'refreshTabs'
        ];

        updateFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                } catch (error) {
                    console.log(`⚠️ UI-Update ${funcName} fehlgeschlagen:`, error);
                }
            }
        });

        // Event für andere Module
        window.dispatchEvent(new CustomEvent('liveDataUpdate', {
            detail: { timestamp: Date.now() }
        }));
    }

    // 📨 Andere Browser-Tabs benachrichtigen
    notifyOtherTabs(data) {
        // BroadcastChannel für moderne Browser
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('ultra-live-sync');
            channel.postMessage({
                type: 'live-update',
                data: data,
                timestamp: Date.now()
            });
        }

        // Fallback: localStorage Event
        localStorage.setItem('ultra-live-notification', JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    }

    // 📻 Cross-Tab Live-Sync
    setupCrossTabLiveSync() {
        // BroadcastChannel
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('ultra-live-sync');
            channel.onmessage = (event) => {
                if (event.data.type === 'live-update') {
                    console.log('📻 Live-Update von anderem Tab');
                    this.applyLiveData(event.data.data);
                }
            };
        }

        // localStorage Events
        window.addEventListener('storage', (event) => {
            if (event.key === 'ultra-live-notification' && event.newValue) {
                const notification = JSON.parse(event.newValue);
                console.log('📡 Cross-Tab Live-Sync Event');
                this.applyLiveData(notification.data);
            }
        });
    }

    // 🔢 Einfacher Hash für Datenvergleich
    calculateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer
        }
        return hash;
    }
}

// 🚀 AUTO-START: Ultra-Live Sync
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.ultraLiveSync = new UltraLiveSync();
        console.log('⚡ ULTRA-LIVE REAL-TIME SYNC AKTIV!');
        console.log('🔥 Jede Änderung wird SOFORT synchronisiert!');
    }, 1000);
});

console.log('⚡ Ultra-Live Sync Modul geladen');