const pool = require("../database/")

const wishlistModel = {}

/* *****************************
* Add a vehicle to wishlist
* ***************************** */
wishlistModel.addFavorite = async function (account_id, inv_id) {
  try {
    const sql = "INSERT INTO wishlist (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    if(error.code === '23505') {
      return "duplicate"
    }
    return error.message
  }
}

/* *****************************
* Get user's wishlist with vehicle details
* ***************************** */
wishlistModel.getWishlistByAccountId = async function (account_id) {
  try {
    const sql = `
      SELECT w.wishlist_id, i.inv_id, i.inv_make, i.inv_model, i.inv_image, i.inv_price 
      FROM wishlist w 
      JOIN inventory i ON w.inv_id = i.inv_id 
      WHERE w.account_id = $1`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    return new Error("Error retrieving wishlist")
  }
}

/* *****************************
* Remove a vehicle from wishlist
* ***************************** */
wishlistModel.removeFavorite = async function (wishlist_id) {
  try {
    const sql = "DELETE FROM wishlist WHERE wishlist_id = $1"
    return await pool.query(sql, [wishlist_id])
  } catch (error) {
    return error.message
  }
}

module.exports = wishlistModel