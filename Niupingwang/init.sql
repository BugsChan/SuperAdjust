

use Niupingwang;

db.users.insert(
	{
		"id": "PH", 
		"phonenum":"1616",
		"name":"YD", 
		"salt":"YD",
		"passwordhash":"YD",
		"icon":"CI"
	}
);

db.users.ensureIndex({"id": 1}, {"unique": true});
db.users.ensureIndex({"phonenum" : 1}, {"unique": true});

db.ensure.insert({
	"phonenum":"1616",
	"ensureid":"1616",
	"day": 21,
	"time": 5
});

db.ensure.ensureIndex({"phonenum": 1}, {"unique": true});

db.adjust.insert({
	"adjid":"PH",
	"pageIndex":"nixx.com/index.html",
	"header": null,
	"userid":"YD",
	"to":null, 
	"content":"xx", 
	"time":"xxxxx"
});

db.adjust.ensureIndex({"adjid": 1}, {"unique": true});
db.adjust.ensureIndex({"pageIndex": 1, "header": 1, "time": -1});
db.adjust.ensureIndex({"userid": 1});

db.like.insert({"userid": "PH", "adjid": "PH"});
