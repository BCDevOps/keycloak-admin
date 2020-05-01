'use strict';

const dotenv = require('dotenv');

// setup KC env file
dotenv.config({ path: `.env-${process.env.KC_ENV}` });

const KC_CONFIG = {
  REQUEST: {
    baseUrl: process.env.KEYCLOAK_URL,
    realmName: process.env.MASTER_REALM_NAME,
    requestConfig: {
      /* Axios request config options https://github.com/axios/axios#request-config */
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    },
  },
  AUTH: {
      username: process.env.KEYCLOAK_ADMIN_USER_ID,
      password: process.env.KEYCLOAK_ADMIN_USER_PASSWORD,
      grantType: process.env.KEYCLOAK_GRANT_TYPE,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      totp: process.env.OTP_CODE,
  },
  REALM: {
    NAME: process.env.REALM_NAME,
  },
};

// Identity provider realms reference:
const IDP_REF = {
  GITHUB: {
    ALIAS: 'github',
    REALM: '_github',
  },
  IDIR: {
    ALIAS: 'github',
    REALM: '_github',
  },
  BCEID: {
    ALIAS: 'github',
    REALM: '_github',
  },
  BCSC: {
    ALIAS: 'github',
    REALM: '_github',
  },
};

const KC_TERMS = {
  ADMIN_GROUP_NAME: 'Realm Administrator',
  ADMIN_CLIENT_NAME: 'realm-management',
  IMPERSONATION_ROLE: 'impersonation',
};

/**
 * The following constants will be used during service migration:
 */
const KC_MIGRATION_ROUTES = {
  NEW: process.env.NEW_KC,
  OLD: process.env.OLD_KC,
};

const CLIENT_MIGRATION_FIELDS = ['id', 'clientId', 'redirectUris'];

module.exports = { KC_MIGRATION_ROUTES, IDP_REF, CLIENT_MIGRATION_FIELDS, KC_CONFIG, KC_TERMS };
