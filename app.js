
mysql = require('mysql2');
var con = mysql.createConnection({ //create connection to database
  host: "localhost",
  user: "root",
  password: "",
  port:"2000",
  database:"ips"
});
con.connect(function(err) {//connect to database success message
  if (err) throw err;
  console.log("Connected to database!");
});
const express = require('express');
const app = express();//create server application
const multer = require('multer');//for file upload
const cors = require('cors');//for local host communication
const bodyParser = require('body-parser');
//DECLARATIONS ---------------------------------------------------------
const port=  process.env.PORT || 3000; //choose port
app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
});

//test for accepting post body
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(cors());//for localhost

const storage = multer.diskStorage({//storage stuff
    destination: function (req, file, cb) {
      cb(null, 'uploads')//destination folder to save
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);//filename to save
    }
  })
const upload = multer({ storage });

//START OF API CALLS-------------------------------------------------------------------
app.post('/api/upload',upload.single('file'),(req,res) =>{//answer for POST /api/upload
    res.json(req.file);//info for the uploaded file
    res.send('Upload 1!');
});

app.post('/insert',(req,res) =>{//answer for POST /api/upload
  var sql = "INSERT INTO `ips`.`photos` (`ref`, `order`, `points`, `status`) VALUES ('1', '1', '0', '1');";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  res.send('Insert 1');
});

//test for accepting post body om x-www-form-urlencoded
app.post('/bodytest', (req, res) => {
  const name = req.body.name; // Store the "name" attribute in a variable
  console.log(`Received name: ${name}`);
  res.send(`Name received: ${name}`);
});//works


//test for accepting post body in form-data
app.post('/bodytest2', upload.none(), (req, res) => {
  const name = req.body.name; // Store the "name" attribute in a variable
  console.log(`Received name: ${name}`);
  res.send(`Name received: ${name}`);
});//works

//test for accepting post body in form-data with db insert
app.post('/bodytest3', upload.none(), (req, res) => {
  //const timetest = new Date().toISOString();
  const name = req.body.name; // Store the "name" attribute in a variable
  
  var sql = "INSERT INTO `ips`.`photos` (`ref`, `order`, `points`) VALUES ('"+name+"', '1', '0');";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted with name: "+name);
    
    //console.log("1 record inserted with timetest: "+timetest);
  });
  res.send('Insert 2 with name: '+name);
});//works

app.post('/timetest', upload.none(), (req, res) => {
  const timetest = new Date().toLocaleString();
  const name = req.body.name; // Store the "name" attribute in a variable
  
  var sql = "INSERT INTO `ips`.`photos` (`ref`, `order`, `points`) VALUES ('"+name+"', '1', '0');";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted with name: "+name);
    
    console.log("1 record inserted with timetest: "+timetest);
  });
  res.send('Insert 2 with name: '+name+' and with timetest: '+timetest);
  
});//works
