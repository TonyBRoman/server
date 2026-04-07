const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Login view
router.get("/login", accountController.buildLogin)
// Register View
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Defauult account management view
router.get("/", utilities.handleErrors(accountController.buildAccountManagement))

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login data
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Error handling
router.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

module.exports = router;