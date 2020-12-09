'use strict';

const fs = require('fs-extra');
const { IDP_REF, KC_CONFIG, KC_TERMS } = require('../constants');

/**
 * List all realms
 * @param {kcAdmin} kcAdminClient with auth setup
 */
const getAllRealms = async (kcAdminClient) => {  
  try {    
    // github example:
    const allRealms = await kcAdminClient.realms.find();
    return allRealms;

  } catch (e) {
    throw e;
  }
};

/**
 * Get admin users for each realm:
 * @param {kcAdmin} kcAdminClient with auth setup
 * 
 */
const getRealmAdmins = async (kcAdminClient) => {
  try {
    const realms = await getAllRealms(kcAdminClient);
  
    const allAdmins = await realms.reduce(async (acc, r) => {
      const group = await acc;
      const realmId = r.id;
      console.log(realmId);
  
      const allGroups = await kcAdminClient.groups.findOne({
        realm: realmId,
        name: KC_TERMS.ADMIN_GROUP_NAME,
      });
      
      let adminUsers = null;
      if (allGroups) {
        const adminGroupId = allGroups.map(g => {
          if (g.name === KC_TERMS.ADMIN_GROUP_NAME) return g.id;
        });
        adminUsers = await kcAdminClient.groups.listMembers({
          realm: realmId,
          id: adminGroupId,
        });
      }
      group[realmId] = adminUsers;
      return group;
    }, Promise.resolve({}));
  
    return allAdmins;
  } catch (e) {
    throw e;
  }
};


/**
 * Get details settings for a realm:
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} realmName target realm name
 * 
 * realm config:
 * - realm: login-settings, token, email, theme
 * - realm-roles
 * - realm-groups
 * 
 * Clients:
 * - mappers
 * - client roles
 * - auth flow overwrite
 * - service account
 * 
 * IDPs:
 * - idp-mappers
 * - auth flows
 */
const getRealmSettings = async (kcAdminClient, realmName = KC_CONFIG.REALM.NAME) => {
  try {
    //  realm:
    const outputPath = `./output/${realmName}`;

    const targetRealm = await kcAdminClient.realms.findOne({
      realm: realmName,
    });

    await fs.outputJson(`${outputPath}/realm.json`, targetRealm);

    // realm-groups
    const realmGroups = await kcAdminClient.groups.find();
    await fs.outputJson(`${outputPath}/groups.json`, realmGroups);

    realmGroups.forEach(async g => {
      const groupRoles = await kcAdminClient.groups.listRoleMappings({
        id: g.id,
      });
      const groupRealmRoles = await kcAdminClient.groups.listRealmRoleMappings({
        id: g.id,
      });
      await fs.outputJson(`${outputPath}/groupRole/${g.name}.json`, {
        groupRoles: groupRoles,
        groupRealmRoles: groupRealmRoles,
      });
    });

    // realm-roles
    const realmRoles = await kcAdminClient.roles.find();
    await fs.outputJson(`${outputPath}/roles.json`, realmRoles);
    // TODO: get composite role!

  } catch (e) {
    throw e;
  }
};

/**
 * Get details settings for a realm:
 * @param {kcAdmin} kcAdminClient with auth setup
 * @param {String} realmName target realm name
 */
const getRealmUsers = async (kcAdminClient, realmName = KC_CONFIG.REALM.NAME) => {
  try {

    kcAdminClient.setConfig({
      realmName,
    });

    const users = await kcAdminClient.users.find({
      max: 1000000,
    });
    // const userList = users.map(u => u.username);
    return users.length;

  } catch (e) {
    throw e;
  }
};

module.exports = { getAllRealms, getRealmAdmins, getRealmSettings, getRealmUsers };
