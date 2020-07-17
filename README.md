# vot

A simple opinion poll or survey web app using MEVN stack.

![vot](./public/vot.png)

## Project setup
```bash
$ git clone https://github.com/vi88i/vot.git && cd vot
$ npm install
# Install mongoDB and redis, before executing the following commands
$ sudo systemctl start mongod 
$ sudo systemctl daemon-reload
$ redis-server
$ npm run serve # start vue app
$ cd vot-server && node users.js # start node.js server
```

## Sign-up and start creating polls. 
![vot](./public/5.png)
## Generate link for the poll and share it with voters
![vot](./public/7.png)
## Pollster can results in real-time
![vot](./public/8.png)