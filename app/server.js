const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static HTML file (index.html)
app.use(express.static(path.join(__dirname)));

// Connect to PostgreSQL
const pool = new Pool({
    user: 'admin',
    host: 'postgres', // Docker service name
    database: 'names_db',
    password: 'password',
    port: 5432,
});

// Create table if it doesn't exist
async function createTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS names (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Table 'names' created or already exists.");
    } catch (error) {
        console.error("Error creating table:", error);
    }
}

createTable();

// API to add a name
app.post('/add-name', async (req, res) => {
    const { name } = req.body;
    try {
        await pool.query('INSERT INTO names (name) VALUES ($1)', [name]);
        res.status(200).send({ message: 'Name added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error adding name to the database.' });
    }
});

// API to fetch all names
app.get('/names', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM names');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching names from the database.' });
    }
});

// API to delete a name by ID
app.delete('/delete-name/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM names WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send({ error: 'Name not found.' });
        }
        res.status(200).send({ message: 'Name deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error deleting name from the database.' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
