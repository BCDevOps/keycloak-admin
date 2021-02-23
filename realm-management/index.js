const kcAdmin = require('keycloak-admin').default;
const fs = require('fs-extra');

// const { importLdapUsers, createUsers } = require('./libs/import-users');
const { getAllRealms, getRealmSettings, getRealmUsers, getAllRealmAdmins, getRealmAdmins, getAllUsers } = require('./libs/get-realms');
// const { ssoServiceNameMigration } = require('./libs/service-name-migration');
// const { deleteClientRole } = require('./libs/update-client-role');
const { activeMonthlyUsersReport } = require('./libs/get-amu.js');
const { realmRolesReport } = require('./libs/realms-without-roles.js');

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
    // +++ Generate activeMonthlyUsersReport
    // const report = await activeMonthlyUsersReport(kcAdminClient);

    // +++ Investigate realms without custom roles
    await realmRolesReport(kcAdminClient);

  } catch (err) {
    throw Error(err);
  }
};
main();
