/* -- Imports -- */
var Botkit = require('botkit');
var User = require('./user');

/* -- Globals -- */
var channels = [];
var people = [];

var controller = Botkit.slackbot({
	debug: false
});

var config = {
	token: '',
	channel: '',
	websocket: {
		whitelist: true, 				//Remember to change this!
		allowedPrefix: "127.0.0.1"
	},
	reactToRelayedMessages: true,
	reactionEmoji: 'mailbox_with_mail' 	//Use Slack emoji names
}

var slack = controller.spawn({
	token: config.token
}).startRTM(function(err, bot, payload) {
    slack.api.users.list({}, function (err, response) {
        if(response.hasOwnProperty('members') && response.ok) {
            var total = response.members.length;
            for (var i = 0; i < total; i++) {
                var member = response.members[i];
                people.push(member);
            }
        }
    });

    slack.api.channels.list({}, function (err, response) {
        if(response.hasOwnProperty('channels') && response.ok) {
            var total = response.channels.length;
            for (var i = 0; i < total; i++) {
                var channel = response.channels[i];
                channels.push(channel);
            }
        }
    });
});

/* -- Start the Slackbot and log in -- */
//Set up callbacks for messages.

/*
 *	Checks all messages to see if they should be relayed
 *		to a client. If they are relayed to a client,
 *		the bot will react to the relayed message on Slack.
 *	Reactions are added so that users will see if they 
 *		wrote the wrong name, the bot is offline or the client is.
 **/
controller.on('ambient', function(bot, message) {
	if(message.type == 'message') {
		for (var i = 0; i < users.length; i++) {
			var user = users[i];
			var name = user.name;
			
			if(message.text.startsWith('~'+name+': ')) {
				user.sendMessage(message.text.substring(name.length+3, message.text.length), userNameForID(message.user));
				
				if(config.reactToRelayedMessages)
					slack.api.reactions.add({name: config.reactionEmoji, timestamp: message.ts, channel: message.channel});
			}
		}
	}
});

function sendMessage(message) {
	slack.say({
		text: message,
		channel: channelIDForName(config.channel)
	});
}

/* -- WebSocket server for interacting with clients -- */

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

var users = [];

/*
 * 	Checks if connecting address is from
 * 		within allowed.
 */ 
function hostIsAllowed(host) {
	if(config.websocket.whitelist)
		return host.startsWith(config.websocket.allowedPrefix) ? true : false;
	return true;
}

wsServer.on('request', function(request) {
    if(!hostIsAllowed(request.host)) {
      // Make sure we only accept requests from an allowed host
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.host + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    
    var aUser = new User(connection, sendMessage);
    
	users.push(aUser);

    console.log((new Date()) + ' Connection accepted.');
});

//Channel and people-handling

function channelIDForName(channelname) {
	for(var i = 0; i <= channels.length; i++) {
		var channel = channels[i];
		if(channel.name == channelname) {
			return channel.id;
		}
	}
}

function userNameForID(userid) {
	for(var i = 0; i <= people.length; i++) {
		var user = people[i];
		if(user.id == userid) {
			if(user.profile && user.profile.real_name && user.profile.real_name.length != 0) {
				return user.profile.real_name;
			}
			console.log(user);
			return user.name;
		}
	}
}