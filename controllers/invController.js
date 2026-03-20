const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  console.log("Entró a buildByClassificationId con ID:", req.params.classificationId)

    try {
    const classificationId = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classificationId)
    const grid = utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()

    const className = data.length > 0 ? data[0].classification_name : "No Vehicles Found"

    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
