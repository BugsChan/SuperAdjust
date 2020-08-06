
const fs = require("fs");
const confPath = "config.json";
let confData = null;
fs.readFile(confPath, (err, data) => {
    if (err) {
        throw "Can't find config.json ";
    }
    console.log("Find config.json");
    confData = JSON.parse(data);
});

const Conf = () => {
    return confData;
};

module.exports = Conf;