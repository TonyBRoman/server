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

module.exports = { getClassifications, getInventoryByClassificationId }
