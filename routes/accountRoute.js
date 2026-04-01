const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Login view
router.get("/login", accountController.buildLogin)
// Register View
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Error handling
router.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

module.exports = router;