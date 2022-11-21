const kcAdmin = require('keycloak-admin').default;
const fs = require('fs-extra');
const { Http } = require('node-https');

const { importLdapUsers, createUsers, createUserWithIDP } = require('./libs/import-users');
const { getAllRealms, getRealmSettings, getRealmUsers, getAllRealmAdmins, getRealmAdmins, getAllUsers } = require('./libs/get-realms');
// const { ssoServiceNameMigration } = require('./libs/service-name-migration');
// const { deleteClientRole } = require('./libs/update-client-role');
const { KC_CONFIG, KC_TERMS, GH_AUTH } = require('./constants');

const main = async () => {
  try {
    // +++ Setup kc admin instance:
    // eslint-disable-next-line new-cap
    const kcAdminClient = new kcAdmin(KC_CONFIG.REQUEST);
    await kcAdminClient.auth(KC_CONFIG.AUTH);

    // +++ Override client configuration for all further requests:
    // kcAdminClient.setConfig({
    //   realmName: KC_CONFIG.REALM.NAME,
    // });

    // // ---------- Platform-services team SSO realm Migration:----------
    // // 0. setup Github client:
    // const http = new Http();
    // const httpOptions = {
    //   headers: {
    //     'User-Agent': `Awesome-Octocat-App`,
    //     'authorization': `Bearer ${GH_AUTH.GITHUB_TOKEN}`
    //   }
    // };

    // // 1. get all old users
    // const OUTPUT_FILE=`output/prod-users.json`;
    // // const realmUsers = await getRealmUsers(kcAdminClient, KC_CONFIG.REALM.NAME);
    // // await fs.outputJson(OUTPUT_FILE, realmUsers);

    // // 2. create new users:
    // /* Read users.json file */
    // const input = JSON.parse(
    //   fs.readFileSync(OUTPUT_FILE, { encoding: 'utf-8' }, (err) => {
    //     console.error(err);
    //     process.exit();
    //   }),
    // );

    // const users = input.users;

    // // eslint-disable-next-line no-restricted-syntax
    // for (const user of users) {
    //   // for each user:
    //   // eslint-disable-next-line no-await-in-loop
    //   // 0. abstract out the github username
    //   const username = user.split("@")[0];
    //   // 1. get github account ID
    //   const githubUserContent = await http.get(`${GH_AUTH.GITHUB_API}${username}`, httpOptions);
    //   const newUser = {
    //     githubID: githubUserContent.data.id,
    //     username: username,
    //   }
    //   console.log(newUser);

    //   // 2. create keycloak user
    //   await createUserWithIDP(kcAdminClient, newUser);
    // }
    // ----------------------------------------

    // +++ Get all realms:
    // const allRealms = await getAllRealms(kcAdminClient);
    // allRealms.forEach((r) => {
    //   console.log(`ID: ${r.id}, Realm Name: ${r.displayName}`);
    // });

    // +++ Get all users:
    // const realmUsers = await getRealmUsers(kcAdminClient, KC_CONFIG.REALM.NAME);
    // const allUsers = await getAllUsers(kcAdminClient);
    // const totalCount = allUsers.reduce((acc, u) => acc + u.count, 0);
    // console.log(`Total user count: ${totalCount}`);
    // await fs.outputJson(`output/${process.env.KC_ENV}-users-${totalCount}.json`, allUsers);

    // +++ Get admin users:
    // const adminUsers = await getRealmAdmins(kcAdminClient, KC_CONFIG.REALM.NAME);
    // const allAdminUsers = await getAllRealmAdmins(kcAdminClient);
    // await fs.outputJson(`output/${process.env.KC_ENV}-all-admin-user.json`, allAdminUsers);


    // +++ Pre-populate users from LDAP, require realm setup already:
    // await importLdapUsers();
    // await createUsers(kcAdminClient);

    // +++ SSO Service Name Migration
    // await ssoServiceNameMigration(kcAdminClient);

    // +++ Get realm settings:
    // await getRealmSettings(kcAdminClient, KC_CONFIG.REALM.NAME);

    // +++ Disable impersonation role:
    // await deleteClientRole(KC_TERMS.IMPERSONATION_ROLE, false);
  } catch (err) {
    console.error(err);
  }
};
main();
