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

/*
Ejercicio 1:Ejercicio para triceps
Ejercicio 2:Curl concentrado
Ejercicio 3:Elevación lateral
*/

app.get('/', function (req, res) {
    /*require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        res.send('Server running at ' + add + ':' + port);
    })*/
    res.send('Welcome to Practica2 Arqui2');
});

/*Nueva rutina
INSERT INTO RUTINA VALUE();
result = {
  fieldCount, affectedRows, insertId, serverStatus, warningCount, message, protocol141:boolean, changedRows
}
*/

app.post('/routine', function (req, res) {
  let body = req.body;
  let id_rutina = 0;

  conn.query('INSERT INTO RUTINA VALUE()', function (err, result) {
      if (err) throw err;
      id_rutina=result.insertId;
      //for() insertar detalle_rutina (id_rutina,id_ejercicio,series,repeticiones)
  });
});

app.post('/rep', function (req, res) {
  let body = req.body;

  conn.query('INSERT INTO resultado_rutina(id_detalle_rutina,serie,numero_repeticion,completado) VALUES(?,?,?,?)', [body.id_detalle_rutina, body.serie, body.numero_repeticion, body.completado], function (err, result) {
      if (err) throw err;
      res.send(result);
  });
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