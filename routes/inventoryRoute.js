// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities/"); 
const auth = require("../utilities/auth")

// Route to build inventory by classification view (public)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to deliver specific vehicle detail view (public)
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build inventory management view (protected: Employee/Admin only)
router.get("/", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

// Route to deliver add classification view (protected)
router.get("/add-classification", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification))

// Route to process add classification (protected)
router.post("/add-classification", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.addClassification))

// Route to deliver add inventory view (protected)
router.get("/add-inventory", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory (protected)
router.post("/add-inventory", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.addInventory))

// Route to deliver inventory JSON for dynamic select (protected)
router.get("/getInventory/:classification_id", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit inventory view (protected)
router.get("/edit/:inv_id", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventoryView))

// Route to process inventory update (protected)
router.post("/update", 
    auth.checkEmployeeOrAdmin,
    utilities.updateInventoryRules(), 
    utilities.checkUpdateData,
    utilities.handleErrors(invController.updateInventory))

// Route to build delete inventory view (protected)
router.get("/delete/:inv_id", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteInventoryView))

// Route to process inventory delete (protected)
router.post("/delete", auth.checkEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventory))

module.exports = router;
