# slack-support
For when you want to operate a support channel through Slack, but don't want to invite everybody to your team. 

The client must be wrapped in nwjs before it will open. 

# How does it work?
The clients authenticate to the server using a name. Whenever the client sends messages the bot will relay that message, with the name of the client to it's dedicated channel. 

To reply to that client, start your message with "~clientname: " and then write whatever you want to reply. Messages will only be seen by those you reply to. 
