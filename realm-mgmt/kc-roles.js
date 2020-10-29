var request = require('request');

async function retrieve(accessToken, env, realm, userId, clientId) {
  const SSO_HOSTNAME = `sso-${env}.pathfinder.gov.bc.ca`;
  const SSO_ROLES_PATH = `/auth/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientId}/available`;

  const options = {
    method: 'GET',
    uri: 'https://' + SSO_HOSTNAME + SSO_ROLES_PATH,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `bearer ${accessToken}`
    }
  }
  
  const reqPromise = new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        console.log(err);
      }
      if (res.statusCode === 200) {
        resolve(body);
      } else if(res.statusCode !== 200 || err) {
        console.log(res.statusCode)
        console.log(`error retrieving roles for user ${userId} in client ${clientId}`);
        reject();
      }
    });
  });

  let roles = null;
  await reqPromise.then(availableRoles => {roles = JSON.parse(availableRoles)});
  return roles;
}

async function addToUser(accessToken, env, realm, userId, clientId, roles) {
  const SSO_HOSTNAME = `sso-${env}.pathfinder.gov.bc.ca`;
  const PATH = `/auth/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientId}`;

  const options = {
    method: 'POST',
    body: roles,
    json: true,
    uri: 'https://' + SSO_HOSTNAME + PATH,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${accessToken}`
    }
  }

  const reqPromise = new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        console.log(err);
      }
      if (res.statusCode === 204) {
        resolve(true);
      } else if(res.statusCode !== 204 || err) {
        console.log(`error caught adding user ${userId} to roles`);
        reject(false);
      }
    });
  });

  let success = false;
  await reqPromise.then(() => {success = true});
  return success;
}

module.exports = {
  retrieve,
  addToUser
};
