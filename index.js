const express = require('express')
const multer  = require('multer')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

require('dotenv/config')

const port = 3000

const app = express()
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: false}))

const upload = multer({ dest: 'uploads/' })

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) =>
{
    res.status(200).sendFile(__dirname + '/public/views/index.html')
})

app.listen(port, () => {
    console.log(`localhost:${port}`)
})