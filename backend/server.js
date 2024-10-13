// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Routes

// Get all games
app.get('/api/games', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM games');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific game
app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new game
app.post('/api/games', async (req, res) => {
  try {
    const { name, question, minPlayers, modes, timer, useTimer } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO games (name, question, min_players, modes, timer, use_timer) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, question, minPlayers, modes, timer, useTimer]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add content to a game
app.post('/api/games/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, url, text } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO game_content (game_id, type, url, text) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, type, url, text]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get content for a game
app.get('/api/games/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM game_content WHERE game_id = $1', [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a decision
app.post('/api/games/:id/decisions', async (req, res) => {
  try {
    const { id } = req.params;
    const { contentId, decision, participantId } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO decisions (game_id, content_id, decision, participant_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, contentId, decision, participantId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics for a game
app.get('/api/games/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT 
        gc.id as content_id,
        gc.type,
        gc.url,
        gc.text,
        COUNT(CASE WHEN d.decision = true THEN 1 END) as agreements,
        COUNT(CASE WHEN d.decision = false THEN 1 END) as disagreements,
        COUNT(*) as total_decisions
      FROM game_content gc
      LEFT JOIN decisions d ON gc.id = d.content_id
      WHERE gc.game_id = $1
      GROUP BY gc.id
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});