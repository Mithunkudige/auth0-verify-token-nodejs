const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
const cors = require('cors')
const authConfig = require("./auth_config.json");
const port = 3000;
const app = express();
app.use(cors({origin: 'http://localhost:8080'}));
 
console.log(authConfig.domain);
// Create the JWT validation middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});


app.get("/api/market", (req, res) => {
  console.log(req);
  
  const fleetData = [{
	fleetName: "Fleet UD",
	fleetIdentifier: "7C7D00B0C08647D5B6F0EF59083ECAD8"
  },{
	fleetName: "Fleet Isuzu",
	fleetIdentifier: "55628B8CE3AB42C3BF50B7223166894D"
  }];
  
  res.send(fleetData);
});

const checkScopes = jwtAuthz(["lvts.dashboard"], {
	customScopeKey: "permissions"
});


app.get("/api/auth", checkJwt, (req, res) => {
//app.get("/api/external", checkJwt, (req, res) => {
  console.log(req);
  
  res.send({
    msg: "Your access token was successfully validated!"
  });
});

// Create an endpoint that uses the above middleware to
// protect this route from unauthorized requests
app.get("/api/external", checkJwt, checkScopes, (req, res) => {
//app.get("/api/external", checkJwt, (req, res) => {
	console.log(req);
  res.send({
    msg: "Your access token and scope successfully validated!"
  });
});

/* const dns = require('dns');

dns.resolve("testdomain.com", 'ANY', (err, records) => {
  if (err) {
    console.log("Error: ", err);
  } else {
    console.log(records);
  }
}); */

// Error handler
app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }

  next(err, req, res);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})