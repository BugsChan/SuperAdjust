
const DBUtil = require("./DBUtil.js");

const Login = (req, res) => {
    let findObj = {};
    if (req.query.phonenum) {
        findObj.phonenum = req.query.phonenum;
    } else if (req.query.id) {
        findObj.id = req.query.id;
    } else {
        res.send("Error Wrong keys");
        res.end();
        return;
    }
    if (!req.query.passwdhash) {
        res.send("Error Wrong keys");
        res.end();
        return;
    }

    DBUtil((db, client) => {
        let users = db.collection("users");
        let ensure = db.collection("ensure");

        users.aggregate([
            { $match: findObj },
            { $project: { _id: 0 } },
            {
                $lookup: {
                    from: "ensure",
                    localField: "phonenum",
                    foreignField: "phonenum",
                    as: "ensure"
                }
            },
            { $unwind: "$ensure" }
        ]).toArray((err, data) => {
            if (!err && data.length < 1) {
                res.send("Error User dose not exit");
            } else if (data[0].ensure.day != new Date().getDate()) {
                ensure.updateOne(
                    findObj,
                    { $set: { "day": new Date().getDate(), "time": 0 } },
                    (err, info) => {
                        if (err || info.result.n == 0) {
                            res.send("Error Network error");
                            res.end();
                            client.close();
                        } else {
                            client.close();
                            Login(req, res);
                        }
                    }
                );
            } else if (data[0].passwordhash == req.query.passwdhash
                && data[0].ensure.time < 150) {
                res.send("Ok");
                res.end();
                client.close();
            } else {
                console.log(data);
                res.send("Error Error password");
                ensure.updateOne(
                    { phonenum: data[0].phonenum },
                    { $set: { time: data[0].ensure.time + 1 } },
                    (err, stat) => {
                        res.end();
                        client.close();
                    }
                );
            }
        });

    });
};

module.exports = Login;