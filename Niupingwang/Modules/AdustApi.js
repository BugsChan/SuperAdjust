

const DealAdjust = (req, res) => {
    let query = req.query;
    let type = query.atype;
    Apis[type](req, res);
};

const DBUtil = require("./DBUtil");

const Apis = {
    "upload": (req, res) => {
        let body = req.body;
        if (!Utils.ensureUpload(body)) {
            res.send("Error do not have pageIndex, content or userid");
        }
        let uploadObj = Utils.ensureUpdateObj(body);
        DBUtil((db, client) => {
            let adjust = db.collection("adjust");
            adjust.insert(uploadObj, (err, data) => {
                if (err) {
                    res.send("Error do not adjust Ok.");
                } else {
                    res.send("Ok");
                }
                res.end();
                client.close();
            });
        });
    },
    "query": (req, res) => {
        /**
         * -input {"pageIndex", "from", "to"} //Ä¬ÈÏÎÞheader
         * -input {"userid"}
         * -input {"header"}
         */
        let body = req.body;
        let matchObj = {};
        if (body.pageIndex) {
            matchObj.pageIndex = body.pageIndex;
            matchObj.header = null;
        } else if (body.userid) {
            matchObj.userid = body.userid;
        } else if (body.header) {
            matchObj.userid = body.header;
        } else {
            res.send("Error do not have right request body");
            res.end();
            return;
        }

        DBUtil((db, client) => {
            let adjust = db.collection("adjust");
            adjust.aggregate([
                { $match: matchObj}
            ]);
        });
    },
    "like": (req, res) => {

    },
    "unlike": (req, res) => {

    },
    "delete": (req, res) => {

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
    "ensureUpload": (uploadJson) => {
        const ensured = ['pageIndex', "userid", "content"];
        for (let each in ensured) {
            if (!uploadJson[each]) {
                return false;
            }
        }
        return true;
    },
    "ensureUpdateObj": (uploadJson) => {
        const ensured = ["pageIndex", "header", "userid", "to", "content"];
        ans = {};
        for (let each in ensured) {
            ans[each] = (!uploadJson[each]) ? null : uploadJson[each];
        }
        return ans;
    }
};

module.exports = DealAdjust;