const express = require('express');
const fs = require('fs');
const markdownIt = require('markdown-it');
const md = new markdownIt();
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    fs.readFile('terms.md', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the Markdown file.');
            return;
        }
        const htmlContent = md.render(data);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" type="text/css" href="style.css">
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
    });
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});
