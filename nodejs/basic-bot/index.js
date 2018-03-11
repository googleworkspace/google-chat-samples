const express = require('express');
const bodyparser = require('body-parser')
const app = express();

const PORT = process.env.PORT || 9000;

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())



app.post('/',function(req, res){
    
    var test = "";
    
    //Case 1: When BOT is added to the ROOM
    if(req.body.type == 'ADDED_TO_SPACE' && req.body.space.type == 'ROOM') {
        text = `Thanks for adding me to ${req.body.space.type}`;
    }
    //Case 2: When BOT is added to a DM
    else if(req.body.type == 'ADDED_TO_SPACE' && req.body.space.type == 'DM') {
        text = `Thanks for adding me to ${req.body.space.type} , ${req.body.user.displayName}`;
    }
    //Case 3: Texting the BOT
    else if(req.body.type == 'MESSAGE') {
        text = `Your message : ${req.body.message.text}`;
    }

	return res.json({'text': text});
})

 
app.listen(PORT, function () {
    console.log(`Server is running in port - ${PORT}`)
});