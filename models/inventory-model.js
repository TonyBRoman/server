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

/* ***************************
 * Update an existing inventory item
 *************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        inv_make = $1,
        inv_model = $2,
        inv_year = $3,
        inv_description = $4,
        inv_image = $5,
        inv_thumbnail = $6,
        inv_price = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `

    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])

    return data.rows[0]

  } catch (error) {
    console.error("updateInventory error:", error)
    return null
  }
}

/* ***************************
 * Delete an inventory item
 *************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rowCount 
  } catch (error) {
    console.error("deleteInventory error:", error)
    return null
  }
}


module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById, addClassification,  addInventory, updateInventory, deleteInventory  }
