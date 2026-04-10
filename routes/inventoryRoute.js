// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities/"); 
const util = require("ajs/lib/util");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to deliver specific vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to deliver add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Route to process add classification
router.post("/add-classification", utilities.handleErrors(invController.addClassification))

// Route to deliver add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory
router.post("/add-inventory", utilities.handleErrors(invController.addInventory))

// Route to deliver edit inventory view
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventoryView))

// Route to process inventory update
router.post("/update", 
    utilities.updateInventoryRules(), 
    utilities.checkUpdateData,
    utilities.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventoryView))

router.post("/delete", utilities.handleErrors(invController.deleteInventory))


module.exports = router;