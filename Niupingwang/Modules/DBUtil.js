const MongoClient = require("mongodb").MongoClient;
const conf = require("../Conf.js");



/**
 * @param {Function} callBack
 *  - db ���ݿ�
 *  - client ���Ҫ�غ�
 */
const Connect = (callBack) => {
    const client = new MongoClient(conf().database.url);
    client.connect((err) => {
        let db = client.db(conf().database.dbName);
        callBack(db, client);
    });
};

module.exports = Connect;