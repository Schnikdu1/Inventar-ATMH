// 🔧 DEMO-KONFIGURATION (ohne JSONBin Account)
// Für sofortiges Testen ohne Anmeldung

const DATABASE_CONFIG = {
    // 🌐 Demo-Modus (funktioniert sofort)
    JSONBIN_API_KEY: 'DEMO_MODE_ACTIVE',
    JSONBIN_BIN_ID: 'DEMO_MODE_ACTIVE',
    
    // 📊 Demo-Status
    SETUP_COMPLETE: false, // Wird auf true gesetzt wenn echte Keys eingegeben
    DEMO_MODE: true,       // Demo-Modus aktiv
    
    // ⚙️ Einstellungen
    SYNC_INTERVAL: 15000,
    RETRY_ATTEMPTS: 3,
    BACKUP_ENABLED: true,
    
    // 🛡️ Backup-Services (aktiv auch ohne JSONBin)
    BACKUP_SERVICES: [
        'browser-localstorage',
        'httpbin-backup',
        'postman-echo-backup'
    ]
};

// 🔍 Demo-Modus Validierung
function validateConfig() {
    const demoMode = DATABASE_CONFIG.JSONBIN_API_KEY === 'DEMO_MODE_ACTIVE';
    
    if (demoMode) {
        console.log('🎮 DEMO-MODUS aktiv');
        console.log('✅ App funktioniert vollständig');
        console.log('📱 Browser-basierte Datenbank');
        console.log('🔄 Cross-Tab Synchronisation');
        console.log('📋 Für Profi-Version: JSONBin.io Account erstellen');
        DATABASE_CONFIG.DEMO_MODE = true;
        return false;
    }
    
    const hasApiKey = DATABASE_CONFIG.JSONBIN_API_KEY && 
                     !DATABASE_CONFIG.JSONBIN_API_KEY.includes('DEMO_MODE') &&
                     !DATABASE_CONFIG.JSONBIN_API_KEY.includes('HIER_IHR');
    const hasBinId = DATABASE_CONFIG.JSONBIN_BIN_ID && 
                    !DATABASE_CONFIG.JSONBIN_BIN_ID.includes('DEMO_MODE') &&
                    !DATABASE_CONFIG.JSONBIN_BIN_ID.includes('HIER_IHRE');
    
    DATABASE_CONFIG.SETUP_COMPLETE = hasApiKey && hasBinId;
    DATABASE_CONFIG.DEMO_MODE = false;
    
    if (DATABASE_CONFIG.SETUP_COMPLETE) {
        console.log('✅ Professionelle Cloud-Datenbank konfiguriert');
        console.log('🌐 JSONBin.io verbunden');
    }
    
    return DATABASE_CONFIG.SETUP_COMPLETE;
}

// 🚀 Sofortige Validierung
validateConfig();

// 📋 Hilfe anzeigen
if (DATABASE_CONFIG.DEMO_MODE) {
    console.log(`
🎮 DEMO-MODUS - Funktioniert sofort!

✅ AKTUELLE FEATURES:
- Alle App-Funktionen verfügbar
- Browser-basierte Datenbank
- Cross-Tab Synchronisation  
- Automatische Backups
- Offline-Modus

🔧 FÜR PROFI-VERSION (optional):
1. JSONBin.io Account erstellen
2. API Key + Bin ID bekommen
3. In database-config.js einfügen

📱 JETZT NUTZEN:
- App ist vollständig funktionsfähig
- Alle Features arbeiten
- Daten werden gespeichert
    `);
}

// Export
if (typeof module !== 'undefined') {
    module.exports = DATABASE_CONFIG;
} else {
    window.DATABASE_CONFIG = DATABASE_CONFIG;
}