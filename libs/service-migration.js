'use strict';

const { KC_MIGRATION_ROUTES, IDP_REF, CLIENT_MIGRATION_FIELDS, KC_CONFIG } = require('../constants');

/**
 * Replace target string in json object and return the new object
 * @param {Object} jsonContent 
 * @param {String} targetString 
 * @param {String} replacement 
 */
const urlReplacer = (jsonContent, targetString, replacement) => {
  const replacer = new RegExp(targetString, 'g');
  const stringifiedContent = JSON.stringify(jsonContent);
  // if (!stringifiedContent.includes(targetString)) throw Error('No target string found!');
  return JSON.parse(stringifiedContent.replace(replacer, replacement));
}

/**
 * Migrate KC service to a new route
 * @param {kcAdmin} kcAdminClient with auth setup
 */
const migrateService = async (kcAdminClient) => {  
  try {    
    // github example:
    const targetRealm = KC_CONFIG.REALM.NAME;
    const targetIdp = IDP_REF.GITHUB;
    const idpRef = {
      alias: targetIdp.ALIAS,
      realm: targetRealm,
    };
    let idpClientRef = {
      clientId: `https://${KC_MIGRATION_ROUTES.OLD}/auth/realms/${targetRealm}`,
      realm: targetIdp.REALM,
    };

    // 1. get the current idp json content:
    const idp = await kcAdminClient.identityProviders.findOne(idpRef);

    // 2. replace the uri:
    const newIdp = urlReplacer(idp, KC_MIGRATION_ROUTES.OLD, KC_MIGRATION_ROUTES.NEW);

    // 3. update the idp:
    await kcAdminClient.identityProviders.update(idpRef, newIdp);

    // 4. get the IDP client:
    const idpClients = await kcAdminClient.clients.findOne(idpClientRef);
    if (idpClients.length !== 1) throw Error(`Not expected clients found #${idpClients.length}!`);
    const idpClient = idpClients[0];

    // 5. replace the uris:
    const newIdpClient = Object.keys(idpClient).reduce((acc, key) => {
      if (CLIENT_MIGRATION_FIELDS.includes(key)) {
        let value = idpClient[key];
        if (key === 'redirectUris') {
          if (value.length === 0) throw Error(`No redirect uri found!`);
          if (value.length !== 1) console.log(`Multiple redirect uris found: ${value}`);
          // keep both new and old redirect URIs so that team could migrate without breaking it:
          // value.push(value[0].replace(replacer, KC_MIGRATION_ROUTES.NEW));
          const newRedirectUri = `https://${KC_MIGRATION_ROUTES.NEW}/auth/realms/${targetRealm}/broker/${targetIdp.ALIAS}/endpoint*`;
          value.push(newRedirectUri);
        } else if (key === 'id') {
          idpClientRef[key] = value;
        } else {
          value = urlReplacer(value, KC_MIGRATION_ROUTES.OLD, KC_MIGRATION_ROUTES.NEW);
        }
        acc[key] = value;
      }
      return acc;
    }, {});

    // 6. update the idp client:
    await kcAdminClient.clients.update(idpClientRef, newIdpClient);

    // 7. after confirming changes are good, delete the extra redirect uri

  } catch (e) {
    throw e;
  }
}

module.exports = { migrateService };
