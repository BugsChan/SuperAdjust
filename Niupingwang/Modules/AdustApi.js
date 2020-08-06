

const DealAdjust = (req, res) => {
    let query = req.query;
    let type = query.atype;
    Apis[type](req, res);
};

const Apis = {
    "upload": (req, res) => {

    },
    "query": (req, res) => {
        /**
         * 返回的内容包括：
         * {}
         */
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
    }
};