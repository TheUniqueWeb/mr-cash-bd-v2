const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add states for maintenance and broadcast
const stateRegex = /const \[supportLink, setSupportLink\] = useState\('https:\/\/t.me\/mrcashbd'\);/;
const newStates = `const [supportLink, setSupportLink] = useState('https://t.me/mrcashbd');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System is undergoing maintenance. Please check back shortly.');
  const [broadcastMessage, setBroadcastMessage] = useState('');`;
code = code.replace(stateRegex, newStates);

// 2. Set states in fetchAllAdminData
const setSettingsRegex = /setSupportLink\(setts\.supportLink \|\| 'https:\/\/t\.me\/mrcashbd'\);/;
const newSetSettings = `setSupportLink(setts.supportLink || 'https://t.me/mrcashbd');
        setMaintenanceMode(setts.maintenanceMode || false);
        setMaintenanceMessage(setts.maintenanceMessage || '');
        setBroadcastMessage(setts.broadcastMessage || '');`;
code = code.replace(setSettingsRegex, newSetSettings);

// 3. Update handleSaveSettings
const saveSettingsBodyRegex = /body: JSON\.stringify\(\{[\s\S]*?supportLink[\s\S]*?\}\),/;
const newSaveSettingsBody = `body: JSON.stringify({
          vpnCheckEnabled, conversionRate, pointsToBdtRate, 
          minWithdrawRechargePoints, minWithdrawBankPoints, 
          adsenseCode, supportLink,
          maintenanceMode, maintenanceMessage, broadcastMessage
        }),`;
code = code.replace(saveSettingsBodyRegex, newSaveSettingsBody);

// 4. Add handleDeleteUser
const handleUserActionRegex = /const handleUserAction = async /;
const handleDeleteUserStr = `// Handle Delete User
  const handleDeleteUser = async (username: string) => {
    if (!confirm(\`Are you sure you want to completely delete user: \${username}?\`)) return;
    setActionMsg('Deleting user...');
    try {
      const res = await fetch(\`/api/v1/admin/users/\${username}\`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMsg(\`User \${username} successfully deleted!\`);
        fetchAllAdminData();
      } else {
        setActionMsg('Failed to delete user.');
      }
    } catch (err: any) {
      setActionMsg(\`Error: \${err.message}\`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };
  
  const handleUserAction = async `;
code = code.replace(handleUserActionRegex, handleDeleteUserStr);

// 5. Add Delete button in User Table
const unbanBtnRegex = /<button[\s\S]*?onClick=\{\(\) => handleUserAction\(u\.username, 'unban'\)\}[\s\S]*?>[\s\S]*?Unban[\s\S]*?<\/button>/;
const newUnbanBtn = `<button
                              onClick={() => handleUserAction(u.username, 'unban')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded hover:bg-emerald-100 cursor-pointer"
                              id={\`unban-btn-\${u.username}\`}
                            >
                              Unban
                            </button>`;
code = code.replace(unbanBtnRegex, newUnbanBtn);

// Also add a delete button next to ban/unban button
const banUnbanBlockRegex = /\{\/\* Ban Button \*\/\}([\s\S]*?)<\/div>/;
const matchBanUnban = code.match(banUnbanBlockRegex);
if (matchBanUnban) {
  const replacement = `{/* Ban Button */}${matchBanUnban[1]}
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded hover:bg-red-500 hover:text-white cursor-pointer ml-2 transition"
                            id={\`delete-btn-\${u.username}\`}
                          >
                            Delete
                          </button>
                        </div>`;
  code = code.replace(matchBanUnban[0], replacement);
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);
