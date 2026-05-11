const { pool } = require('../config/database');

const addFavorite = async (req, res) => {
  try {
    const { symbol, name } = req.body;
    const [result] = await pool.query(
      'INSERT INTO favorites (user_id, symbol, name) VALUES (?, ?, ?)',
      [req.user.userId, symbol.toUpperCase(), name]
    );
    const [rows] = await pool.query('SELECT * FROM favorites WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Already in favorites' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM favorites WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
