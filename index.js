'use strict';

const kcAdmin = require('keycloak-admin').default;
const fs = require('fs-extra');

const { migrateService } = require('./libs/service-migration');
const { getRealmSettings } = require('./libs/realms');
const { getAllRealms, getRealmAdmins } = require('./libs/get-realms');
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

    // SSO service migration:
    // await migrateService(kcAdminClient);

    // Backup realm settings:
    // await getRealmSettings(kcAdminClient, KC_CONFIG.REALM.NAME);

    // Disable impersonation role:
    // await deleteClientRole(KC_TERMS.IMPERSONATION_ROLE, false);
    
  } catch (err) {
    if (err.response) console.error(err.response.statusText);
    else console.error(err);
  }
};


main();
