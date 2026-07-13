const http = require('https');
http.get('https://www.cpalead.com/api/offers?id=3354341', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data.substring(0, 500)));
});
