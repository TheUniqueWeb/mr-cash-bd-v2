const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '0.0.0.0',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log(await post('/api/v1/admin/settings/update', {
    vpnCheckEnabled: true, conversionRate: 10000, pointsToBdtRate: 100,
    minWithdrawRechargePoints: 2000, minWithdrawBankPoints: 10000,
    adsenseCode: '', supportLink: 'https://t.me/mrcashbd',
    maintenanceMode: false, maintenanceMessage: '', broadcastMessage: ''
  }));

  console.log(await post('/api/v1/admin/users/edit', { username: 'mahamud004828282', action: 'ban' }));

  console.log(await post('/api/v1/admin/redeem-codes', {
    code: 'TESTCODE', name: 'Test', rewardPoints: 100, description: 'desc', image: '', eligibilityType: 'all', maxUsers: 0, expiresAt: Date.now() + 100000
  }));
}
run();
