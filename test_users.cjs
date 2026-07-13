const axios = require('axios');
axios.get('http://0.0.0.0:3000/api/v1/admin/users')
  .then(res => console.log(res.data))
  .catch(err => console.log(err.message));
