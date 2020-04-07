'use strict';
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const http = require('http');
const app = express();
app.use(bodyParser.json({ limit: '10mb', extended: true }));
var cors = require('cors');
app.use(cors());

const server = http.createServer(app);

const WebSocket = require('ws');
const socket = new WebSocket.Server({server});

const db_credentials = require('./db_credentials');
var conn = mysql.createPool(db_credentials);


/*APP*/
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server running at http://localhost:' + port);
});

app.get('/', function (req, res) {
    /*require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        res.send('Server running at ' + add + ':' + port);
    })*/
    res.send('Welcome to Practica2 Arqui2');
});

socket.on('connection', function (ws, req) {
    ws.on('message', function (message) {
      var json = 0;
      try{
      json = JSON.parse(message);
      }
      catch(e){
          json = 0;
      }
      if(json === 0){
        var data = message.split('#');
        console.log(data);
        report = new Report({
          location: {
            latitude: Number.parseFloat(data[0]),
            longitude: Number.parseFloat(data[1]),
            height: Number.parseFloat(data[2])
          }
        });
        report.date = new Date(Date.now() - 6*60*60*1000);
        console.log(report);
        report.save((err,rep)=>{
          if (err) {
            throw err;
          }
          console.log('Reporte guardado');
        });
        message = '{"alarma" : true}';
      }
      else{
        if(json.Data)
          message = 'A';
        else
          message = 'B';
      }
      socket.clients.forEach(function (client) {
        if (client != ws && client.readyState) {
          client.send(message);
        }
      });
    });
    ws.on('close', function () {
      console.log("lost one client");
    });
    console.log("new client connected");
  });