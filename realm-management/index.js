const kcAdmin = require('keycloak-admin').default;
const fs = require('fs-extra');

// const { importLdapUsers, createUsers } = require('./libs/import-users');
const { getAllRealms, getRealmSettings, getRealmUsers, getAllRealmAdmins, getRealmAdmins } = require('./libs/get-realms');
// const { ssoServiceNameMigration } = require('./libs/service-name-migration');
// const { deleteClientRole } = require('./libs/update-client-role');
const { KC_CONFIG, KC_TERMS } = require('./constants');

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

    // +++ Get all realms:
    // const allRealms = await getAllRealms(kcAdminClient);
    // allRealms.forEach((r) => {
    //   console.log(`ID: ${r.id}, Realm Name: ${r.displayName}`);
    // });

    // +++ Get all users:
    // const userCount = await allRealms.reduce(async (acc, r) => {
    //   const userInRealm = await acc;
    //   console.log(r.realm);

    //   const count = await getRealmUsers(kcAdminClient, r.realm);

    //   userInRealm.push({
    //     realm: r.realm,
    //     count,
    //   });
    //   return userInRealm;

    // }, Promise.resolve([]));

    // console.log(userCount);
    // const totalCount = userCount.reduce((acc, u) => acc + u.count, 0);
    // console.log(`Total users: ${totalCount} for ${realms.length} realms.`);
    // await fs.outputJson(`output/${process.env.KC_ENV}-users-${totalCount}-realm-${realms.length}.json`, userCount);

    // +++ Get realm admin users:
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
    throw Error(err);
  }
};
main();
