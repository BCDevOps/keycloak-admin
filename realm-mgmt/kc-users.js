var request = require('request');

var kcRoles = require('./kc-roles');

async function createUser(accessToken, env, realm, username, idir_user_guid) {
  if(typeof idir_user_guid === 'undefined') {
    return null;
  }
  const user = {
    username: `${username}@idir`,
    enabled: true,
    attributes: {
      idir_user_guid: idir_user_guid
    }
  }
  const SSO_HOSTNAME = `sso-${env}.pathfinder.gov.bc.ca`;
  const SSO_USERS_PATH = `/auth/admin/realms/${realm}/users`;
  
  const options = {
    method: 'POST',
    json: true,
    body: user,
    uri: 'https://' + SSO_HOSTNAME + SSO_USERS_PATH,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${accessToken}`
    }
  }

  const reqPromise = new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (res.statusCode === 201) {
        id = res.headers.location.split('/').pop();
        resolve(id);
      } else if(res.statusCode !== 201 || err) {
        if (err) {
          console.log(err);
        }
        console.log(res.statusCode)
        console.log(`error caught creating user ${username}`);
        reject();
      }
    });
  });

  let id = null;
  await reqPromise.then(userId => {id = userId});
  return id;
}

async function createUsers(users, accessToken, env, realm, clientId) {
  try {
    for (var i = 0; i < users.length; i++) {
      if (typeof users[i][`sso_${env}_id`] === 'undefined' || users[i][`sso_${env}_id`] === null) {
        const userId = await createUser(accessToken, env, realm, users[i].idir_username, users[i].idir_user_guid);
        users[i][`sso_${env}_id`] = userId;

        let roles = await kcRoles.retrieve(accessToken, env, realm, userId, clientId);
        roles = roles.filter(role => users[i].roles.includes(role.name) );
        
        roleResp = await kcRoles.addToUser(accessToken, env, realm, userId, clientId, roles)
        console.log(`Successfully created user ${users[i].idir_username} and added to ${users[i].roles.join(',')}`)
      }
    }
    return users;
  } catch(e) {
    console.log(e);
    console.log('error caught creating users');
  }
}

module.exports = {
  createUser,
  createUsers
};
