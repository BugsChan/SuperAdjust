

const DealAdjust = (req, res) => {
    let query = req.query;
    let type = query.atype;
    Apis[type](req, res);
};

const DBUtil = require("./DBUtil");

const Apis = {
    "upload": (req, res) => {
        //校验
        let body = req.body;

        if (!Utils.ensureUpload(body)) {
            res.send("Error do not have enough arguments");
            res.end();
            return 0;
        }
        DBUtil((db, client) => {
            let users = db.collection("users");
            users.find({ "id": body.userid }, { "_id": 0 }).toArray(
                (err, data) => {
                    if (err) {
                        res.send("Error Error password");
                        res.end();
                        client.close();
                    } else if (data.length > 0 && data[0].passwordhash == body.passwdhash) {
                        let adjusts = db.collection("adjust");
                        adjusts.insertOne(
                            {
                                "adjid": Utils.mkid(),
                                "pageIndex": body.pageIndex,
                                "header": null,
                                "userid": body.userid,
                                "to": body.to || null,
                                "content": body.content,
                                "time": new Date().getTime()
                            },
                            (err, data) => {
                                if (err) {
                                    res.send("Error Adjust failed");
                                } else {
                                    res.send("Ok");
                                }
                                res.end();
                                client.close();
                            }
                        )
                    } else {
                        res.send("Error Error password");
                        res.end();
                        client.close();
                    }
                }
            );
        });
    },
    "query": (req, res) => {
        /**
         * -input {"pageIndex", "from", "to"} //默认无header
         */
        let pageIndex = req.body.pageIndex;
        let from = req.body.from;
        let to = req.body.to;
        if (!from) {
            from = 0;
        }
        if (!to) {
            to = 0;
        }
        if (!pageIndex) {
            res.send("Error Do not have pageIndex, from or to");
            res.end();
            return;
        }

        DBUtil((db, client) => {
            let adjust = db.collection("adjust");
            adjust.aggregate([
                {
                    $match: { "pageIndex": pageIndex },
                },
                {
                    $project: {"_id": 0}
                },
                {
                    $sort: {"time": -1}
                },
                {
                    $skip: from
                },
                {
                    $limit: to
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userid",
                        foreignField: "id",
                        as: "userMsg"
                    }
                },
                {
                    $project: {
                        "userMsg._id": 0,
                        "userMsg.id": 0,
                        "userMsg.passwordhash": 0,
                        "userMsg.phonenum": 0
                    }
                },
                {
                    $lookup: {
                        from: "like",
                        localField: "adjid",
                        foreignField: "adjid",
                        as: "like"
                    }
                },
                //------------查询回复-----------
                {
                    $lookup: {
                        from: "adjust",
                        localField: "to",
                        foreignField: "adjid",
                        as: "replied",
                    }
                }
            ]).toArray((err, data) => {
                for (let i = 0; i < data.length; i++) {
                    data[i]['like'] = data[i]['like'].length;
                }
                if (err) {
                    res.send("Error Database Error");
                } else {
                    res.send(JSON.stringify(data));
                }
                res.end();
                client.close();
            });
        });
    },
    "like": (req, res) => {
        /**
         * uid, adjid
         */
        let uid = req.body.uid;
        let adjid = req.body.adjid;
        if (!uid || !adjid) {
            res.send("Error Do not have uid or adjid");
            res.end();
            return;
        }
        DBUtil((db, client) => {
            let like = db.collection("like");
            like.find({ userid: uid, adjid: adjid }).toArray((err, data) => {
                if (err || data.length != 0) {
                    res.send("Error Network error or just liked");
                    res.end();
                    client.close();
                } else {
                    like.insertOne(
                        { userid: uid, adjid: adjid },
                        (err) => {
                            if (!err) {
                                res.send("Ok");
                            } else {
                                res.send("Error Network error");
                            }
                            res.end();
                            client.close();
                        }
                    );
                }
            });
        });
    }
};

const Utils = {
    "mkid": () => {
        const seed = "abcdefghijklmnopqrstuvwxyxABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        let ans = "";
        for (let i = 0; i < 9; i++) {
            ans += seed.charAt(parseInt(Math.random() * seed.length));
        }
        return ans;
    },
    "ensureUpload": (query) => {
        const ensure = ["userid", "passwdhash", "pageIndex", "content"];
        for (let i = 0; i < ensure.length; i++) {
            if (!query[ensure[i]]) {
                return false;
            }
        }
        return true;
    }
};

module.exports = DealAdjust;