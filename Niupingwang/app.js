'use strict';

const express = require('express');
const app = express();

app.use("/", express.static("websource"));

const register = require("./Modules/register.js");
app.get("/register", register);

const login = require("./Modules/Login");
app.get("/login", login);

const api = require("./Modules/api.js");
app.get("/api", api);

const adjustapi = require("./Modules/AdustApi");
const jsonParser = require("body-parser").json();
app.post("/api/adjust", jsonParser, adjustapi);

app.listen(80);