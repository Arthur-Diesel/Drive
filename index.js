const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const mysql = require('sync-mysql');
const multer  = require('multer')
const bodyParser = require('body-parser')

require('dotenv/config')

const port = 3000

var app = express()
app.use(bodyParser.urlencoded({extended: false}))

var sql = new mysql({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
});

var upload = multer({ dest: __dirname + '/public/img/'})

app.get('/', (req, res) =>
{
    res.status(200).sendFile(__dirname + '/public/views/index.html')
})

app.get('/view/:id', (req, res) =>
{
    let id = req.params.id
    let response = sql.query(`SELECT * FROM images WHERE id = '${id}'`)
    if(response[0] != undefined)
    {
        res.status(200).sendFile(__dirname + '/public/img/' + response[0]['name'])
    }
    else
    {
        res.status(404).json({error: 'Image not found!'})
    }
})

app.post('/upload', upload.single('image'), (req, res) =>{
    
    var file = req.file

    check_jpg = file['originalname'].includes('.jpg') 
    check_png = file['originalname'].includes('.png') 
    check_gif = file['originalname'].includes('.gif')
    check_5mb = file['size'] < 10000000

    if(check_5mb && check_jpg || check_png || check_gif)
    {
        let image_id = crypto.randomBytes(32).toString('hex')
        sql.query(`INSERT INTO images(id, name) VALUES ('${image_id}', '${file['originalname']}')`)
        fs.renameSync(`${file['destination']}${file['filename']}`, `${file['destination']}/${file['originalname']}`);
        res.status(201).json({ original_name: file['originalname'], type: file['mimetype'], size: file['size'], destination: `http://localhost:3000/view/${image_id}` })
    }
    else if (check_5mb == false)
    {
        res.status(400).json({ error: "File has more than 10mb!" })
        try 
        {
            fs.unlinkSync(file['destination'] + file['filename'])
        } 
        catch(err) 
        {
            console.log("Houve um erro na remoção do arquivo: " + file['filename'])
        }
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