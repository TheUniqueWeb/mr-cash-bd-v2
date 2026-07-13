const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const newFieldsHTML = `
              {/* Maintenance Mode */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 font-display text-sm">Site Maintenance Mode</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When enabled, the app will be completely shut down for users. Only admins can bypass this to see the dashboard.
                </p>
                <div className="pt-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                     Shutdown Message
                   </label>
                   <input
                     type="text"
                     value={maintenanceMessage}
                     onChange={(e) => setMaintenanceMessage(e.target.value)}
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
                     placeholder="e.g. System is undergoing maintenance..."
                   />
                </div>
              </div>

              {/* Global Broadcast Message */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Global Broadcast Message
                </label>
                <input
                  type="text"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
                  placeholder="Enter a message to show at the top of the dashboard for all users. Leave blank to hide."
                />
              </div>
`;

// Insert the newFieldsHTML just before the closing </div> of the grid, which is before the Support Telegram Link.
const targetRegex = /\{\/\* Support Telegram Link \*\/\}/;
code = code.replace(targetRegex, newFieldsHTML + '\n              {/* Support Telegram Link */}');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
