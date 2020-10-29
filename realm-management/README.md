## NodeJs based Keycloak admin actions:
For better flexibility, we are using NodeJs based app to manage operational tasks.

### Setup:
Copy .env to different KC environments, such as `.env-test`. Fill in the env vars required in the .env file.

### Run:
```shell
# install dependencies:
npm install

# update index.js for actions needed

# to run in dev environment:
npm run kc-dev
```
