const express = require('express')
const app = express()
const fs = require('fs');
const port = 3333
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/cities', (req, res) => {
    const q = req.query.q;
    let raw = fs.readFileSync('cities.json');
    let json = JSON.parse(raw);
    let cities = json.cities.map(el => el.substring(0, el.indexOf("(") - 1));
    const ret = cities.filter(el => el.toUpperCase().includes(q.toUpperCase()));
    res.send(JSON.stringify({suggestions : ret}));
})

app.get('/users', (req, res) => {
  const q = req.query.q.toUpperCase();
  let raw = fs.readFileSync('users.json');
  let json = JSON.parse(raw);
  const ret = json.users.filter(el => {
  return  el.first_name.toUpperCase().includes(q) ||
          el.last_name.toUpperCase().includes(q) ||
          el.email.toUpperCase().includes(q)
  });
  res.send(JSON.stringify({suggestions : ret}));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})