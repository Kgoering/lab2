var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', function(req, res){
    res.status(200);
    res.sendFile(__dirname + "/index.html");

    var value = Math.floor((Math.random() * 1000000000) + 1);
    res.cookie("sessionID", value);
    createUser(value);
  
});

app.get('/:id', function(req, res){
    var user = findUser(req.cookies.sessionID);
    if(user == null)
    {
        res.status(404);
        res.send("session not found");
        return;
    }
    if (req.params.id == "inventory") {
        res.set({'Content-Type': 'application/json'});
        res.status(200);
        res.send(user.inventory);
        return;
    }
    for (var i in campus) {
        if (req.params.id == campus[i].id) {
            user.local = req.params.id;
            res.set({'Content-Type': 'application/json'});
            res.status(200);
            //campus[i].text+= req.cookies.sessionID;
            res.send(campus[i]);
            return;
        }
    }
    res.status(404);
    res.send("not found, sorry");
});

app.get('/images/:name', function(req, res){
    res.status(200);
    res.sendFile(__dirname + "/" + req.params.name);
});

app.delete('/:id/:item', function(req, res){
    var user = findUser(req.cookies.sessionID);
    if(user == null)
    {
        res.status(404);
        res.send("session not found");
        return;
    }
    for (var i in campus) {
        if (req.params.id == campus[i].id && req.params.id == user.local) {
            res.set({'Content-Type': 'application/json'});
            var ix = -1;
            if (campus[i].what != undefined) {
                ix = campus[i].what.indexOf(req.params.item);
            }
            if (ix >= 0) {
                res.status(200);
                user.inventory.push(campus[i].what[ix]); // stash
                res.send(user.inventory);
                campus[i].what.splice(ix, 1); // room no longer has this
                return;
            }
            res.status(200);
            res.send([]);
            return;
        }
    }
    res.status(404);
    res.send("location not found");
});

app.put('/:id/:item', function(req, res){
    var user = findUser(req.cookies.sessionID);
    if(user == null)
    {
        res.status(404);
        res.send("session not found");
        return;
    }
    for (var i in campus) {
        if (req.params.id == campus[i].id && req.params.id == user.local) {
            // Check you have this
            var ix = user.inventory.indexOf(req.params.item)
            if (ix >= 0) {
                dropbox(user, ix,campus[i]);
                res.set({'Content-Type': 'application/json'});
                res.status(200);
                res.send([]);
            } else {
                res.status(404);
                res.send("you do not have this");
            }
            return;
        }
    }
    res.status(404);
    res.send("location not found");
});

app.listen(3000);

var dropbox = function(user, ix,room) {
    var item = user.inventory[ix];
    user.inventory.splice(ix, 1);	 // remove from inventory
    if (room.id == 'allen-fieldhouse' && item == "basketball") {
        room.text	+= " Someone found the ball so there is a game going on!"
        return;
    }
    if (room.what == undefined) {
        room.what = [];
    }
    room.what.push(item);
}

// Creates new user
function createUser(sesID) {
    var user = { "session": sesID, "inventory" : ["laptop"], "local" : "strong-hall"};
    users.push(user);
}

// Find and return user
function findUser(sesID) {
    if(sesID == undefined)
        return null;
    for(var i = 0; i < users.length; i++) {
        if(sesID == users[i].session) {
            return users[i];
        }
    }
    return null;
}

var users = [];

var campus =
    [ { "id": "lied-center",
        "where": "LiedCenter.jpg",
        "next": {"east": "eaton-hall", "south": "dole-institute"},
        "text": "You are outside the Lied Center."
    },
        { "id": "dole-institute",
            "where": "DoleInstituteofPolitics.jpg",
            "next": {"east": "allen-fieldhouse", "north": "lied-center"},
            "text": "You take in the view of the Dole Institute of Politics. This is the best part of your walk to Nichols Hall."
        },
        { "id": "eaton-hall",
            "where": "EatonHall.jpg",
            "next": {"east": "snow-hall", "south": "allen-fieldhouse", "west": "lied-center"},
            "text": "You are outside Eaton Hall. You should recognize here."
        },
        { "id": "snow-hall",
            "where": "SnowHall.jpg",
            "next": {"east": "strong-hall", "south": "ambler-recreation", "west": "eaton-hall"},
            "text": "You are outside Snow Hall. Math class? Waiting for the bus?"
        },
        { "id": "strong-hall",
            "where": "StrongHall.jpg",
            "next": {"east": "outside-fraser", "north": "memorial-stadium", "west": "snow-hall"},
            "what": ["coffee"],
            "text": "You are outside Stong Hall."
        },
        { "id": "ambler-recreation",
            "where": "AmblerRecreation.jpg",
            "next": {"west": "allen-fieldhouse", "north": "snow-hall"},
            "text": "It's the starting of the semester, and you feel motivated to be at the Gym. Let's see about that in 3 weeks."
        },
        { "id": "outside-fraser",
            "where": "OutsideFraserHall.jpg",
            "next": {"west": "strong-hall","north":"spencer-museum"},
            "what": ["basketball"],
            "text": "On your walk to the Kansas Union, you wish you had class outside."
        },
        { "id": "spencer-museum",
            "where": "SpencerMuseum.jpg",
            "next": {"south": "outside-fraser","west":"memorial-stadium"},
            "what": ["art"],
            "text": "You are at the Spencer Museum of Art."
        },
        { "id": "memorial-stadium",
            "where": "MemorialStadium.jpg",
            "next": {"south": "strong-hall","east":"spencer-museum"},
            "what": ["ku flag"],
            "text": "Half the crowd is wearing KU Basketball gear at the football game."
        },
        { "id": "allen-fieldhouse",
            "where": "AllenFieldhouse.jpg",
            "next": {"north": "eaton-hall","east": "ambler-recreation","west": "dole-institute"},
            "text": "Rock Chalk! You're at the field house."
        }
    ]
