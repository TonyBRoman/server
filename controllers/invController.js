const util = require("ajs/lib/util")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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

/* ***************************
 * Build inventory management view
 * ************************** */
invController.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    notice: req.flash("notice")
  })
}

invController.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification", 
    nav, 
    notice: req.flash("notice"), 
    errors: null
  })
}

invController.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      res.redirect("/inv/")
    }
  } catch (error) {
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification", 
      nav, 
      notice: req.flash("notice"), 
      errors: null
    })
  }
}

invController.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationSelect,
    notice: req.flash("notice"),
    errors: null
  })
}

invController.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color
  } = req.body

  try {
    const result = await invModel.addInventory(
      classification_id, inv_make, inv_model, inv_year,
      inv_description, inv_image, inv_thumbnail,
      inv_price, inv_miles, inv_color
    )

    if (result) {
      req.flash("notice", `Vehicle "${inv_make} ${inv_model}" added successfully.`)
      res.redirect("/inv/")
    }
  } catch (error) {
    req.flash("notice", "Sorry, adding the vehicle failed.")
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      notice: req.flash("notice"),
      errors: null
    })
  }
}


// 2. Exportamos el nombre correcto
module.exports = invController