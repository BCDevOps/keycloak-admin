var readlineSync = require('readline-sync');
var fs = require('fs');

var keycloakAuth = require('./kc-auth');
var kcUsers = require('./kc-users');

const USERS_FILE_PATH = './users.json';

main();

async function main() {
  var env = readlineSync.question('What env would you like to create the users in (dev,test,prod)? ');
  // var env = 'dev';
  var realm = readlineSync.question('What realm would you like to create the users in? ');
  // var realm = 'zdw7o87p';
  var clientId = readlineSync.question('What is the client id for roles being added? ');
  // var clientId = '1965f883-ded9-4762-8cad-d16ebd6103d7';

  /* Read users.json file */
  let users = JSON.parse(fs.readFileSync(USERS_FILE_PATH, { encoding: 'utf-8' }, function (err) {
    console.error(err);
    process.exit();
  }));
  
  var accessToken = await keycloakAuth(env, realm);

  var newUsers = await kcUsers.createUsers(users, accessToken, env, realm, clientId);

  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(newUsers, null, 4), (err) => {
    if (err) {
      console.log(err);
    }
  });
}


