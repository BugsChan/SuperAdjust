const MongoClient = require("mongodb").MongoClient;
const conf = require("../Conf.js");



/**
 * @param {Function} callBack
 *  - db 数据库
 *  - client 最后要关好
 */
const Connect = (callBack) => {
    const client = new MongoClient(conf().database.url);
    client.connect((err) => {
        let db = client.db(conf().database.dbName);
        callBack(db, client);
    });
};

module.exports = Connect;