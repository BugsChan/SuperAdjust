
/**
 * 用于查询和更改信息
 * atype 类型,带在链接里面:
 *  - ensureId 获取验证码
 *  - getUserMsg 获取用户信息
 *  - getSalt 获取盐
 *  - ensurePasswd 确认密码
 *  - changePasswd 更改密码
 *  - changeUserMsg 更改用户信息 (必须带密码hash)
 */

const DealApi = (req, res) => {
    let query = req.query;
    let type = query.atype;
    Apis[type](req, res);
};

const DBUtil = require("./DBUtil.js");
const SendMsg = require("./SendMsg.js");
const Conf = require("../Conf.js")

const Apis = {
    //获取验证码
    "ensureId": (req, res) => {
        let phonenum = req.query.phonenum;
        let ensureid = "" + parseInt(Math.random() * 1000000);
        while (ensureid.length < 6) {
            ensureid += '0';
        }
        if (!phonenum || !SendMsg(phonenum, ensureid)) {
            res.send("Error ensureId: Phone number error");
            res.end();
            return;
        }
        DBUtil((db, client) => {
            let ensure = db.collection("ensure");

            ensure.updateOne(
                { "phonenum": phonenum },
                { $set: { "ensureid": ensureid, "day": new Date().getDate(), "time": 0 } },
                (err, data) => {
                    if (err) {
                        res.send("Error Can not connect to database");
                        res.end();
                        client.close();
                    }else if (data.result.n == 0) {
                        ensure.insertOne(
                            { "phonenum": phonenum, "ensureid": ensureid, "day": new Date().getDate(), "time": 0 },
                            (err, data) => {
                                if (err) {
                                    res.send("Error ensureId: Faild to save into database");
                                } else {
                                    res.send("Ok");
                                }
                                res.end();
                                client.close();
                            }
                        );
                    } else {
                        res.send("Ok");
                        res.end();
                        client.close();
                    }
                }
            );
        });
    },

    "ensureEnsureId": (req, res) => {
        let phonenum = req.query.phonenum;
        let ensureid = req.query.ensureid;
        if (!phonenum || !ensureid) {
            res.send("Error Link error");
            res.end();
            return;
        }
        DBUtil((db, client) => {
            let ensure = db.collection("ensure");
            ensure.find({ "phonenum": phonenum }, { _id: 0, ensureid: 1, day: 1, time: 1 }).toArray(
                (err, data) => {
                    if (err || data.length == 0) {
                        res.send("no");
                    } else if (data[0].time > 150) {
                        res.send("no");
                    }else if (data[0].ensureid == ensureid) {
                        res.send("yes");
                    } else {
                        res.send("no");
                    }
                    res.end();
                    ensure.updateOne(
                        { "phonenum": phonenum },
                        { $set: { "time": data[0].time + 1 } },
                        (err, _data) => {
                            client.close();
                        }
                    );
                }
            );
        });
    },

    "ensureUser": (req, res) => {
        let queryObj = Utils.ensureQueryObj(req.query);
        if (!queryObj) {
            res.send("Error Do not have phonenum or id");
            res.end();
            return;
        }
        DBUtil((db, client) => {
            let users = db.collection("users");
            users.find(queryObj, { _id: 0, salt: 0, passwordhash: 0 }).toArray(
                (err, data) => {
                    if (err) {
                        res.send("no");
                    } else if (data.length == 0) {
                        res.send("no");
                    } else {
                        res.send("yes");
                    }
                    res.end();
                    client.close();
                }
            );
        });
    },

    "getUserMsg": (req, res) => {
        let queryObj = Utils.ensureQueryObj(req.query);
        if (!queryObj) {
            res.send("Error Do not have phonenum or id");
            res.end();
            return;
        }
        DBUtil((db, client) => {
            let users = db.collection("users");
            users.find(queryObj, { "_id": 0, salt: 0, passwordhash: 0}).toArray(
                (err, data) => {
                    if (err || data.length == 0) {
                        res.send("Error User dose not exit");
                    } else {
                        data.icon = Conf().icon.baseUrl + data.icon;
                        res.send(JSON.stringify(data[0]));
                    }
                    res.end();
                    client.close();
                }
            );
        });
    },

    "getSalt": (req, res) => {
        let queryObj = Utils.ensureQueryObj(req.query);
        if (!queryObj) {
            res.send("Error Do not have phonenum or id");
            res.end();
            return;
        }
        DBUtil((db, client) => {
            let users = db.collection("users");
            users.find(queryObj, { "_id": 0, salt: 1 }).toArray(
                (err, data) => {
                    if (err || data.length == 0) {
                        res.send("Error User dose not exit");
                    } else {
                        res.send("Ok:" + data[0].salt);
                    }
                    res.end();
                    client.close();
                }
            );
        });
    },

    "ensurePasswd": (req, res) => {
        let queryObj = Utils.ensureQueryObj(req.query);
        let hash = req.query.hash;
        if (!queryObj || !hash) {
            res.send("Error Do not have phonenum , id or hash");
            res.end();
            return;
        }
        Utils.ensurePasswd(queryObj, hash, (stat) => {
            res.send(stat);
            res.end();
        });
    },
    
    "changePasswd": (req, res) => {
        //必须带ensureid
        let phonenum = req.query.phonenum;
        let ensureid = req.query.ensureid;
        let salt = req.query.salt;
        let hash = req.query.hash;
        if (!phonenum || !ensureid || !salt || !hash) {
            res.send("Error Do not have id, phonenum, ensureid, salt or hash");
            res.end();
            return;
        }

        DBUtil((db, client) => {
            let ensure = db.collection("ensure");
            ensure.find({ "phonenum": phonenum }).toArray((err, data) => {
                if (err || data[0].ensureid != ensureid) {
                    res.send("Error Ensureid error");
                    res.end();
                    client.close();
                } else {
                    let users = db.collection("users");
                    users.updateOne(
                        { "phonenum": phonenum },
                        { $set: { "salt": salt, "passwordhash": hash } },
                        (err, data) => {
                            if (err) {
                                res.send("Error something wrong with the server");
                            } else {
                                res.send("Ok");
                            }
                            res.end();
                            client.close();
                        }
                    );
                }
            });
        });
    },

    "changeUserMsg": (req, res) => {
        let queryObj = Utils.ensureQueryObj(req.query);
        let hash = req.query.hash;
        if (!queryObj || !hash) {
            res.send("Error Do not have phonenum ,id or hash");
            res.end();
            return;
        }
        Utils.ensurePasswd(queryObj, hash, (stat) => {
            if (stat != "Ok") {
                res.send(stat);
                res.end();
            } else {
                let icon = req.query.icon;
                let name = req.query.name;
                let changeObj = {};
                if (icon) {
                    changeObj.icon = icon;
                }
                if (name) {
                    changeObj.name = name;
                }
                DBUtil((db, client) => {
                    let users = db.collection("users");
                    users.updateOne(queryObj, { $set: changeObj }, (err, data) => {
                        if (err) {
                            res.send("Error Change failed");
                        } else {
                            res.send("Ok");
                        }
                        res.end();
                        client.close();
                    });
                });
            }
        });
    }
};

const Utils = {
    "ensureQueryObj": (query) => {
        let phonenum = query.phonenum;
        let id = query.id;
        let queryObj = {};
        if (phonenum) {
            queryObj.phonenum = phonenum;
        } else if (id) {
            queryObj.id = id;
        } else {
            return null;
        }
        return queryObj;
    }, 
    "ensurePasswd": (queryObj, hash, callback) => {
        DBUtil((db, client) => {
            let users = db.collection("users");
            users.find(queryObj, { "_id": 0, passwordhash: 1 }).toArray(
                (err, data) => {
                    if (err) {
                        callback("Error User dose not exit");
                    } else if (data.length > 0 && data[0].passwordhash == hash) {
                        callback("Ok");
                    } else {
                        callback("Error Password");
                    }
                    client.close();
                }
            );
        });
    }
};


module.exports = DealApi;