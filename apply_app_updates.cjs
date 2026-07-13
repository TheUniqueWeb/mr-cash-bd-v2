const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const maintenanceBlock = `
  // If maintenance mode is active, block non-admins completely
  if (systemSettings?.maintenanceMode && !user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-orange-500 mb-6" />
        <h1 className="text-3xl font-display font-black mb-3 text-slate-900">Maintenance Break</h1>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-sm md:text-base">
          {systemSettings.maintenanceMessage || 'System is undergoing maintenance. Please check back shortly.'}
        </p>
        
        {/* Invisible button to trigger auth modal if admin wants to login */}
        <button 
          onClick={() => setIsAuthOpen(true)}
          className="mt-12 text-[10px] text-slate-300 hover:text-slate-400 font-mono tracking-widest uppercase"
        >
          Admin Override Access
        </button>
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
      </div>
    );
  }
`;

// Insert the maintenance block just before return ( <div className="min-h-screen
const returnRegex = /return \(\n\s*<div className="min-h-screen/;
code = code.replace(returnRegex, maintenanceBlock + '\n  return (\n    <div className="min-h-screen');

// Add broadcast message banner
const broadcastBanner = `
      {/* Broadcast Message */}
      {systemSettings?.broadcastMessage && (
        <div className="bg-blue-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-blue-200" />
          <span>{systemSettings.broadcastMessage}</span>
        </div>
      )}
`;

const mainRegex = /<main className="flex-grow pb-16">/;
code = code.replace(mainRegex, mainRegex + '\n' + broadcastBanner);

fs.writeFileSync('src/App.tsx', code);
