fetch('http://0.0.0.0:3000/api/v1/admin/users/edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'mahamud004828282', action: 'ban' })
}).then(r => r.json()).then(console.log).catch(console.error);
