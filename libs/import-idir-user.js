var ldap = require('ldapjs');
const fs = require('fs');
const path = require('path');


var client = ldap.createClient({
  url: 'ldaps://idir.bcgov',
  tlsOptions:{rejectUnauthorized: false}
});

client.bind(process.env.LDAP_USERNAME, process.env.LDAP_PASSWORD, {encoding:'utf-8'}), function(err) {
  var opts = {
    filter: 'samAccountNAme=cvarjao',
    scope: 'sub',
    attributes: ['samAccountName', 'bcgovGUID']
  };
  client.search('DC=idir,DC=BCGOV', opts, function(err, res) {
    res.on('searchEntry', function(entry) {
      console.log('entry: ' + JSON.stringify(entry.object));
    });
    res.on('end', function(result) {
      client.unbind(function(err) {
        console.log('Bye!');
      })
    });
  })
});



