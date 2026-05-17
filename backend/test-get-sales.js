const http = require('http');

async function testGetSales() {
  // 1. Login to get token
  const loginData = JSON.stringify({ phone: '75472634', pin: '4567' });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const token = await new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.access_token);
        } catch(e) {
          reject(body);
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log('Token obtained:', token ? 'YES' : 'NO');

  // 2. Get sales
  const salesOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/sales',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const salesResponse = await new Promise((resolve, reject) => {
    const req = http.request(salesOptions, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log('GET /sales status:', salesResponse.status);
  console.log('GET /sales body:', salesResponse.body);
}

testGetSales().catch(console.error);
