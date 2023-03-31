# MuOnline Server on JavaScript
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[![Unit tests](https://github.com/pafa7a/mu-online-js/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/pafa7a/mu-online-js/actions/workflows/unit-tests.yml)

This project aims to create a full javascript based MuOnline server that can be used across all OS (Windows, Linux, Mac)

## How to use
This guide describes two ways of starting the server. Use Docker, if you just want to play around. If you want to develop or debug the server, choose the manual way.
### Using Docker
1. Install docker from https://docs.docker.com/engine/install/
2. Execute `docker-compose up -d` in the root directory of the repo

This will spin-up three docker containers - MySQL, ConnectServer and JoinServer.
MySQL will automatically create the database MuOnline and will create the required tables with sample data. All that is defined in .docker-files/mysql/init.sql.

You can access the database from your local machine as usual. The only thing that you need to know is that the MySQL port is forwarded to `3307`.

Example command to connect to the MySQL server inside the container:

`mysql -uroot -proot -h127.0.0.1 -P3307 muonline`

### Manually
1. Install Node.js >= v14 from here: https://nodejs.org/en/download
2. Install `yarn` following the guide here: https://classic.yarnpkg.com/en/docs/install
3. Install MySQL following the guide here: https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/
4. Navigate to ConnectServer directory using your terminal and execute `yarn install`
5. Then execute `yarn start`
6. Repeat steps 3 & 4 for the JoinServer as well 
7. Navigate to `libs/mu-db` and execute the following commands:
```bash
yarn install
yarn install-db
yarn install-dummy-data
```

If you want to start the servers in debug mode, use `yarn debug` instead


## Licensing
This project is released under the MIT license (see LICENSE file).

## How to contribute code
If you want to contribute code, please do the following steps:
1. Fork this project.
2. Create a feature branch from the master branch.
3. Commit your changes to your feature branch.
4. Submit a pull request to the original master branch.
5. Make sure that all unit tests are green.
6. Lean back, wait for the code review and merge.
