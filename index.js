'use strict';

const kcAdmin = require('keycloak-admin').default;
const { migrateService } = require('./libs/service-migration');
const { KC_CONFIG } = require('./constants');


const main = async () => {
  try {
    // setup kc admin instance:
    const kcAdminClient = new kcAdmin(KC_CONFIG.REQUEST);
    await kcAdminClient.auth(KC_CONFIG.AUTH);
    // Override client configuration for all further requests:
    // kcAdminClient.setConfig({
    //   realmName: KC_CONFIG.REALM.NAME,
    // });

    await migrateService(kcAdminClient);
  } catch (err) {
    if (err.response) console.error(err.response.statusText);
    else console.error(err);
  }
};


main();
