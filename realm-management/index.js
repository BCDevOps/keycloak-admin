const kcAdmin = require('keycloak-admin').default;

// const { getRealmSettings } = require('./libs/get-realms');
// const { ssoServiceNameMigration } = require('./libs/service-name-migration');
// const { deleteClientRole } = require('./libs/update-client-role');
const { KC_CONFIG, KC_TERMS } = require('./constants');

const main = async () => {
  try {
    // setup kc admin instance:
    const kcAdminClient = new kcAdmin(KC_CONFIG.REQUEST);
    await kcAdminClient.auth(KC_CONFIG.AUTH);

    // Override client configuration for all further requests:
    // kcAdminClient.setConfig({
    //   realmName: KC_CONFIG.REALM.NAME,
    // });

    // SSO Service Name Migration
    // await ssoServiceNameMigration(kcAdminClient);

    // Backup realm settings:
    // await getRealmSettings(kcAdminClient, KC_CONFIG.REALM.NAME);

    // Disable impersonation role:
    // await deleteClientRole(KC_TERMS.IMPERSONATION_ROLE, false);
  } catch (err) {
    throw Error(err);
  }
};
main();
