'use strict';
const express = require('express');
const app = express();
require('dotenv').config();
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const cors = require('cors')
const pg = require('pg');
const methodOverride = require('method-override');


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

const client = new pg.Client(process.env.DATABASE_URL);

// route
app.get('/', usaJob);
// app.get('/search', (req, res) => {
//   res.render('search')
// })
app.post('/result',dataHandler)
app.get('/',usaJob)
app.get('/search', ((req, res) => {
  res.render('search');
}))

app.post('/result',dataHandler)
app.post('/saveData', saveData)
app.get('/myList',selectData)
app.post('/viewDetails/:id', viewDetails)
app.put('/update/:id', updateData)
app.delete('/delete/:id',deleteHandler)

// callback function

function dataHandler(req, res) {
  let description = req.body.job;
  let url = `https://jobs.github.com/positions.json?description=${description}&location=usa`
  
  superagent.get(url).then(usaJob => {
    let jobArr = usaJob.body;
    let resultArr = jobArr.map(element => new AllJob(element));

    res.render('result',{resultKey:resultArr})
  })
}

function usaJob(req, res) {
  let url = `https://jobs.github.com/positions.json?location=usa`;
  superagent.get(url).then(job => {
    let dataArr = job.body;
    let jobData = dataArr.map(item => new Jobs(item))
        
    res.render('index', { jobKey: jobData });


  }).catch((err) => {
    console.log(err)
  })

}

function saveData(req, res) {
  let SQL = `INSERT INTO exam301 (title,company,location,url,description) VALUES ($1,$2,$3,$4,$5);`;
  let safeValues = [req.body.title, req.body.company, req.body.location, req.body.url,req.body.description];
  client.query(SQL, safeValues).then(result => {
    res.redirect('/myList');
  }).catch(err => {
    console.log(err)
  })

}

function selectData(req, res) {
  let SQL = `SELECT * FROM exam301;`
  client.query(SQL).then(results => {
    
    res.render('myList',{dataKey:results.rows})
  })
}

function viewDetails(req, res) {
  let SQL = `SELECT * FROM exam301 WHERE id=$1;`;
  let safeValues = [req.params.id];
  client.query(SQL, safeValues).then((results) => {
    res.render('viewDetails', { viewKey: results.rows });
  })
}

function updateData(req, res) {
  let SQL = `UPDATE exam301 SET title=$1,company=$2,location=$3,url=$4,description=$5 WHERE id=$6;`;
  let safeValues = [req.body.title, req.body.company, req.body.location, req.body.url,req.boy.description, req.params.id];
  
  client.query(SQL, safeValues).then((results) => {
    res.redirect(`/viewDetails/${req.params.id}`);
  })
}



function deleteHandler(req, res) {
  let SQL = `DELETE FROM exam301 where id=$1;`;
  let safeValue = [req.params.id]
  client.query(SQL, safeValue).then(result => {
    res.redirect('/myList');
  })
}


    // constructour function
    function Jobs(data) {
        this.title = data.title;
        this.company = data.company;
        this.location = data.location;
        this.url = this.url;
    }
  
  function AllJob(usaData) {
    this.title = usaData.title;
    this.company = usaData.company;
    this.location = usaData.location;
    this.url = usaData.url;
    this.description = usaData.description;
  }

    // assistant
//   app.listen(PORT, () => {
//   console.log(`listen to PORT ${PORT}`)
// })
    client.connect().then(() => {
        app.listen(PORT, () => {
            console.log(`listen to PORT ${PORT}`)
        })
    })

