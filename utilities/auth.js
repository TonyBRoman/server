const auth = {}

/**
 * Middleware to check if the user is an Employee or Admin
 * used to protect administrative routes.
 */
auth.checkEmployeeOrAdmin = (req, res, next) => {
  if (res.locals.loggedin && 
     (res.locals.accountData.account_type === "Employee" || 
      res.locals.accountData.account_type === "Admin")) {
    
    next()
    
  } else {
    req.flash("notice", "You do not have permission to access this area. Please log in with an authorized account.")
    res.redirect("/account/login")
  }
}

module.exports = auth