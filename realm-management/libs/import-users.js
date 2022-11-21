/* eslint-disable no-console */
const ldap = require('ldapjs');
const fs = require('fs-extra');

const { LDAP_CONFIG, LDAP_CRED, LDAP_USERS_FILE_PATH } = require('../constants');

/**
 * Import LDAP users to file with GUID attributes
 * TODO: turn ldap requests into async and await functions
 */
const importLdapUsers = async () => {
  try {
    /* Read users.json file */
    const users = JSON.parse(
      fs.readFileSync(LDAP_USERS_FILE_PATH, { encoding: 'utf-8' }, (err) => {
        throw Error(err);
      }),
    );

    const usersWithoutGuids = users.filter(
      (user) => !user.attributes && !user.attributes.idir_user_guid,
    );

    console.log(`Found ${users.length} users with ${usersWithoutGuids.length} missing guids`);

    /* Create LDAP search filter */
    const filter = new ldap.OrFilter({
      filters: usersWithoutGuids.map((user) => {
        console.log(user.username);
        return new ldap.EqualityFilter({
          attribute: 'samAccountName',
          value: user.username,
        });
      }),
    });

    // create ldap client:
    console.log('create ldap client');
    const client = ldap.createClient({
      url: LDAP_CONFIG.url,
      tlsOptions: { rejectUnauthorized: false },
    });

    // added error handler:
    client.on('error', (err) => {
      throw Error(err);
    });

    /* Bind to LDAP and run search */
    client.bind(`${LDAP_CRED.username}`, LDAP_CRED.password, (e) => {
      const opts = {
        filter,
        scope: 'sub',
        attributes: LDAP_CONFIG.optionAttri,
      };
      client.search(LDAP_CONFIG.base, opts, (e, res) => {
        res.on('searchEntry', (entry) => {
          users.filter(
            (user) => user.username === entry.object.sAMAccountName.toLowerCase(),
          )[0].attributes.idir_user_guid = entry.object.bcgovGUID;
        });

        client.unbind((e) => {
          console.log('Unbinding from LDAP client');
          fs.writeFileSync(LDAP_USERS_FILE_PATH, JSON.stringify(users, null, 4), (e) => {
            if (e) {
              console.log(e);
            }
          });
          console.log('Saved updated users to users file');
        });
      });
    });
  } catch (err) {
    throw Error(err);
  }
};

/**
 * Create user with roles
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {Object} user that contains user info
 * @param {String} idpSuffix default to IDIR
 */
const createUserWithRoles = async (kcAdminClient, user, idpSuffix = '@idir') => {
  try {
    // check valid input
    if (!user.username) console.warn('This user undefined');
    const fullUsername = `${user.username}${idpSuffix}`;

    // check user exists:
    const targetUser = await kcAdminClient.users.find(fullUsername);
    let newUserId;
    let userExist = false;

    if (targetUser.length > 0) {
      const resultUsers = targetUser.filter((u) => u.username === fullUsername);

      if (resultUsers.length === 0) {
        userExist = false;
      } else if (resultUsers.length === 1) {
        userExist = true;
        console.log(`User exists: ${fullUsername}`);
        newUserId = resultUsers[0].id;
      } else {
        throw Error(`Multiple users found with username ${fullUsername}`);
      }
    }

    // if not exist, create user:
    if (!userExist) {
      console.log(`create user: ${fullUsername}`);
      // create new user
      const newUser = await kcAdminClient.users.create({
        username: fullUsername,
        enabled: true,
        attributes: user.attributes,
      });
      newUserId = newUser.id;
    }

    console.log(`User ID: ${newUserId}`);
    // assign roles if specified:
    if (user.roles) {
      // check for available realm roles for this user
      // TODO: enable client roles
      const availableRoles = await kcAdminClient.users.listAvailableRealmRoleMappings({
        id: newUserId,
      });

      // filter out the roles that are not applicable:
      const roles = Object.keys(availableRoles).reduce((acc, r) => {
        if (user.roles.includes(availableRoles[r].name)) {
          acc.push({
            name: availableRoles[r].name,
            id: availableRoles[r].id,
          });
        }
        return acc;
      }, []);

      if (roles && Object.keys(roles).length) {
        console.log(`Assign roles for user ${user.username}`);

        // add role to user
        await kcAdminClient.users.addRealmRoleMappings({
          id: newUserId,
          roles,
        });
      } else {
        console.log(`No roles to assign to ${user.username}`);
      }
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * Pre-populate user with Github username
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {Object} user that contains user info
 * @param {String} idpSuffix default to github
 * user: githubID, username
 */
 const createUserWithIDP = async (kcAdminClient, user, idpSuffix = '@github') => {
  try {
    // check valid input
    if (!user.username || !user.githubID) console.warn('This user is undefined');
    const fullUsername = `${user.username}${idpSuffix}`;
    const userIDPSuffix = '@githubpublic';
    const fullIDPUsername = `${user.githubID}${userIDPSuffix}`;


    // check user exists:
    const targetUser = await kcAdminClient.users.find(fullUsername);
    let newUserId;
    let userExist = false;

    if (targetUser.length > 0) {
      const resultUsers = targetUser.filter((u) => u.username === fullUsername);

      if (resultUsers.length === 0) {
        userExist = false;
      } else if (resultUsers.length === 1) {
        userExist = true;
        console.log(`User exists: ${fullUsername}`);
        newUserId = resultUsers[0].id;
      } else {
        throw Error(`Multiple users found with username ${fullUsername}`);
      }
    }

    // if not exist, create user:
    if (!userExist) {
      console.log(`Create New User: ${fullUsername}`);
      // create new user
      const newUser = await kcAdminClient.users.create({
        username: fullUsername,
        enabled: true,
      });
      newUserId = newUser.id;
      console.log(`User ID: ${newUserId}`);

      await kcAdminClient.users.addToFederatedIdentity({
        id: newUserId,
        federatedIdentityId: 'oidc-github',
        federatedIdentity: {
          userId: fullIDPUsername,
          userName: fullIDPUsername,
          identityProvider: 'oidc-github',
        },
      });
    }

  } catch (err) {
    throw Error(err);
  }
};


/**
 * Create list of users from file input
 * @param {kcAdmin} kcAdminClient with auth setup and specified realm
 */
const createUsers = async (kcAdminClient) => {
  try {
    /* Read users.json file */
    const users = JSON.parse(
      fs.readFileSync(LDAP_USERS_FILE_PATH, { encoding: 'utf-8' }, (err) => {
        console.error(err);
        process.exit();
      }),
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      // for each user:
      // eslint-disable-next-line no-await-in-loop
      await createUserWithRoles(kcAdminClient, user);
    }
  } catch (err) {
    throw Error(err);
  }
};

module.exports = { importLdapUsers, createUsers, createUserWithIDP };
