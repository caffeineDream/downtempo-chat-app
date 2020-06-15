/* Module dependencies */
const app = require('./app');
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');
const io = require('./socket');

/* For https */
// const https = require('https');
// var privateKey = fs.readFileSync('./ssl/server.key', 'utf8');
// var certificate = fs.readFileSync('./ssl/server.crt', 'utf8');
// const server = https.createServer({
//     key: privateKey,
//     cert: certificate
// }, app);

/* Get port from environment and store it in Express */
var port = process.env.PORT || '4000';
app.set('port', port);

/* Create HTTP server */
const server = http.createServer(app);

/* Attach server to an engine.io instance */
io.attach(server, {
    cookie: false
});

/* Listen on provided port */
server.listen(port, () => {
    console.log(`Listening on port ${port}!`);
})

/* Connect to mongoDB with mongoose */
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('Connected to Mongo!')
});
mongoose.set('useFindAndModify', false);