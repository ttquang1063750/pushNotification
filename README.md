#USAGE
	- cd pushNotification
	- npm install
	- node app.js or nodemon app.js
##DO FOLLOWING REQUEST
##GCM
##POST - http://localhost:3000/gcm
	form data:
		apiKey: "YOUR SERVER API KEY"
		token: "YOUR DEVICE TOKEN TO CHECK"
		message: "YOUR MESSAGE HERE"
		os: "android"

##APNS
##POST - http://localhost:3000/apns
	form data:
		token: "YOUR DEVICE TOKEN TO CHECK"
		message: "YOUR MESSAGE HERE"
		os: "ios"
