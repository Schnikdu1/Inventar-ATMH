// 🔧 DATENBANK-KONFIGURATION
// Ersetzen Sie diese Werte mit Ihren JSONBin.io Daten

// 🚀 SETUP-ANLEITUNG:
// 1. Gehen Sie zu: https://jsonbin.io
// 2. Kostenloses Konto erstellen (100.000 Requests/Monat)
// 3. Dashboard → API Keys → Create Access Key
// 4. Dashboard → Create Bin → Name: "it-assets-global" → JSON
// 5. Werte unten einfügen:

const DATABASE_CONFIG = {
    // 🌐 Supabase Konfiguration (AKTIVIERT!)
    SUPABASE_URL: 'https://pdrbeubvcterqvoqaffz.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmJldWJ2Y3RlcnF2b3FhZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTY2MTAsImV4cCI6MjA3NDk3MjYxMH0.B6StQzRDFZRZ9rHiug824dgyKIbqIvJMBW7Cf1CCQmI',
    
    // 📊 Status
    SETUP_COMPLETE: true,    // ✅ Konfiguriert!
    CLOUD_PROVIDER: 'supabase',
    
    // ⚙️ Erweiterte Einstellungen
    SYNC_INTERVAL: 10000,    // 10 Sekunden (Supabase ist schnell)
    RETRY_ATTEMPTS: 3,
    BACKUP_ENABLED: true,
    
    // ⚙️ Erweiterte Einstellungen
    SYNC_INTERVAL: 15000,     // 15 Sekunden
    RETRY_ATTEMPTS: 3,        // 3 Versuche bei Fehlern
    BACKUP_ENABLED: true,     // Backup-Systeme aktiviert
    
    // 🌐 Alternative Services (optional)
    SUPABASE_URL: '',         // Optional: Supabase URL
    SUPABASE_ANON_KEY: '',    // Optional: Supabase Key
    
    // 🛡️ Backup-Services (automatisch aktiv)
    BACKUP_SERVICES: [
        'browser-localstorage',
        'httpbin-backup',
        'postman-echo-backup'
    ]
};

// 🔍 Automatische Validierung
function validateConfig() {
    const hasApiKey = DATABASE_CONFIG.JSONBIN_API_KEY && 
                     !DATABASE_CONFIG.JSONBIN_API_KEY.includes('HIER_IHR');
    const hasBinId = DATABASE_CONFIG.JSONBIN_BIN_ID && 
                    !DATABASE_CONFIG.JSONBIN_BIN_ID.includes('HIER_IHRE');
    
    DATABASE_CONFIG.SETUP_COMPLETE = hasApiKey && hasBinId;
    
    if (DATABASE_CONFIG.SETUP_COMPLETE) {
        console.log('✅ Professionelle Cloud-Datenbank konfiguriert');
        console.log('🌐 JSONBin.io verbunden');
    } else {
        console.log('⚠️ Cloud-Datenbank noch nicht konfiguriert');
        console.log('📋 Anleitung: Siehe Kommentare in database-config.js');
        console.log('🔄 Fallback-System aktiv (funktioniert trotzdem!)');
    }
    
    return DATABASE_CONFIG.SETUP_COMPLETE;
}

// 🚀 Sofortige Validierung
validateConfig();

// 📋 Setup-Hilfe anzeigen
if (!DATABASE_CONFIG.SETUP_COMPLETE) {
    console.log(`
🔧 SCHNELLES SETUP (5 Minuten):

1️⃣ Öffnen Sie: https://jsonbin.io
2️⃣ "Sign Up" → Kostenloses Konto
3️⃣ Dashboard → "API Keys" → "Create Access Key"
4️⃣ Dashboard → "Create Bin" → Name: "it-assets" → Type: JSON
5️⃣ Kopieren Sie API Key & Bin ID
6️⃣ In database-config.js einfügen (diese Datei)

📊 OHNE SETUP:
- App funktioniert trotzdem!
- Browser-basierte Datenbank
- Automatische Backups
- Cross-Device Sync (begrenzt)

🌐 MIT SETUP:
- Professionelle Cloud-Datenbank
- Weltweite Synchronisation
- 100.000 Requests/Monat kostenlos
- Ausfallsicher
    `);
}

// Export für andere Module
if (typeof module !== 'undefined') {
    module.exports = DATABASE_CONFIG;
} else {
    window.DATABASE_CONFIG = DATABASE_CONFIG;
}