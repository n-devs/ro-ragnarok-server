const express = require('express')
const cors = require('cors')
const { GrfNode } = require('grf-loader')
const path = require('node:path');
const fs = require("node:fs")
const app = express()
require('dotenv').config();

const fileHeaders = {
    bmp: 'image/bmp',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    mp3: 'audio/mp3',
    png: 'image/png',
    txt: 'text/plain',
    xml: 'application/xml',
    wav: 'audio/wav'
};

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.static(__dirname + "/"))


app.use(async function (req, res, next) {
    const filePath = decodeURIComponent(
        req.url.substr(1).replace(/\?.*/, '')
    );

    // const filePath = req.query.filename

    const matches = filePath.match(/\.(\w+)$/);
    let ext = (matches ? matches[1] : 'unknown').toLowerCase();
    const fileName = filePath.split('/').join('\\')

    const clientPath = await fs.readdirSync(path.join(__dirname, 'resources'))

    const grfs = clientPath.filter((file) => /\.grf$/i.test(file));

    for (let index = 0; index < grfs.length; index++) {
        const grfPath = grfs[index];
        const fd = fs.openSync(path.join(__dirname, "resources", grfPath), 'r');
        const grf = new GrfNode(fd);

        // Start parsing the grf.
        await grf.load();

        const { data, error } = await grf.getFile(fileName);

        // Apply headers
        const header = fileHeaders[ext] || 'application/octet-stream';
        res.setHeader('content-type', header);
        if (data) {
            const d = Buffer.from(data)
            res.send(d)
        } else {
            res.writeHead(404);
            res.end();
        }
    }

});

app.listen(5737, () => {
    console.log('Start server at port 5737.')
})