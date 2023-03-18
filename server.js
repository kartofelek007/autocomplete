const express = require('express')
const app = express()
const fs = require('fs');
const port = 3000
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    const q = req.query.q;
    let rawdata = fs.readFileSync('cities.json');
    let json = JSON.parse(rawdata);
    let cities = json.cities.map(el => el.substring(0, el.indexOf("(") - 1));
    console.log(cities);
    const ret = cities.filter(el => el.toUpperCase().includes(q.toUpperCase()));
    res.send(JSON.stringify({suggestions : ret}));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})