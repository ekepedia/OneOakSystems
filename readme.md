
Copyright (c) 2015 TopCoder, Inc. All rights reserved.


Readme File
@version 0.0.0
@author 571555

SET UP

Got to config file to config the app. It is located in /config/config.js
Set the following variables: 

```javascript
config.database = {
  name:           name of the database,
  password:       password for the user of the database,
  username:       username of the database,
  host:           host of the database server,
  port:           port for the database server,
  offsetDefault:  Offset default value,
  limitDefault:   limit default value,
  uri:            (optional) you may also give a uri or url to the database,
}
```

config.web = {
  host:            host of the web serve,
  port:            port for the web server,
  secret:          secret used in tokens,
  tokenExpiration: expiration of the token, IN SECONDS
}

node modules can we installed with the command: npm install
The following node modules were used: 

"async": "^1.5.0",
"bcrypt-nodejs": "0.0.3",
"body-parser": "^1.14.1",
"express": "~4.13.1",
"express-session": "^1.12.1",
"jsonwebtoken": "^5.4.1",
"mongoose": "^4.2.5",
"winston": "^2.1.0"

The node version I am using is:
v0.12.7


For the database sample data, navigate to /database/oneoaksystems, and run mongorestore on its content.

You may also add data for houseInfo, houses, houseStats, houseUsers, and users, by adding
data to the *.json files in /data and running the following /api/data/load routes

/load/users      -> to load users.json
/load/houses     -> to load houses.json
/load/houseInfos -> to load houseinfos.json
/load/houseStats -> to load housestats.json
/load/houseusers -> to load houseusers.json

To run the app, simply run "npm start"

CONDITIONS FOR TESTING

In the /postman folder, you will find the postman files for testing. The endpoints use
environmental variables for validation. Your enviorement must have the following variales
{{host}}  -> This is the full domain of the application
             If the endpoint was localhost:8080/api/me, then it will show up as {{host}}/api/me,
             where host = "localhost:8080"

{{token}} -> Token provided by /api/signin route. The expatriation is configurable in the 
             config file. Token can be passed through the following:
                req.body.token
                req.query.token
                req.headers['x-access-token']

The database contains 4 present users

"_id":     "56527c5bce2712b073b30001"
email":    "email1@email.com",
"password": "pass",
 
"_id":     "56527c5bce2712b073b30002"
"email":    "email2@email.com",
"password": "pass",
 
"_id":     "56527c5bce2712b073b30003"
"email":    "email3@email.com",
"password": "pass",
 
"_id":     "56527c5bce2712b073b30004"
"email":    "email4@email.com",
"password": "pass",

Each User is the admin of one house. You may use the POST /users method to create more users, 
and add roles to users for other houses. Note that because of validation, only the admin
can change roles

The 4 houses are

name":  "House 1",
"_id":   "56528c5bce2712b073b30001"

"name":  "House 2",
"_id":   "56528c5bce2712b073b30002"

"name":  "House 3"
"_id":   "56528c5bce2712b073b30003"

"name":  "House 4",
"_id":   "56528c5bce2712b073b30004"

I've provided the _ids so that you may use them in the endpoints. Currently, there
are only rooms for House 1, but I've generate two months of HOURLY room plot data for
room of _id: "5655378531b874616d6c6cfb" starting at Nov 25 2015.

I added the functionality to generate more room data from the current to a set amount of days.
Use the /data/load/generateRoomPlotData/:roomId/:days route to easily do so. 

Winston logging can be configured in the config file. 

API responses will be of the form: 
  {
    success: BOOLEAN -> (true or false) whether or not the operation was successful
    message: STRING, -> Any errors that may have been sent
    data: OBJECT     -> Anything returned will be under data
  }



