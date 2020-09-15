'use strict';

const { IDP_REF, CLIENT_MIGRATION_FIELDS, IDP_MAPPER_TYPES, IDP_USER_ATTRI_MAPPERS } = require('../constants');

/**
 * Replace target string in json object and return the new object
 * @param {Object} jsonContent the content to be updated
 * @param {String} targetString target string to look for to be replaced
 * @param {String} replacement new string
 * @param {Boolean} matchRequired only replace if content is matching targetString
 */
const urlReplacer = (jsonContent, targetString, replacement) => {
  const replacer = new RegExp(targetString, 'g');
  const stringifiedContent = JSON.stringify(jsonContent);
  if (!stringifiedContent.includes(targetString)) console.warn(`----No target string found from - ${jsonContent}`);
  return JSON.parse(stringifiedContent.replace(replacer, replacement));
}


/**
 * Update APP realm IDP configuration
 * @param {String} appRealmName the APP realm's name
 * @param {String} idp the IDP name
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} newRoute new sso host name
 * @param {String} oldRoute current sso host name
 */
const updateAppRealmIdp = async (appRealmName, idp, kcAdminClient, newRoute, oldRoute) => {  
  try {    
    // Set target IDP and realm name:
    const targetRealm = appRealmName;
    const targetIdp = IDP_REF[idp.toUpperCase()];

    // Find IDP based on realm name and IDP alias:
    const idpRef = {
      alias: targetIdp.ALIAS,
      realm: targetRealm,
    };

    // 1. get the current idp json content:
    const idpConfig = await kcAdminClient.identityProviders.findOne(idpRef);

    // 2. replace the uri:
    const newIdp = urlReplacer(idpConfig, oldRoute, newRoute);

    // 3. update the idp:
    console.log(newIdp);
    // await kcAdminClient.identityProviders.update(idpRef, newIdp);

  } catch (e) {
    throw e;
  }
}

/**
 * Update IDP realm clients
 * @param {String} appRealmName the APP realm's name
 * @param {String} idp the IDP name
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} newRoute new sso host name
 * @param {String} oldRoute current sso host name
 */
const updateIdpAppClient = async (clientId, idp, kcAdminClient, newRoute, oldRoute) => {  
  try {
    // Set target IDP alias name:
    const targetIdp = IDP_REF[idp.toUpperCase()];

    // client ID format: https://${SSO_ROUTE}/auth/realms/${APP_REALM}
    let idpClientRef = {
      clientId,
      realm: targetIdp.REALM,
    };

    // 1. get the IDP client:
    const idpClients = await kcAdminClient.clients.findOne(idpClientRef);
    if (idpClients.length !== 1) throw Error(`----Not expected clients found #${idpClients.length}!`);
    const idpClient = idpClients[0];

    // 2. replace the uris:
    const newIdpClient = Object.keys(idpClient).reduce((acc, key) => {
      if (CLIENT_MIGRATION_FIELDS.includes(key)) {
        let value = idpClient[key];
        if (key === 'redirectUris') {
          if (value.length === 0) throw Error(`----No redirect uri found!`);
          if (value.length !== 1) console.log(`----Multiple redirect uris found: ${value}`);

          // 2.2 keep both new and old redirect URIs so that team could migrate without breaking it:
          const newIdpClientId = urlReplacer(clientId, oldRoute, newRoute);
          const newRedirectUri = `${newIdpClientId}/broker/${targetIdp.ALIAS}/endpoint*`;
          if (!value.includes(newRedirectUri)) value.push(newRedirectUri);
        } else if (key === 'id') {
          idpClientRef[key] = value;
        } else {
          value = urlReplacer(value, oldRoute, newRoute);
        }
        acc[key] = value;
      }
      return acc;
    }, {});

    // 3. update the idp client:
    console.log(newIdpClient);
    // await kcAdminClient.clients.update(idpClientRef, newIdpClient);

    // 4. TODO - after confirming changes are good, delete the extra redirect uri from step 2.2

  } catch (e) {
    throw e;
  }
}

/**
 * Update Agent IDP Mapper Configurations to use new Federation Services
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {Object} mapperContent the old mapper config
 * @param {Object} mapperRef the old mapper reference
 */
const updateAgentIdpMappers = async (kcAdminClient, mapperContent, mapperRef) => {
  let newMapperContent = mapperContent;

  // Mappers changed from the new federation services - all attributes are now lower case:
  const newMapperFormat = {
    config: { template: '${ATTRIBUTE.username}' },
  };

  if (mapperContent.identityProviderMapper == IDP_MAPPER_TYPES[0]) {
    // 1. username mapper:
    newMapperContent.config = newMapperFormat.config;
    console.log(newMapperContent.config);
    // await kcAdminClient.identityProviders.updateMapper(mapperRef, newMapperContent);

  } else if (mapperContent.identityProviderMapper == IDP_MAPPER_TYPES[1]) {
    // 2. user attribute mapper:
    // only update the user attribute mappers changed from new services
    const mapperAttri = mapperContent.config['user.attribute'];
    const mapperAttriName = mapperContent.config['attribute.name'];

    if (IDP_USER_ATTRI_MAPPERS.includes(mapperAttri.toLowerCase())) {
      newMapperContent.config['attribute.name'] = mapperAttriName.toLowerCase();
      console.log(newMapperContent.config);
      // await kcAdminClient.identityProviders.updateMapper(mapperRef, newMapperContent);
    }
  } else {
    // 3. Don't care
  }
}

module.exports = { urlReplacer, updateIdpAppClient, updateAppRealmIdp, updateAgentIdpMappers };
