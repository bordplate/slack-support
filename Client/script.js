var WebSocketClient = require('websocket').client;

var config = {
	name: '',
	address: '127.0.0.1',
	port: '8080'
}

var client = new WebSocketClient();
var conn = null;

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    
    conn = connection;
    
	connection.send(JSON.stringify({'type': 'authenticate', 'name': config.name}));    

    connection.on('error', function(error) {
	    
    });
    
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
	        var data = JSON.parse(message.utf8Data);
	        
			addMessageToScreen(data.message, data.user);
	        
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
});

connect();
setTimeout(connect, 5000);

/*
 * 	Connects to the server.
 **/ 
function connect() {
	if(!conn || !conn.connected) {
		client.connect('ws://'+ config.address + ':' + config.port + '/', 'echo-protocol');
	}
}

/*
 *	Sends a message back to the server.
 **/
function sendMessage() {
	var inputText = document.getElementById('chatinput').value;
	var message = {'type': 'message', 'message': inputText};
	conn.send(JSON.stringify(message));
	
	addMessageToScreen(inputText, "You");
	
	//Clear input field
	document.getElementById('chatinput').value = '';
}

/*
 *	Adds a message to the bottom of the chat log, with `name`
 *		as title.
 *	If there is already a message on the bottom with the same name,
 *		the message will be appended to that message.
 **/
var lastMessageFrom = '';
function addMessageToScreen(message, name) {
	if(lastMessageFrom == name) {
		//Find the message on the bottom of the screen.
        var childNodes = document.getElementById('main').childNodes;
      	var card = childNodes[childNodes.length-2];
      	
      	//Create the element to append to message
      	var element = document.createElement('div');
      	element.className = "mdl-card__actions mdl-card--border";
      	element.innerHTML = message;
      	
      	card.appendChild(element);
    } else {
	    //Create a new card
        var htmlString = '<div class="mdl-card mdl-shadow--2dp chatbubble">' +
		  					'<div class="mdl-card__title">' + name + '</div>' +
		  					'<div class="mdl-card__actions">' + message + '</div>' +
		  				'</div>';
	  	
		//There is a spacing on the bottom of the main-div, remove it and append
		//	our HTML to the div and then add the spacing again.
	  	document.getElementById('main').removeChild(document.getElementById("spacing"));
	  	document.getElementById('main').innerHTML += htmlString;
	  	
	  	var spacing = document.createElement('div');
	  	spacing.id = 'spacing';
	  	document.getElementById('main').appendChild(spacing);
  	}
  	
  	lastMessageFrom = name;
  	
  	scrollToBottom();
}

function scrollToBottom() {
 	var element = document.getElementsByClassName("mdl-layout")[0];
    element.scrollTop = element.scrollHeight;
}