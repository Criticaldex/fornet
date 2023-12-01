const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const dev = process.env.NODE_ENV !== "production";
const app = next({});
const handle = app.getRequestHandler();

const port = 3333;

const httpsOptions = {
   key: fs.readFileSync('C:/Program Files/Splunk/etc/auth/certificados-trial/privkey.pem'),
   cert: fs.readFileSync('C:/Program Files/Splunk/etc/auth/certificados-trial/cert.pem'),
};

app.prepare().then(() => {
   createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
   }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Server started on https://trial.soidemdt.com:${port}`);
   });
});