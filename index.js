const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const multer  = require('multer')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

require('dotenv/config')

const port = 3000

var app = express()
app.use(express.static('public/img'))
app.use(bodyParser.urlencoded({extended: false}))

var upload = multer({ dest: __dirname + '/public/img/'})

app.get('/', (req, res) =>
{
    res.status(200).sendFile(__dirname + '/public/views/index.html')
})

app.post('/upload', upload.single('image'), (req, res) =>{
    
    var file = req.file

    check_jpg = file['originalname'].includes('.jpg') 
    check_png = file['originalname'].includes('.png') 
    check_gif = file['originalname'].includes('.gif')

    if(check_jpg || check_png || check_gif)
    {

        if(check_jpg)
        {
            var extension = '.jpg'
        }
        if(check_png)
        {
            var extension = '.png'
        }
        if(check_gif)
        {
            var extension = '.gif'
        }
        var new_file_name = crypto.randomBytes(32).toString('hex') + extension
        fs.renameSync(`${file['destination']}${file['filename']}`, `${file['destination']}/${new_file_name}`);
        res.status(201).json({ original_name: file['originalname'], new_name:new_file_name, type: file['mimetype'], size: file['size'], destination: `http://localhost:3000/${new_file_name}` })
    }
    else
    {
        res.status(400).json({ error: "File isn't img or gif!" })
        try 
        {
            fs.unlinkSync(file['destination'] + file['filename'])
        } 
        catch(err) 
        {
            console.log("Houve um erro na remoção do arquivo: " + file['filename'])
        }
    }

})

app.listen(port, () => {
    console.log(`localhost:${port}`)
})