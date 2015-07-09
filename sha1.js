var crypto = require('crypto');

if(process.argv.length != 3){
	console.log("")
	console.log("Usage: node sha1 PASSWORD_TO_HASH")
	console.log("")
}else{
	console.log( crypto.createHash('sha1').update( process.argv[2] ).digest('hex') )
}
