'use strict';
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json({ limit: '10mb', extended: true }));
var cors = require('cors');
app.use(cors());

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

