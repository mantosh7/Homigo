const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// Add Tenant
router.post('/add', requireAuth('admin'), async (req, res, next) => {
  const { full_name, phone, email, password, room_id, join_date, emergency_contact, permanent_address } = req.body;
  let conn;

  try {
    const pwdHash = await bcrypt.hash(password || 'changeme', 10);

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO tenants
        (full_name, phone, email, password_hash, room_id, join_date, emergency_contact, permanent_address, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [full_name, phone, email, pwdHash, room_id || null, join_date || null, emergency_contact || null, permanent_address || null]
    );

    if (room_id) {
      await conn.query('UPDATE rooms SET is_occupied = 1 WHERE id = ?', [room_id]);
    }

    await conn.commit();
    return res.json({ id: r.insertId });

  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});


// Get All Active Tenants
router.get('/all', requireAuth('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, r.room_number
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.is_active = 1
      ORDER BY t.id DESC
    `);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});



// PERMANENT DELETE (Move Out)
router.delete('/delete/:id', requireAuth('admin'), async (req, res, next) => {
  const id = req.params.id;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // First get room assigned
    const [rows] = await conn.query('SELECT room_id FROM tenants WHERE id = ?', [id]);
    if (!rows[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const roomId = rows[0].room_id;

    // Delete tenant permanently
    await conn.query('DELETE FROM tenants WHERE id = ?', [id]);

    // Free room if needed
    if (roomId) {
      await conn.query('UPDATE rooms SET is_occupied = 0 WHERE id = ?', [roomId]);
    }

    await conn.commit();
    return res.json({ ok: true });

  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

// PUT /tenants/update/:id
router.put('/update/:id', requireAuth('admin'), async (req, res, next) => {
  const id = req.params.id;
  const {
    full_name,
    phone,
    email,
    password,
    room_id,
    join_date,
    emergency_contact,
    permanent_address,
    is_active
  } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // get previous room
    const [rows] = await conn.query('SELECT room_id FROM tenants WHERE id = ?', [id]);
    if (!rows[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const prevRoomId = rows[0].room_id;

    // only update fields client sent
    const fields = [];
    const vals = [];

    if (req.body.hasOwnProperty('full_name')) { fields.push('full_name = ?'); vals.push(full_name); }
    if (req.body.hasOwnProperty('phone')) { fields.push('phone = ?'); vals.push(phone); }
    if (req.body.hasOwnProperty('email')) { fields.push('email = ?'); vals.push(email); }
    if (req.body.hasOwnProperty('join_date')) { fields.push('join_date = ?'); vals.push(join_date || null); }
    if (req.body.hasOwnProperty('emergency_contact')) { fields.push('emergency_contact = ?'); vals.push(emergency_contact || null); }
    if (req.body.hasOwnProperty('permanent_address')) { fields.push('permanent_address = ?'); vals.push(permanent_address || null); }
    if (req.body.hasOwnProperty('is_active')) { fields.push('is_active = ?'); vals.push(is_active ? 1 : 0); }

    // room update
    if (req.body.hasOwnProperty('room_id')) { fields.push('room_id = ?'); vals.push(room_id || null); }

    // password only if provided
    if (password !== undefined && password !== '') {
      const hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      vals.push(hash);
    }

    if (fields.length > 0) {
      await conn.query(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`, [...vals, id]);
    }

    // room occupancy update ONLY IF room_id was included
    if (req.body.hasOwnProperty('room_id')) {
      if (prevRoomId && prevRoomId !== room_id) {
        await conn.query('UPDATE rooms SET is_occupied = 0 WHERE id = ?', [prevRoomId]);
      }
      if (room_id && prevRoomId !== room_id) {
        await conn.query('UPDATE rooms SET is_occupied = 1 WHERE id = ?', [room_id]);
      }
    }

    await conn.commit();
    return res.json({ ok: true });

  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});



module.exports = router;
