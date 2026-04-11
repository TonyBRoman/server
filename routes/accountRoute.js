const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accountValidation = require("../utilities/account-validation") 

/* Account Routes */

// Login view
router.get("/login", accountController.buildLogin)

// Register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Default account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Process registration data
router.post(
  "/register",
  accountValidation.registrationRules(),
  accountValidation.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login data
router.post(
  "/login",
  accountValidation.loginRules(),
  accountValidation.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account management view (requires login)
router.get("/account-management", utilities.checkLogin, utilities.handleErrors(accountController.buildManagementView))

// Deliver update view
router.get("/update/:accountId", utilities.handleErrors(accountController.buildUpdateView))

// Process account info update
router.post(
  "/update", 
  accountValidation.updateAccountRules(), 
  accountValidation.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Process password change
router.post(
  "/change-password", 
  accountValidation.passwordRules(),
  accountValidation.checkPasswordData,
  utilities.handleErrors(accountController.changePassword) 
)

/* Error Handling */
router.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

router.get("/logout", accountController.accountLogout)

module.exports = router