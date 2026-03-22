const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

// 1. Usamos un nombre consistente: invController
const invController = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
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

/* ***************************
 * Build vehicle detail view
 * ************************** */
invController.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    const data = await invModel.getInventoryById(inv_id)
    
    // Validamos que existan datos antes de procesar
    if (!data) {
      return next({status: 404, message: 'Vehicle not found.'})
    }

    const grid = await utilities.buildVehicleDetailGrid(data)
    const nav = await utilities.getNav()
    const vehicleName = `${data.inv_make} ${data.inv_model}`
    
    res.render("inventory/detail", {
      title: vehicleName,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

// 2. Exportamos el nombre correcto
module.exports = invController