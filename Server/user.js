function User(connection, slackMsgFunc) {
	this.name = '';
	
	this.authenticated = false;
	this.ipAddress = '';
		
	var isAuthenticated = function() {
		if(!this.authenticated) {
			return false;
		}
		return true;
	}

	
	//Connection setup
	this.connection = connection;
	connection.user = this;
	connection.on('message', this.onMessage);
	connection.on('close', this.onClose);
	
	this.sendSlackMessage = slackMsgFunc;
		
	self = this;
}

User.prototype.sendMessage = function(message, user) {
	var connection = this.connection;
	
	connection.send(JSON.stringify({"message": message, "user": user}));
}

User.prototype.isAuthenticated = function() {
	if(!this.authenticated) {
		return false;
	}
	return true;
}

/*
 *	Callback for receiving messages. Must in JSON.
 */
User.prototype.onMessage = function(message) {
    if (message.type === 'utf8') {
     	var data = JSON.parse(message.utf8Data);
     	if(!data) {
	     	console.log("Received malformed data from " + request.host);
     	} else {
	    	if(data.type == 'authenticate') {
		    	if(data.name != undefined && data.name.toString().length > 0) {
			    	this.user.name = data.name;
			    	this.user.authenticated = true;

					console.log("User authenticated for " + this.user.name);
		    	}
	    	}
	    	
	    	if(data.type == 'message' && this.user.isAuthenticated()) {
		    	this.user.sendSlackMessage('`' + this.user.name + '` ' + data.message);
	    	}
     	}
    }
}

User.prototype.onClose = function(code, desc) {
	console.log((new Date()) + ' Peer ' + this.remoteAddress + ' disconnected.');	
}

module.exports = User;