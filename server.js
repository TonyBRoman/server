/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

// Express Messages Middleware
app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Intentional Error Route
app.get("/footer-error", utilities.handleErrors(baseController.triggerError))

/* ***********************
 * 404 Handler (Generic Page Not Found)
 * This catches random mistyped URLs
 * *************************/
app.use(async (req, res, next) => {
  let nav = await utilities.getNav()
  res.status(404).render("errors/error", {
    title: "SIGNAL LOST IN GOTHAM",
    message: "Detective, the coordinates you entered do not exist in our database. Even the Bat-Computer can't find what isn't there.",
    nav
  })
})

/* ***********************
 * Express Error Handler
 * This catches errors passed by next() or thrown by handleErrors
 * *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let message
  let title

  // Logic to differentiate Batman messages based on error status
  if (err.status == 404) {
    title = "COORDINATES UNKNOWN";
    message = "Target location not found. It seems Joker has scrubbed these files from the system.";
  } else {
    title = "SYSTEM OVERLOAD";
    message = "The Bat-Computer is malfunctioning! Stand back while Batman performs some... 'emergency maintenance' on the hardware.";
  }

  res.render("errors/error", {
    title: title, 
    message: message,
    nav
  })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})