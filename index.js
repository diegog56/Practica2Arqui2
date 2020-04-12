'use strict';
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const app = express();
app.use(bodyParser.json({ limit: '10mb', extended: true }));
var cors = require('cors');
app.use(cors());

const db_credentials = require('./db_credentials');
var conn = mysql.createPool(db_credentials);


/*APP*/
var port = process.env.PORT || 3000;

const server = app.listen(port, function () {
    console.log('Server running at http://localhost:' + port);
});

const socket = new WebSocket.Server({server});

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

INSERT ID /10 TRUNCATE
*10 +1
*/

app.post('/routine', function (req, res) {
  let body = req.body;
  let list=[];
  list=body.list;
  let id_rutina = 0;
  conn.query('INSERT INTO RUTINA() VALUE()', function (err, result) {
      if (err) throw err;
      id_rutina=result.insertId;
      for(let exercise of list){
        conn.query('INSERT INTO DETALLE_RUTINA(id_rutina,id_ejercicio,series,repeticiones) VALUE(?,?,?,?)',[id_rutina,exercise.exercise,exercise.series,exercise.reps], function (err, result) {
          if (err) throw err;
        });
      }
      res.send({insertId:Math.trunc(id_rutina/10)});
  });
});

app.get('/routine', function (req, res) {
  conn.query(`select TRUNCATE(r.id_rutina/10,0) as id_rutina, e.id_ejercicio, nombre, descripcion, series, repeticiones
  from detalle_rutina dr
  inner join rutina r on r.id_rutina=dr.id_rutina
  inner join ejercicio e on dr.id_ejercicio=e.id_ejercicio`, function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.get('/routine/:id', function (req, res) {
  conn.query(`select TRUNCATE(r.id_rutina/10,0) as id_rutina, e.id_ejercicio, nombre, descripcion, series, repeticiones
  from detalle_rutina dr
  inner join rutina r on r.id_rutina=dr.id_rutina
  inner join ejercicio e on dr.id_ejercicio=e.id_ejercicio
  where r.id_rutina=`+(+req.params.id*10+1), function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.post('/rep', function (req, res) {
  let body = req.body;

  conn.query('INSERT INTO resultado_rutina(id_detalle_rutina,serie,numero_repeticion,completado) VALUES(?,?,?,?)', [body.id_detalle_rutina, body.serie, body.numero_repeticion, body.completado], function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.get('/rep', function (req, res) {
  conn.query(`select e.nombre, e.descripcion, rr.serie, rr.numero_repeticion, rr.completado, rr.BPM, rr.peso
  from detalle_rutina dr
  inner join rutina r on r.id_rutina=dr.id_rutina
  inner join ejercicio e on dr.id_ejercicio=e.id_ejercicio
  inner join resultado_rutina rr on dr.id_detalle_rutina=rr.id_detalle_rutina`, function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.get('/rep/:id', function (req, res) {
  conn.query(`select e.nombre, e.descripcion, rr.serie, rr.numero_repeticion, rr.completado, rr.BPM, rr.peso
  from detalle_rutina dr
  inner join rutina r on r.id_rutina=dr.id_rutina
  inner join ejercicio e on dr.id_ejercicio=e.id_ejercicio
  inner join resultado_rutina rr on dr.id_detalle_rutina=rr.id_detalle_rutina
  where r.id_rutina=`+(+req.params.id*10+1), function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

socket.on('connection', function (ws, req) {
    ws.on('message', function (message) {
      socket.clients.forEach(function (client) {
        if (ws!=client && client.readyState) {
          client.send(JSON.stringify(message));
        }
      });
    });
    ws.on('close', function () {
      console.log("lost one client");
    });
    console.log("new client connected");
});