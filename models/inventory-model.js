const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get inventory items by classificationId
 * ************************** */
async function getInventoryByClassificationId(classificationId) {
  try {
    const result = await pool.query(
      `SELECT * 
       FROM public.inventory 
       JOIN public.classification 
       ON inventory.classification_id = classification.classification_id 
       WHERE inventory.classification_id = $1`,
      [classificationId]
    )
    return result.rows
  } catch (error) {
    console.error("Error en getInventoryByClassificationId:", error)
    throw error
  }
}

/* ***************************
 * Get vehicle data by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    return new Error("getInventoryById error")
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    throw error
  }
}

/* ***************************
 * Add new inventory item
 * ************************** */
async function addInventory(
  classification_id, inv_make, inv_model, inv_year,
  inv_description, inv_image, inv_thumbnail,
  inv_price, inv_miles, inv_color
) {
  try {
    const sql = `INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`
    const data = await pool.query(sql, [
      classification_id, inv_make, inv_model, inv_year,
      inv_description, inv_image, inv_thumbnail,
      inv_price, inv_miles, inv_color
    ])
    return data.rows[0]
  } catch (error) {
    throw error
  }
}

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryById, 
  addClassification, 
  addInventory 
}
