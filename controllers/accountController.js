require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const wishListModel = require("../models/wishlist-model")

/* ****************************************
* Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
* Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
* Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 * Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 * Deliver Account Management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: res.locals.accountData
  })
}

/* ****************************************
 * Deliver Update Account view 
 * *************************************** */
async function buildUpdateView(req, res, next) {
  const account_id = parseInt(req.params.accountId)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)

  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData, 
  })
}

/* ****************************************
 * Process Account Update 
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_firstname, 
    account_lastname, 
    account_email, 
    account_id
  )

  if (updateResult) {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Account information updated successfully.")
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: { account_firstname, account_lastname, account_email, account_id }
    })
  }
}

/* ****************************************
 * Process Password Change (POST)
 * *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (updateResult) {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Password updated successfully.")
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
    })
  } else {
    req.flash("notice", "Password update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: await accountModel.getAccountById(account_id)
    })
  }
}

/* ****************************************
 * Process Logout
 * *************************************** */
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  res.cookie("jwt", "", { maxAge: 1 })
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

/* ****************************************
 * Process Add to Wishlist
 * *************************************** */
async function addFavorite(req, res) {
  const { inv_id, account_id } = req.body
  
  const result = await wishListModel.addFavorite(account_id, inv_id)

  if (result === "duplicate") {
    req.flash("notice", "This vehicle is already in your garage! 🚗")
    return res.redirect("/account/wishlist")
  } 
  
  if (typeof result === 'object') {
    req.flash("notice", "Vehicle successfully added to your garage! ⭐")
    return res.redirect("/account/wishlist")
  } else {
    req.flash("notice", "Sorry, there was an error adding the vehicle.")
    return res.redirect("/inv/detail/" + inv_id)
  }
}

/* ****************************************
 * Deliver Wishlist View
 * *************************************** */
async function buildWishlistView(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const data = await wishListModel.getWishlistByAccountId(account_id)
  
  res.render("account/wishlist", {
    title: "My Garage",
    nav,
    errors: null,
    data, 
  })
}

/* ****************************************
 * Process Remove from Wishlist (POST)
 * *************************************** */
async function removeFavorite(req, res) {
  const { wishlist_id } = req.body
  const result = await wishListModel.removeFavorite(wishlist_id)

  if (result) {
    req.flash("notice", "Vehicle removed from your garage.")
  } else {
    req.flash("notice", "Sorry, the removal failed.")
  }
  res.redirect("/account/wishlist")
}


module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement, 
  buildUpdateView, 
  updateAccount, 
  changePassword, 
  accountLogout, 
  addFavorite,
  buildWishlistView, 
  removeFavorite 
}