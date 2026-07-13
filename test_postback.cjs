const axios = require('axios');
axios.get('http://0.0.0.0:3000/api/v1/postback/cpalead?userId=test&payout=0.01&password=Mahamud004')
  .then(res => console.log(res.data))
  .catch(err => console.log(err.response ? err.response.data : err.message));
