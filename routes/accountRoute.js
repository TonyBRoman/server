const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

router.get("/login", accountController.buildLogin)
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Error handling
router.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

module.exports = router;