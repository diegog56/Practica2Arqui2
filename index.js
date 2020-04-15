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
var port = process.env.PORT || 80;

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
  conn.query("INSERT INTO RUTINA(fecha) VALUE(STR_TO_DATE(?,'%Y-%m-%dT%H:%i:%s'))",[body.date], function (err, result) {
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
  conn.query(`select TRUNCATE(r.id_rutina/10,0) as id_rutina, r.fecha, e.id_ejercicio, nombre, descripcion, series, repeticiones
  from detalle_rutina dr
  inner join rutina r on r.id_rutina=dr.id_rutina
  inner join ejercicio e on dr.id_ejercicio=e.id_ejercicio
  order by id_rutina,id_detalle_rutina`, function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.get('/routine/:id', function (req, res) {
  conn.query(`select TRUNCATE(r.id_rutina/10,0) as id_rutina, r.fecha, e.id_ejercicio, nombre, descripcion, series, repeticiones
  from detalle_rutina dr
  inner join rutina r on r.id_rutina=dr.id_rutina
  inner join ejercicio e on dr.id_ejercicio=e.id_ejercicio
  where r.id_rutina=`+(+req.params.id*10+1)`
  order by id_rutina,id_detalle_rutina`, function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.post('/rep', function (req, res) {
  let body = req.body;
  
  conn.query("INSERT INTO resultado_rutina(id_rutina,id_ejercicio,serie,numero_repeticion,completado,BPM,peso,fecha) VALUES(?,?,?,?,?,?,?,STR_TO_DATE(?,'%Y-%m-%dT%H:%i:%s'))", [body.id_rutina*10+1,body.id_ejercicio, body.serie, body.numero_repeticion, body.completado, body.BPM, body.peso, body.fecha], function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.get('/rep', function (req, res) {
  conn.query(`select rr.id_rutina, e.nombre, e.descripcion, rr.serie, rr.numero_repeticion, rr.completado, rr.BPM, rr.peso,rr.fecha
  from resultado_rutina rr
  inner join ejercicio e
    on rr.id_ejercicio=e.id_ejercicio
  order by rr.id_rutina,id_resultado_rutina`, function (err, result) {
      if (err) throw err;
      res.send(result);
  });
});

app.get('/test', function (req, res) {
  console.log(new Date());
  res.send("Exito");
});

app.get('/rep/:id', function (req, res) {
  conn.query(`select rr.id_rutina, e.nombre, e.descripcion, rr.serie, rr.numero_repeticion, rr.completado, rr.BPM, rr.peso,rr.fecha
  from resultado_rutina rr
  inner join ejercicio e
    on rr.id_ejercicio=e.id_ejercicio
  order by rr.id_rutina,id_resultado_rutina
  where rr.id_rutina=`+(+req.params.id*10+1), function (err, result) {
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