// Enhanced Functions for IT Asset Management System

// Admin Panel Management
function openAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) {
        alert('Zugriff verweigert! Sie benötigen Administrator-Rechte.');
        return;
    }
    
    // Check if admin password is set for this user
    if (!adminPasswords[currentUser.username]) {
        showAdminPasswordSetup();
        return;
    }
    
    renderUsersList();
    document.getElementById('adminModal').style.display = 'flex';
    console.log('⚙️ Admin-Panel geöffnet');
}

function showAdminPasswordSetup() {
    document.getElementById('adminPasswordModal').style.display = 'flex';
}

function setupAdminPassword(e) {
    e.preventDefault();
    
    const password = document.getElementById('setupAdminPassword').value;
    const confirmPassword = document.getElementById('confirmAdminPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwörter stimmen nicht überein!');
        return;
    }
    
    if (password.length < 6) {
        alert('Passwort muss mindestens 6 Zeichen lang sein!');
        return;
    }
    
    adminPasswords[currentUser.username] = password;
    saveAdminPasswords();
    
    document.getElementById('adminPasswordModal').style.display = 'none';
    document.getElementById('setupAdminPasswordForm').reset();
    
    // Now open admin panel
    renderUsersList();
    document.getElementById('adminModal').style.display = 'flex';
    
    console.log('🔐 Admin-Passwort eingerichtet');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function renderUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    Object.entries(users).forEach(([username, userData]) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        userItem.innerHTML = `
            <div class="user-info-text">
                <div class="user-name">${userData.fullName}</div>
                <div class="user-role">@${username}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="role-badge role-${userData.isAdmin ? 'admin' : 'user'}">
                    ${userData.isAdmin ? 'Admin' : 'Benutzer'}
                </span>
                <button class="btn btn-danger" onclick="deleteUser('${username}')" 
                        ${username === currentUser.username ? 'disabled title="Sie können sich nicht selbst löschen"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        usersList.appendChild(userItem);
    });
}

// User Management
function openAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

function addNewUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value.trim();
    const fullName = document.getElementById('newUserFullName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;
    
    if (users[username]) {
        alert('Benutzername bereits vergeben!');
        return;
    }
    
    users[username] = {
        password: password,
        fullName: fullName,
        isAdmin: role === 'admin',
        firstLogin: true
    };
    
    saveUsers();
    renderUsersList();
    closeAddUserModal();
    
    alert(`Benutzer "${fullName}" erfolgreich erstellt!`);
    console.log('👤 Neuer Benutzer erstellt:', fullName);
}

function deleteUser(username) {
    if (username === currentUser.username) {
        alert('Sie können sich nicht selbst löschen!');
        return;
    }
    
    if (confirm(`Benutzer "${users[username].fullName}" wirklich löschen?`)) {
        delete users[username];
        saveUsers();
        renderUsersList();
        console.log('🗑️ Benutzer gelöscht:', username);
    }
}

function changeAdminPassword() {
    const newPassword = document.getElementById('newAdminPassword').value;
    
    if (!newPassword || newPassword.length < 6) {
        alert('Passwort muss mindestens 6 Zeichen lang sein!');
        return;
    }
    
    adminPasswords[currentUser.username] = newPassword;
    saveAdminPasswords();
    
    document.getElementById('newAdminPassword').value = '';
    alert('Admin-Passwort erfolgreich geändert!');
    console.log('🔐 Admin-Passwort geändert');
}

// Enhanced Authentication
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    console.log('🔐 Login-Versuch für:', username);
    
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        currentUser.username = username;
        
        // Check if first login
        if (currentUser.firstLogin) {
            isFirstLogin = true;
            showChangePasswordModal();
            return;
        }
        
        showApp();
        hideError();
        console.log('✅ Login erfolgreich für:', currentUser.fullName);
    } else {
        showError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
        console.log('❌ Login fehlgeschlagen');
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    document.getElementById('currentUser').textContent = currentUser.fullName;
    
    // Show admin button if user is admin
    if (currentUser.isAdmin) {
        document.getElementById('adminButton').style.display = 'inline-flex';
    }
    
    updateLocationOptions();
    renderDevices();
}

function showChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'flex';
}

function changeUserPassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newUserPasswordChange').value;
    const confirmPassword = document.getElementById('confirmUserPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwörter stimmen nicht überein!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Passwort muss mindestens 6 Zeichen lang sein!');
        return;
    }
    
    // Update password
    users[currentUser.username].password = newPassword;
    users[currentUser.username].firstLogin = false;
    saveUsers();
    
    document.getElementById('changePasswordModal').style.display = 'none';
    showApp();
    console.log('✅ Passwort erfolgreich geändert');
}

// Location Options Management
function updateLocationOptions() {
    const locationSelect = document.getElementById('deviceLocation');
    const currentDeviceType = deviceTypes[currentTab];
    const options = locationOptions[currentDeviceType];
    
    locationSelect.innerHTML = '<option value="">Bitte wählen...</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        locationSelect.appendChild(optionElement);
    });
}

// Defect Reporting System
function reportDefect(index) {
    reportingDefectIndex = index;
    const deviceType = deviceTypes[currentTab];
    const device = devices[deviceType][index];
    
    document.getElementById('defectDeviceName').value = `${device.name || 'Unbenannt'} (${device.inventoryNumber || 'N/A'})`;
    document.getElementById('defectReporter').value = currentUser.fullName;
    document.getElementById('defectDescription').value = '';
    
    // Reset urgency selection
    document.querySelectorAll('.urgency-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.urgency-medium').classList.add('selected');
    selectedUrgency = 'medium';
    
    document.getElementById('defectModal').style.display = 'flex';
}

function selectUrgency(urgency) {
    selectedUrgency = urgency;
    document.querySelectorAll('.urgency-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`.urgency-${urgency}`).classList.add('selected');
}

function saveDefectReport(e) {
    e.preventDefault();
    
    const description = document.getElementById('defectDescription').value.trim();
    if (!description) {
        alert('Bitte geben Sie eine Problembeschreibung ein!');
        return;
    }
    
    const deviceType = deviceTypes[currentTab];
    const device = devices[deviceType][reportingDefectIndex];
    
    // Add defect report to device
    device.defectReport = {
        description: description,
        reportedBy: currentUser.fullName,
        reportDate: new Date().toLocaleDateString('de-DE'),
        urgency: selectedUrgency,
        status: 'Offen'
    };
    
    // Change device status to defective
    device.status = 'Defekt';
    
    renderDevices();
    closeDefectModal();
    saveData();
    
    alert('Defekt erfolgreich gemeldet!');
    console.log('🔧 Defekt gemeldet für Gerät:', device.name);
}

function closeDefectModal() {
    document.getElementById('defectModal').style.display = 'none';
    reportingDefectIndex = -1;
}

// Admin Panel System
function openAdminPanel() {
    const username = currentUser.username;
    
    // Check if admin password is set
    if (!adminPasswords[username]) {
        showAdminPasswordSetup();
        return;
    }
    
    // Prompt for admin password
    const enteredPassword = prompt('Bitte geben Sie Ihr Admin-Passwort ein:');
    if (enteredPassword !== adminPasswords[username]) {
        alert('Falsches Admin-Passwort!');
        return;
    }
    
    renderUsersList();
    document.getElementById('adminModal').style.display = 'flex';
}

function showAdminPasswordSetup() {
    document.getElementById('adminPasswordModal').style.display = 'flex';
}

function setupAdminPassword(e) {
    e.preventDefault();
    
    const password = document.getElementById('setupAdminPassword').value;
    const confirm = document.getElementById('confirmAdminPassword').value;
    
    if (password !== confirm) {
        alert('Passwörter stimmen nicht überein!');
        return;
    }
    
    if (password.length < 6) {
        alert('Admin-Passwort muss mindestens 6 Zeichen lang sein!');
        return;
    }
    
    adminPasswords[currentUser.username] = password;
    saveAdminPasswords();
    
    document.getElementById('adminPasswordModal').style.display = 'none';
    renderUsersList();
    document.getElementById('adminModal').style.display = 'flex';
    
    console.log('✅ Admin-Passwort erfolgreich eingerichtet');
}

function switchAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchAdminTab('${tab}')"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).classList.add('active');
}

function renderUsersList() {
    const container = document.getElementById('usersList');
    
    container.innerHTML = Object.entries(users).map(([username, user]) => `
        <div class="user-item">
            <div class="user-info-text">
                <div class="user-name">${user.fullName}</div>
                <div class="user-role">@${username}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="role-badge role-${user.isAdmin ? 'admin' : 'user'}">${user.isAdmin ? 'Admin' : 'Benutzer'}</span>
                <button class="btn btn-danger" onclick="deleteUser('${username}')" ${username === currentUser.username ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserModal').style.display = 'flex';
}

function addNewUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value.trim();
    const fullName = document.getElementById('newUserFullName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;
    
    if (users[username]) {
        alert('Benutzername bereits vergeben!');
        return;
    }
    
    users[username] = {
        fullName: fullName,
        password: password,
        isAdmin: role === 'admin',
        firstLogin: true
    };
    
    saveUsers();
    renderUsersList();
    closeAddUserModal();
    
    alert(`Benutzer ${fullName} erfolgreich erstellt!`);
    console.log('👤 Neuer Benutzer erstellt:', fullName);
}

function deleteUser(username) {
    if (username === currentUser.username) {
        alert('Sie können sich nicht selbst löschen!');
        return;
    }
    
    if (confirm(`Benutzer ${users[username].fullName} wirklich löschen?`)) {
        delete users[username];
        delete adminPasswords[username];
        saveUsers();
        saveAdminPasswords();
        renderUsersList();
        console.log('🗑️ Benutzer gelöscht:', username);
    }
}

function changeAdminPassword() {
    const newPassword = document.getElementById('newAdminPassword').value;
    
    if (newPassword.length < 6) {
        alert('Admin-Passwort muss mindestens 6 Zeichen lang sein!');
        return;
    }
    
    adminPasswords[currentUser.username] = newPassword;
    saveAdminPasswords();
    document.getElementById('newAdminPassword').value = '';
    
    alert('Admin-Passwort erfolgreich geändert!');
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

// Dark Mode System
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    
    if (isDark) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'true');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'false');
    }
    
    console.log('🌙 Dark Mode:', isDark ? 'aktiviert' : 'deaktiviert');
}

function loadTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeIcon').className = 'fas fa-sun';
    }
}

// Enhanced Data Management
function loadUsers() {
    const saved = localStorage.getItem('itAssetUsers');
    if (saved) {
        users = { ...users, ...JSON.parse(saved) };
    }
}

function saveUsers() {
    localStorage.setItem('itAssetUsers', JSON.stringify(users));
}

function loadAdminPasswords() {
    const saved = localStorage.getItem('itAssetAdminPasswords');
    if (saved) {
        adminPasswords = JSON.parse(saved);
    }
}

function saveAdminPasswords() {
    localStorage.setItem('itAssetAdminPasswords', JSON.stringify(adminPasswords));
}

// Enhanced Device Management
function openAddModal() {
    editingIndex = -1;
    document.getElementById('modalTitle').textContent = `${deviceNames[currentTab].slice(0, -1)} hinzufügen`;
    document.getElementById('deviceForm').reset();
    
    // Auto-generate inventory number
    const deviceType = deviceTypes[currentTab];
    const prefix = deviceType.toUpperCase().substr(0, 2);
    const count = devices[deviceType].length + 1;
    document.getElementById('inventoryNumber').value = `${prefix}${count.toString().padStart(4, '0')}`;
    
    updateLocationOptions();
    document.getElementById('deviceModal').style.display = 'flex';
}

function editDevice(index) {
    editingIndex = index;
    const deviceType = deviceTypes[currentTab];
    const device = devices[deviceType][index];
    
    document.getElementById('modalTitle').textContent = `${deviceNames[currentTab].slice(0, -1)} bearbeiten`;
    
    // Fill form with device data
    document.getElementById('deviceName').value = device.name || '';
    document.getElementById('inventoryNumber').value = device.inventoryNumber || '';
    document.getElementById('deviceModel').value = device.model || '';
    document.getElementById('deviceOS').value = device.os || '';
    document.getElementById('deviceLocation').value = device.location || '';
    document.getElementById('assignedTo').value = device.assignedTo || '';
    document.getElementById('deviceStatus').value = device.status || 'Verfügbar';
    document.getElementById('remarks').value = device.remarks || '';
    
    updateLocationOptions();
    document.getElementById('deviceModal').style.display = 'flex';
}

function saveDevice(e) {
    e.preventDefault();
    
    const deviceData = {
        name: document.getElementById('deviceName').value.trim(),
        inventoryNumber: document.getElementById('inventoryNumber').value.trim(),
        model: document.getElementById('deviceModel').value.trim(),
        os: document.getElementById('deviceOS').value,
        location: document.getElementById('deviceLocation').value,
        assignedTo: document.getElementById('assignedTo').value.trim(),
        status: document.getElementById('deviceStatus').value,
        remarks: document.getElementById('remarks').value.trim()
    };
    
    const deviceType = deviceTypes[currentTab];
    
    if (editingIndex === -1) {
        // Add new device
        devices[deviceType].push(deviceData);
        console.log('➕ Neues Gerät hinzugefügt');
    } else {
        // Update existing device (preserve defect reports)
        const existingDevice = devices[deviceType][editingIndex];
        deviceData.defectReport = existingDevice.defectReport;
        devices[deviceType][editingIndex] = deviceData;
        console.log('✏️ Gerät aktualisiert');
    }
    
    renderDevices();
    closeModal();
    saveData();
}

// Enhanced rendering with defect information
function renderDevices() {
    const deviceType = deviceTypes[currentTab];
    const deviceList = devices[deviceType];
    const container = document.getElementById('deviceList');
    
    if (deviceList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: #d1d5db; margin-bottom: 16px;"></i>
                <h3 style="color: #6b7280; margin-bottom: 8px;">Keine Geräte vorhanden</h3>
                <p style="color: #9ca3af;">Fügen Sie Ihr erstes Gerät hinzu.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = deviceList.map((device, index) => `
        <div class="device-card">
            <div class="device-header">
                <div class="device-name">${device.name || 'Unbenanntes Gerät'}</div>
                <div class="device-actions">
                    <button class="btn btn-secondary" onclick="editDevice(${index})" title="Bearbeiten">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="reportDefect(${index})" title="Defekt melden" ${device.status === 'Defekt' ? 'disabled' : ''}>
                        <i class="fas fa-exclamation-triangle"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteDevice(${index})" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="device-info">
                <div class="device-info-row">
                    <span class="device-info-label">Inventarnummer:</span>
                    <span class="device-info-value">${device.inventoryNumber || 'N/A'}</span>
                </div>
                <div class="device-info-row">
                    <span class="device-info-label">Modell:</span>
                    <span class="device-info-value">${device.model || 'N/A'}</span>
                </div>
                <div class="device-info-row">
                    <span class="device-info-label">Standort:</span>
                    <span class="device-info-value">${device.location || 'N/A'}</span>
                </div>
                <div class="device-info-row">
                    <span class="device-info-label">Zugewiesen an:</span>
                    <span class="device-info-value">${device.assignedTo || 'Niemand'}</span>
                </div>
                <div class="device-info-row">
                    <span class="device-info-label">Status:</span>
                    <span class="status-badge status-${getStatusClass(device.status)}">${device.status || 'Verfügbar'}</span>
                </div>
                ${device.defectReport ? `
                    <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">
                            <i class="fas fa-exclamation-triangle"></i> Defekt gemeldet
                        </div>
                        <div style="font-size: 13px; color: #92400e;">
                            ${device.defectReport.description.substring(0, 100)}${device.defectReport.description.length > 100 ? '...' : ''}
                        </div>
                        <div style="font-size: 12px; color: #78716c; margin-top: 4px;">
                            Gemeldet von ${device.defectReport.reportedBy} am ${device.defectReport.reportDate}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}
