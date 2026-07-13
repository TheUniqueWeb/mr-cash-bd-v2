const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Update sysSettings defaults and loading
code = code.replace(/adsenseCode: '',\n  supportLink: 'https:\/\/t.me\/mrcashbd'\n};/, "adsenseCode: '',\n  supportLink: 'https://t.me/mrcashbd',\n  maintenanceMode: false,\n  maintenanceMessage: 'System is undergoing maintenance. Please check back shortly.',\n  broadcastMessage: '',\n};");

code = code.replace(/supportLink: rows\[0\]\.supportLink,\n      };/, "supportLink: rows[0].supportLink,\n        maintenanceMode: rows[0].maintenanceMode,\n        maintenanceMessage: rows[0].maintenanceMessage,\n        broadcastMessage: rows[0].broadcastMessage,\n      };");

// 2. Update the /api/v1/admin/settings/update endpoint
const settingsUpdateRegex = /app\.post\('\/api\/v1\/admin\/settings\/update', async \(req, res\) => \{[\s\S]*?\.catch\(err => \{\n        console\.error\('Update settings error:', err\);\n        res\.status\(500\)\.json\(\{ error: 'Failed to update settings\.' \}\);\n      \}\);\n  \}\);/g;

const newSettingsUpdate = `app.post('/api/v1/admin/settings/update', async (req, res) => {
    try {
      const { 
         vpnCheckEnabled, 
         conversionRate, 
         pointsToBdtRate, 
         minWithdrawRechargePoints, 
         minWithdrawBankPoints,
        adsenseCode,
        supportLink,
        maintenanceMode,
        maintenanceMessage,
        broadcastMessage
      } = req.body;

      if (vpnCheckEnabled !== undefined) sysSettings.vpnCheckEnabled = !!vpnCheckEnabled;
      if (conversionRate !== undefined) sysSettings.conversionRate = Number(conversionRate);
      if (pointsToBdtRate !== undefined) sysSettings.pointsToBdtRate = Number(pointsToBdtRate);
      if (minWithdrawRechargePoints !== undefined) sysSettings.minWithdrawRechargePoints = Number(minWithdrawRechargePoints);
      if (minWithdrawBankPoints !== undefined) sysSettings.minWithdrawBankPoints = Number(minWithdrawBankPoints);
      if (adsenseCode !== undefined) sysSettings.adsenseCode = String(adsenseCode);
      if (supportLink !== undefined) sysSettings.supportLink = String(supportLink);
      if (maintenanceMode !== undefined) sysSettings.maintenanceMode = !!maintenanceMode;
      if (maintenanceMessage !== undefined) sysSettings.maintenanceMessage = String(maintenanceMessage);
      if (broadcastMessage !== undefined) sysSettings.broadcastMessage = String(broadcastMessage);

      // Persist to PostgreSQL
      await drizzleDb.insert(systemSettings)
        .values({
          id: 'global',
          ...sysSettings
        })
        .onConflictDoUpdate({
          target: systemSettings.id,
          set: {
            ...sysSettings
          }
        });

      res.json({ success: true, message: 'Settings updated successfully.', data: sysSettings });
    } catch (err) {
      console.error('Update settings error:', err);
      res.status(500).json({ error: 'Failed to update settings.' });
    }
  });`;

code = code.replace(settingsUpdateRegex, newSettingsUpdate);

// 3. Add DELETE user endpoint and GET all users (since it wasn't there before)
const adminUsersEndpoints = `
  // ADMIN: Get all users
  app.get('/api/v1/admin/users/all', async (req, res) => {
    try {
      const allUsers = await drizzleDb.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.createdAt)]
      });
      res.json(allUsers);
    } catch (err) {
      console.error('Fetch all users error:', err);
      res.status(500).json({ error: 'Failed to fetch users.' });
    }
  });

  // ADMIN: Delete user
  app.delete('/api/v1/admin/users/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const usernameNormalized = username.toLowerCase().trim();
      await drizzleDb.delete(schema.users).where(eq(schema.users.username, usernameNormalized));
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // ADMIN: Send Broadcast
  app.post('/api/v1/admin/broadcast', async (req, res) => {
    try {
      const { message } = req.body;
      sysSettings.broadcastMessage = String(message || '');
      
      await drizzleDb.update(systemSettings)
        .set({ broadcastMessage: sysSettings.broadcastMessage })
        .where(eq(systemSettings.id, 'global'));
        
      res.json({ success: true, message: 'Broadcast updated successfully.' });
    } catch (err) {
      console.error('Broadcast error:', err);
      res.status(500).json({ error: 'Failed to update broadcast.' });
    }
  });
`;

if (!code.includes('app.delete(\'/api/v1/admin/users/:username\'')) {
  code = code.replace('// 10. ADMIN: Get, Ban & Edit User Balance', adminUsersEndpoints + '\n  // 10. ADMIN: Get, Ban & Edit User Balance');
}

fs.writeFileSync('server.ts', code);
