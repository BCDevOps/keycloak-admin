const dotenv = require('dotenv');

// setup KC env file
dotenv.config({ path: `.env-${process.env.KC_ENV}` });

const GH_AUTH = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_API: 'https://api.github.com/users/'
};

const KC_CONFIG = {
  REQUEST: {
    baseUrl: process.env.KEYCLOAK_URL,
    realmName: process.env.MASTER_REALM_NAME,
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

const KC_TERMS = {
  ADMIN_GROUP_NAME: 'Realm Administrator',
  ADMIN_CLIENT_NAME: 'realm-management',
  IMPERSONATION_ROLE: 'impersonation',
};

/**
 * The following constants will be to import LDAP users:
 */
const LDAP_CONFIG = {
  url: 'ldaps://idir.bcgov',
  base: 'DC=idir,DC=BCGOV',
  optionAttri: ['samAccountName', 'bcgovGUID'],
};

const LDAP_CRED = {
  username: process.env.LDAP_USER,
  password: process.env.LDAP_PASSWORD,
};

const LDAP_USERS_FILE_PATH = 'ldap-users.json';

/**
 * The following constants will be used during SSO Service Name Migration:
 */
// running mode:
const MODE = {
  EXECUTE_CHANGE: process.argv[2] === 'execute',
  ENV: process.env.KC_ENV,
};

// records tracking:
const OUTPUT_PATH = MODE.EXECUTE_CHANGE
  ? `./output/migration-result-${process.env.KC_ENV}`
  : `./output/verify-result-${process.env.KC_ENV}`;

// The service names:
const KC_MIGRATION_ROUTES = {
  NEW: process.env.NEW_KC,
  OLD: process.env.OLD_KC,
};

const CLIENT_MIGRATION_FIELDS = ['id', 'clientId', 'redirectUris'];
// Identity provider realms reference:
const IDP_REF = {
  GITHUB: {
    ALIAS: 'github',
    REALM: '_github',
  },
  IDIR: {
    ALIAS: 'idir',
    REALM: 'idir',
  },
  BCEID: {
    ALIAS: 'bceid',
    REALM: '_bceid',
  },
  // BCSC: {
  //   ALIAS: 'github',
  //   REALM: '_github',
  // },
};

// List of Identity provider realms reference:
const IDP_TERMS = [IDP_REF.GITHUB, IDP_REF.IDIR, IDP_REF.BCEID];

// List of different Identity provider mapper types:
const IDP_MAPPER_TYPES = ['saml-username-idp-mapper', 'saml-user-attribute-idp-mapper'];

// Identity provider configurations for siteminder services (consistent between IDIR and BCeID)
const SM_IDP_CONFIG = {
  validateSignature: 'true',
  samlXmlKeyNameTranformer: 'KEY_ID',
  signingCertificate: process.env.SM_CERT,
  postBindingLogout: 'true',
  postBindingResponse: 'true',
  backchannelSupported: 'false',
  forceAuthn: 'true',
  singleSignOnServiceUrl: process.env.SM_SSO_URL,
  singleLogoutServiceUrl: process.env.SM_SLO_URL,
};

// List of Identity provider mappers that needs to be updated:
const IDP_USER_ATTRI_MAPPERS = ['firstname', 'lastname', 'displayname'];

module.exports = {
  KC_MIGRATION_ROUTES,
  OUTPUT_PATH,
  LDAP_CONFIG,
  LDAP_CRED,
  LDAP_USERS_FILE_PATH,
  MODE,
  IDP_TERMS,
  IDP_REF,
  CLIENT_MIGRATION_FIELDS,
  GH_AUTH,
  KC_CONFIG,
  KC_TERMS,
  IDP_MAPPER_TYPES,
  IDP_USER_ATTRI_MAPPERS,
  SM_IDP_CONFIG,
};
