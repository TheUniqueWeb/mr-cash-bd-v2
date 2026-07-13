const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const topRegex = /const expirationTimestamp = new Date\(newExpiresAt\)\.getTime\(\);[\s\S]*?\{\/\* 4\. POSTBACK LEADS TAB \*\//;

const missingCode = `
      const expirationTimestamp = new Date(newExpiresAt).getTime();
      const res = await fetch('/api/v1/admin/redeem-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          name: newName,
          rewardPoints: Number(newRewardPoints),
          description: newDescription,
          image: newImage,
          eligibilityType: newEligibilityType,
          maxUsers: Number(newMaxUsers),
          expiresAt: expirationTimestamp,
        }),
      });

      if (res.ok) {
        setActionMsg('Redemption code successfully saved!');
        setNewCode('');
        setNewName('');
        setNewRewardPoints(500);
        setNewDescription('');
        setNewImage('');
        setNewEligibilityType('all');
        setNewMaxUsers(100);
        setNewExpiresAt('');
        fetchAllAdminData();
      } else {
        const err = await res.json();
        setActionMsg(\`Failed to save code: \${err.error || 'Unknown error'}\`);
      }
    } catch (err: any) {
      setActionMsg(\`Save error: \${err.message}\`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Delete Redeem Code
  const handleDeleteRedeemCode = async (code: string) => {
    if (!confirm(\`Are you sure you want to delete redemption code: \${code}?\`)) return;
    setActionMsg('Deleting redeem code...');
    try {
      const res = await fetch('/api/v1/admin/redeem-codes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setActionMsg('Redemption code successfully deleted!');
        fetchAllAdminData();
      } else {
        setActionMsg('Failed to delete redemption code.');
      }
    } catch (err: any) {
      setActionMsg(\`Delete error: \${err.message}\`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Handle Withdrawal approval or rejection
  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setActionMsg('Processing...');
    try {
      const res = await fetch('/api/v1/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(\`Withdrawal \${withdrawalId} successfully \${action}d!\`);
        fetchAllAdminData();
      } else {
        setActionMsg(\`Action failed: \${data.error}\`);
      }
    } catch (err: any) {
      setActionMsg(\`Action error: \${err.message}\`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Handle Delete User
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

  // Handle User action: edit balance or ban status
  const handleUserAction = async (username: string, action: 'ban' | 'unban' | 'setPoints', value?: number) => {
    setActionMsg('Saving user alterations...');
    try {
      const res = await fetch('/api/v1/admin/users/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action, value }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(\`User \${username} status altered successfully!\`);
        fetchAllAdminData();
      } else {
        setActionMsg(\`Altering failed: \${data.error}\`);
      }
    } catch (err: any) {
      setActionMsg(\`Error: \${err.message}\`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('Updating settings...');
    try {
      const res = await fetch('/api/v1/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpnCheckEnabled, conversionRate, pointsToBdtRate, 
          minWithdrawRechargePoints, minWithdrawBankPoints, 
          adsenseCode, supportLink,
          maintenanceMode, maintenanceMessage, broadcastMessage
        }),
      });

      if (res.ok) {
        setActionMsg('System parameters successfully saved!');
        fetchAllAdminData();
      } else {
        setActionMsg('Failed to save parameters.');
      }
    } catch (err: any) {
      setActionMsg(\`Error: \${err.message}\`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const filteredUsers = users.filter((u) => 
    (u.username || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
    (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8" id="admin-panel-root">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600 animate-pulse" />
            MR CASH BD - System Administrator Panel
          </h2>
          <p className="text-sm text-slate-500">Welcome, <strong>{adminUser.username}</strong> ({adminUser.email}). Modify withdrawal tickets, system rates, or ban fraudsters.</p>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            SYNCING
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Platform Stats', icon: TrendingUp },
          { id: 'withdrawals', label: 'Withdrawal Tickets', icon: Wallet },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'postbacks', label: 'CPA Lead Logs', icon: Target },
          { id: 'redeem', label: 'Redeem Codes', icon: Gift },
          { id: 'settings', label: 'Global Settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={\`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all \${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
            }\`}
            id={\`admin-tab-\${tab.id}\`}
          >
            <tab.icon className={\`w-4 h-4 \${activeSubTab === tab.id ? 'text-blue-200' : 'text-slate-400'}\`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn" id="admin-overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-16 h-16" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</h4>
              <p className="text-3xl font-black font-display text-slate-800">{stats?.totalUsers.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-16 h-16" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CPA Leads Received</h4>
              <p className="text-3xl font-black font-display text-slate-800">{stats?.totalLeads.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign className="w-16 h-16 text-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Pending Payouts</h4>
              <p className="text-3xl font-black font-display text-emerald-600">৳ {stats?.pendingWithdrawalsBdt.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet className="w-16 h-16" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid (Approved)</h4>
              <p className="text-3xl font-black font-display text-slate-800">৳ {stats?.approvedWithdrawalsBdt.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWALS TAB */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4 animate-fadeIn" id="admin-withdrawals-ledger">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800">Withdrawal Tickets Queue</h3>
            <p className="text-xs text-slate-500">Approve or reject pending cashout requests from users.</p>
          </div>
          
          {withdrawals.length === 0 ? (
            <div className="bg-white p-8 border border-slate-100 rounded-2xl text-center text-slate-400">
              No withdrawal requests logged yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Account Number</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Est. BDT</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {withdrawals.map((wd) => (
                      <tr key={wd.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">{wd.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold">{wd.username}</p>
                            <p className="text-[10px] text-slate-400">{wd.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">{wd.method}</td>
                        <td className="px-6 py-4 font-mono text-xs">{wd.accountNumber}</td>
                        <td className="px-6 py-4 text-slate-500">{wd.amountPoints.toLocaleString()} PTS</td>
                        <td className="px-6 py-4 font-black text-emerald-600">৳ {wd.amountBDT.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase \${
                            wd.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            wd.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-orange-50 text-orange-600 border border-orange-100'
                          }\`}>
                            {wd.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {wd.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleWithdrawalAction(wd.id, 'approve')}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Approve Withdrawal"
                                id={\`approve-\${wd.id}\`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleWithdrawalAction(wd.id, 'reject')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Reject & Return Points"
                                id={\`reject-\${wd.id}\`}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="space-y-4 animate-fadeIn" id="admin-users-ledger">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold font-display text-slate-800">User Profiles Registry</h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Points Balance</th>
                    <th className="px-6 py-4">Today Pts</th>
                    <th className="px-6 py-4">Referrals</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance Edit / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold">{u.username}</td>
                      <td className="px-6 py-4 font-mono">{u.email}</td>
                      <td className="px-6 py-4 font-bold font-mono text-slate-800">{u.balancePoints.toLocaleString()} PTS</td>
                      <td className="px-6 py-4 font-mono">{u.todayWorkPoints.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono">{u.totalReferred}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{u.ipAddress || '0.0.0.0'}</td>
                      <td className="px-6 py-4">
                        <span className={\`px-2 py-0.5 rounded font-bold uppercase \${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }\`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          {/* Set Points inline Form */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const pts = (e.target as any).elements.ptsVal.value;
                              handleUserAction(u.username, 'setPoints', Number(pts));
                            }}
                            className="flex gap-1"
                          >
                            <input
                              type="number"
                              name="ptsVal"
                              defaultValue={u.balancePoints}
                              className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[10px] focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded cursor-pointer hover:bg-blue-700"
                              id={\`set-points-btn-\${u.username}\`}
                            >
                              Set
                            </button>
                          </form>
                          {/* Ban Button */}
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(u.username, 'ban')}
                              className="px-2 py-1 bg-red-50 text-red-600 font-bold text-[10px] rounded hover:bg-red-100 cursor-pointer"
                              id={\`ban-btn-\${u.username}\`}
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(u.username, 'unban')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded hover:bg-emerald-100 cursor-pointer"
                              id={\`unban-btn-\${u.username}\`}
                            >
                              Unban
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded hover:bg-red-500 hover:text-white cursor-pointer transition"
                            id={\`delete-user-\${u.username}\`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* 4. POSTBACK LEADS TAB */
`;

code = code.replace(topRegex, missingCode);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
