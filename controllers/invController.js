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
    
    if (!data) {
      return next({status: 404, message: "Vehicle not found."})
    }

    const loggedin = res.locals.loggedin 
    const account_id = res.locals.accountData ? res.locals.accountData.account_id : null
    
    const grid = await utilities.buildVehicleDetailGrid(data, loggedin, account_id)

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
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    notice: req.flash("notice")
  })
}

/* ***************************
 * Build add classification view
 * ************************** */
invController.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification", 
    nav, 
    notice: req.flash("notice"), 
    errors: null
  })
}

/* ***************************
 * Process add classification
 * ************************** */
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

/* ***************************
 * Build add inventory view
 * ************************** */
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

/* ***************************
 * Process add inventory
 * ************************** */
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

/* ***************************
 * Return inventory by classification as JSON
 * ************************** */
invController.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invController.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 * Update Inventory Item
 *************************** */
invController.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    } = req.body

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      return res.redirect(`/inv/edit/${inv_id}`)
    }

  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build delete confirmation view
 *************************** */
invController.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    inv_color: itemData.inv_color,
    inv_description: itemData.inv_description
  })
}

/* ***************************
 * Process delete inventory
 *************************** */
invController.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/")
  }
}



module.exports = invController
