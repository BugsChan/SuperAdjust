
const DBConnect = require("./DBUtil.js");

/**
 * 这是注册新用户的方法
 * 路径为 /register
 * 必须带 phonenum, username, passwdhash, salt, icon, ensureid
 */

const EnsureQuery = (query) => {
    //验证
    const ensure = {
        "phonenum": (txt) => { return /^[0-9]+$/.test(txt); },
        "username": (txt) => { return txt.length < 30; },
        "passwdhash": (txt) => { return txt },
        "salt": (txt) => { return txt },
        "icon": (txt) => { return txt },
        "ensureid": (txt) => { return txt }
    };
    try {
        for (let key in ensure) {
            if (!ensure[key](query[key]))
                return false;
        }
    } catch (e) {
        return false;
    }
    
    return true;
};

const MkId = () => {
    const seed = "abcdefghijklmnopqrstuvwxyxABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let ans = "";
    for (let i = 0; i < 8; i++) {
        ans += seed.charAt(parseInt(Math.random() * seed.length));
    }
    return ans;
};

const Register = (req, res) => {
    let query = req.query;
    if (!EnsureQuery(query)) {
        res.send("Error keys");
        res.end();
        return;
    }

    DBConnect((db, client) => {
        //通过验证码对手机号进行验证
        let ensure = db.collection("ensure");
        ensure.find({ "phonenum": query.phonenum }, { ensureid: 1 }).toArray((err, data) => {
            if (err || data.ensureid != query.ensureid) {
                res.send("Error ensure id");
                res.end();
                client.close();
            } else {
                let users = db.collection("users");
                users.insertOne({
                    "id": MkId(), "name": query.username,
                    "phonenum": query.phonenum,
                    "salt": query.salt, "passwordhash": query.passwdhash,
                    "icon": query.icon
                },
                (err, data) => {
                    if (err) {
                        res.send("Error Failed to register");
                    } else {
                        res.send("Ok");
                    }
                    res.end();
                    client.close();
                });
            }
        });
    });
};


module.exports = Register;