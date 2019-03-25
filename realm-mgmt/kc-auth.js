const https = require('https');
var readlineSync = require('readline-sync');

async function keycloakAuth(env, realm) {
  /* Prompt user running script for their keycloak credentials to authenticate */
  const username = readlineSync.question('What is your Keycloak username? ');
  // const username = 'brian-admin'
  const password = readlineSync.question('What is your Keycloak password? ', {
    hideEchoBack: true
  });
  // const password = 'password';

  const SSO_HOSTNAME = `sso-${env}.pathfinder.gov.bc.ca`;
  const SSO_TOKEN_PATH = `/auth/realms/${realm}/protocol/openid-connect/token`;

  const options = {
    hostname: SSO_HOSTNAME,
    path: SSO_TOKEN_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  
  const authPayload = `client_id=admin-cli&username=${username}&grant_type=password&password=${password}`;

  const reqPromise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (d) => {
        resolve(JSON.parse(d).access_token);
      });
    });
    
    req.write(authPayload);
    
    req.on('error', (e) => {
      reject(Error(e));
    });
    
    req.end();
  });

  let token = '';
  await reqPromise.then(t => {
    token = t;
  });
  return token;
}

module.exports = keycloakAuth;
