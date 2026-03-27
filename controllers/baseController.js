const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    req.flash("notice", "This is a flash message.")
    res.render("index", {title: "Home", nav})
}

/* ***************************
 * Trigger an intentional 500 error
 * ************************** */
baseController.triggerError = async function (req, res, next) {
  throw new Error('Oh no! You crashed the server on purpose!')
}


module.exports = baseController