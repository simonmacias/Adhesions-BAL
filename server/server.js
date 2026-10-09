import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json())
app.use(express.static(__dirname))

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'bal-liguge_adherents',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

app.get('/api/health', async (req, res) => {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    res.json({ status: 'OK', database: 'MariaDB OK' })
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message })
  }
})

app.get('/api/members', async (req, res) => {
  try {
    const conn = await pool.getConnection()
    const [rows] = await conn.query('SELECT * FROM members ORDER BY nom ASC, prenom ASC')
    
    // Récupérer l'historique pour chaque adhérent
    for (let member of rows) {
      const [history] = await conn.query('SELECT * FROM adhesion_history WHERE member_id = ? ORDER BY date DESC', [member.id])
      member.historique = history
    }
    
    conn.release()
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/members/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection()
    const [rows] = await conn.query('SELECT * FROM members WHERE id = ?', [req.params.id])
    
    if (!rows.length) {
      conn.release()
      return res.status(404).json({ error: 'Adhérent introuvable' })
    }
    
    const member = rows[0]
    const [history] = await conn.query('SELECT * FROM adhesion_history WHERE member_id = ? ORDER BY date DESC', [member.id])
    member.historique = history
    
    conn.release()
    res.json(member)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/members', async (req, res) => {
  const {
    nom,
    prenom,
    email,
    telephone,
    ville,
    code_postal,
    datenaissance,
    genre,
    formuleadhesion,
    montantcotisation,
    dateadhesion,
    enfants,
    historique
  } = req.body

  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const conn = await pool.getConnection()
  
  try {
    await conn.beginTransaction()
    
    const [result] = await conn.query(
      `INSERT INTO members
       (nom, prenom, email, telephone, ville, code_postal, datenaissance, genre, formuleadhesion, montantcotisation, dateadhesion, enfants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        prenom,
        email || null,
        telephone || null,
        ville || null,
        code_postal || null,
        datenaissance || null,
        genre || 'M',
        formuleadhesion || null,
        montantcotisation || 0,
        dateadhesion || null,
        enfants || 0
      ]
    )

    const memberId = result.insertId

    // Insérer l'historique d'adhésion s'il existe
    if (historique && Array.isArray(historique)) {
      for (let adhesion of historique) {
        await conn.query(
          `INSERT INTO adhesion_history (member_id, date, formule, montant, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [memberId, adhesion.date, adhesion.formule, adhesion.montant, adhesion.notes || null]
        )
      }
    }

    await conn.commit()

    const [rows] = await conn.query('SELECT * FROM members WHERE id = ?', [memberId])
    const member = rows[0]
    const [history] = await conn.query('SELECT * FROM adhesion_history WHERE member_id = ?', [memberId])
    member.historique = history

    res.status(201).json(member)
  } catch (error) {
    await conn.rollback()
    console.error(error)
    res.status(500).json({ error: error.message })
  } finally {
    conn.release()
  }
})

app.put('/api/members/:id', async (req, res) => {
  const {
    nom,
    prenom,
    email,
    telephone,
    ville,
    code_postal,
    datenaissance,
    genre,
    formuleadhesion,
    montantcotisation,
    dateadhesion,
    enfants,
    historique
  } = req.body

  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const conn = await pool.getConnection()
  
  try {
    await conn.beginTransaction()

    await conn.query(
      `UPDATE members
       SET nom = ?, prenom = ?, email = ?, telephone = ?, ville = ?, code_postal = ?, datenaissance = ?, genre = ?, formuleadhesion = ?, montantcotisation = ?, dateadhesion = ?, enfants = ?
       WHERE id = ?`,
      [
        nom,
        prenom,
        email || null,
        telephone || null,
        ville || null,
        code_postal || null,
        datenaissance || null,
        genre || 'M',
        formuleadhesion || null,
        montantcotisation || 0,
        dateadhesion || null,
        enfants || 0,
        req.params.id
      ]
    )

    // Supprimer l'ancien historique et en insérer le nouveau
    await conn.query('DELETE FROM adhesion_history WHERE member_id = ?', [req.params.id])

    if (historique && Array.isArray(historique)) {
      for (let adhesion of historique) {
        await conn.query(
          `INSERT INTO adhesion_history (member_id, date, formule, montant, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [req.params.id, adhesion.date, adhesion.formule, adhesion.montant, adhesion.notes || null]
        )
      }
    }

    await conn.commit()

    const [rows] = await conn.query('SELECT * FROM members WHERE id = ?', [req.params.id])
    const member = rows[0]
    const [history] = await conn.query('SELECT * FROM adhesion_history WHERE member_id = ?', [req.params.id])
    member.historique = history

    res.json(member)
  } catch (error) {
    await conn.rollback()
    res.status(500).json({ error: error.message })
  } finally {
    conn.release()
  }
})

app.delete('/api/members/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection()
    
    await conn.beginTransaction()
    
    // Supprimer l'historique d'abord (clé étrangère)
    await conn.query('DELETE FROM adhesion_history WHERE member_id = ?', [req.params.id])
    
    // Puis supprimer l'adhérent
    const [result] = await conn.query('DELETE FROM members WHERE id = ?', [req.params.id])
    
    await conn.commit()
    conn.release()

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Adhérent introuvable' })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Route SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

const port = Number(process.env.PORT || 3000)
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${port}`)
})
