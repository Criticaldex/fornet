const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require("fs");

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'trial.soidemdt.com'
const port = 3333
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const httpsOptions = {
   key: fs.readFileSync('C:/Program Files/Splunk/etc/auth/certificados-trial/privkey.pem'),
   cert: fs.readFileSync('C:/Program Files/Splunk/etc/auth/certificados-trial/cert.pem'),
};

app.prepare().then(() => {
   createServer(httpsOptions, async (req, res) => {
      try {
         // Be sure to pass `true` as the second argument to `url.parse`.
         // This tells it to parse the query portion of the URL.
         const parsedUrl = parse(req.url, true)
         const { pathname, query } = parsedUrl

         if (pathname === '/a') {
            await app.render(req, res, '/a', query)
         } else if (pathname === '/b') {
            await app.render(req, res, '/b', query)
         } else {
            await handle(req, res, parsedUrl)
         }
      } catch (err) {
         console.error('Error occurred handling', req.url, err)
         res.statusCode = 500
         res.end('internal server error')
      }
   })
      .once('error', (err) => {
         console.error(err)
         process.exit(1)
      })
      .listen(port, () => {
         console.log(`> Ready on http://${hostname}:${port}`)
      })
})