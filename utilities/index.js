require("dotenv").config()
const jwt = require("jsonwebtoken")
const invModel = require("../models/inventory-model")
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************
 * Builds the classification select list
 ************************** */
Util.buildClassificationList = async function (selectedClassificationId = null) {
  let data = await invModel.getClassifications()
  let list = '<select id="classification_id" name="classification_id" required>'
  list += '<option value="">Choose a Classification</option>'
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"`
    if (selectedClassificationId == row.classification_id) {
      list += " selected"
    }
    list += `>${row.classification_name}</option>`
  })
  list += "</select>"
  return list
}


/* ************************
 * Builds the classification view HTML grid
 ************************** */
Util.buildClassificationGrid = function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += '<li>'
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">'
      grid +=
        '<img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors">'
      grid += "</a>"
      grid += "<div class=\"namePrice\">"
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
  }
  return grid
}

/* ************************
 * Builds the vehicle detail view HTML
 * ************************** */
Util.buildVehicleDetailGrid = async function(data) {
  let display
  if (data) {
    display = '<section id="vehicle-detail-display">'
    display += '<img src="' + data.inv_image + '" alt="Image of ' + data.inv_make + ' ' + data.inv_model + '">'
    display += '<div id="vehicle-info">'
    display += '<h2>' + data.inv_make + ' ' + data.inv_model + ' Details</h2>'
    display += '<h3>Price: $' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</h3>'
    display += '<p><strong>Description:</strong> ' + data.inv_description + '</p>'
    display += '<p><strong>Color:</strong> ' + data.inv_color + '</p>'
    display += '<p><strong>Miles:</strong> ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</p>'
    display += '</div>'
    display += '</section>'
  } else {
    display = '<p class="notice">Sorry, no vehicle information found.</p>'
  }
  return display
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


module.exports = Util