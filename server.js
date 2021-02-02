const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const mysql = require('mysql');
const multer = require('multer');
const upload = multer({dest:'./upload'})

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);


const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database,
    timezone: "kst"
});
connection.connect();

// Read Customer
app.get('/api/customers', (req, res) => {
  connection.query(
      'SELECT * FROM CUSTOMER WHERE isDeleted = 0 ORDER BY id DESC',
      (err, rows, fields) => {
          res.send(rows);
      }
  )
});

// Read Customer Specific
app.get('/api/customers/:id',(req, res) => {
    console.log(req.body.id)
    connection.query(
        'SELECT * FROM CUSTOMER WHERE id = ?', req.params.id,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

app.use('/image', express.static('./upload'));

// Add Customer
app.post('/api/customers', upload.single('image'), (req, res) => {
    console.log(req.body)
    let sql = "INSERT INTO CUSTOMER VALUES (null, ?, ?, ?, ?, ?, ?, now(), 0)";
    let name = req.body.name;
    let date = req.body.date;
    let machine = req.body.machine;
    let contacts = req.body.contacts;
    let tvid = req.body.tvid;
    let image = '';
    let params = [,];
    if (req.file) {
        image = '/image/' + req.file.filename;
        params = [name, date, machine, image, contacts, tvid];
        connection.query(sql, params,
            (err, rows, fields) => {
                res.send(rows);
            }  
        )
    } else {
        image = '/image/noimage.png'
        params = [name, date, machine, image, contacts, tvid];
        connection.query(sql, params,
            (err, rows, fields) => {
                res.send(rows);
            }  
        )
    }
});

// Edit Customer
app.post('/api/customers/edit/:id', upload.single('image'), (req, res) => {
    console.log(req.body)
    let sql = 'UPDATE CUSTOMER SET name=?, machine=?, image=?, contacts=?, tvid=? WHERE id=?'
    let id = req.params.id;
    let name = req.body.name;
    let machine = req.body.machine;
    let contacts = req.body.contacts;
    let tvid = req.body.tvid;
    let image = '';
    let params = [,];
    if (req.file) {
        image = '/image/' + req.file.filename;
        params = [name, machine, image, contacts, tvid, id];
        console.log(params)
        connection.query(sql, params,
            (err, rows, fields) => {
                res.send(rows);
            }  
        )
    } else {
        image = '/image/noimage.png'
        params = [name, machine, image, contacts, tvid, id];
        console.log(params)
        connection.query(sql, params,
            (err, rows, fields) => {
                console.log(err);
                res.send(rows);
            }  
        )
    }
})

// Delete Customer
app.delete('/api/customers/delete/:id', (req, res) => {
    let sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE id = ?';
    let params = [req.params.id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

// Read Customer AS
app.get('/api/as/:id', (req, res) => {
    connection.query(
        'SELECT * FROM CUSTOMER_AS WHERE customer_id=? AND isDeleted = 0 ORDER BY as_id DESC',
        req.params.id,
            (err, rows, field) => {
                res.send(rows);
            }
    )
})

app.use('./asimage', express.static('./upload/as'))

// Add Customer AS
app.post('/api/as', upload.single('image'), (req, res) => {
    let sql = "INSERT INTO CUSTOMER_AS VALUES (?, ?, null, ?, now(), ?, null, ?, ?, 0)";
    let customer_id = req.body.customer_id;
    let customer_name = req.body.customer_name;
    let as_person = req.body.as_person;
    let as_specific = req.body.as_specific;
    let customer_tvid = req.body.customer_tvid;
    let image = '';
    let params = [,];
    if (req.file) {
        image = '/asimage/' + req.file.filename;
        params = [customer_id, customer_name, as_person, as_specific, customer_tvid, image];
        connection.query(sql, params,
            (err, rows, fields) => {
                res.send(rows);
            }  
        )
    } else {
        image = '/asimage/noimage.png'
        params = [customer_id, customer_name, as_person, as_specific, customer_tvid, image];
        connection.query(sql, params,
            (err, rows, fields) => {
                res.send(rows);
            }  
        )
    }
});

// AS Solve
app.post('/api/as/solve/:id', upload.single('image'), (req, res) => {
    console.log(req);
    let sql = 'UPDATE CUSTOMER_AS SET as_solvedInfo=? where as_id = ?';
    let as_id = req.params.id;
    let as_solvedInfo = req.body.as_solvedInfo
    let params = [as_solvedInfo, as_id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// Delete Customer AS
app.delete('/api/as/delete/:id', (req, res) => {
    let sql = 'UPDATE CUSTOMER_AS SET isDeleted = 1 WHERE as_id = ?';
    let params = [req.params.id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

app.listen(port, () => console.log(`Listening On port ${port}`))