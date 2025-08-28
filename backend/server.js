const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const db = new sqlite3.Database(path.join(__dirname, "database/fleet.db"), (err) => {
    if (err) console.error(err.message);
    else console.log("Conectado ao SQLite");
});

// Criar tabelas se não existirem
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placa TEXT UNIQUE,
        modelo TEXT,
        ano INTEGER,
        tipo TEXT,
        status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        cnh TEXT,
        telefone TEXT,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        veiculo_id INTEGER,
        motorista_id INTEGER,
        partida TEXT,
        destino TEXT,
        km REAL,
        combustivel REAL,
        data TEXT,
        FOREIGN KEY(veiculo_id) REFERENCES vehicles(id),
        FOREIGN KEY(motorista_id) REFERENCES drivers(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        veiculo_id INTEGER,
        tipo TEXT,
        descricao TEXT,
        data TEXT,
        custo REAL,
        FOREIGN KEY(veiculo_id) REFERENCES vehicles(id)
    )`);
});

// Rotas CRUD genéricas
const tables = ["vehicles", "drivers", "trips", "maintenance"];
tables.forEach(t => {
    app.get(`/${t}`, (req, res) => {
        db.all(`SELECT * FROM ${t}`, [], (err, rows) => {
            if (err) res.status(400).json({ error: err.message });
            else res.json(rows);
        });
    });
    app.post(`/${t}`, (req, res) => {
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);
        const placeholders = keys.map(_ => "?").join(",");
        db.run(`INSERT INTO ${t} (${keys.join(",")}) VALUES (${placeholders})`, values, function(err) {
            if (err) res.status(400).json({ error: err.message });
            else res.json({ id: this.lastID });
        });
    });
});

// Dashboard
app.get("/dashboard/vehicles-status", (req,res)=>{
    db.all(`SELECT status, COUNT(*) as total FROM vehicles GROUP BY status`, [], (err,rows)=>{
        if(err) res.status(400).json({error:err.message});
        else res.json(rows);
    });
});

app.get("/dashboard/trips-km", (req,res)=>{
    db.all(`SELECT veiculo_id, SUM(km) as total_km FROM trips GROUP BY veiculo_id`, [], (err,rows)=>{
        if(err) res.status(400).json({error:err.message});
        else res.json(rows);
    });
});

app.get("/dashboard/maintenance-cost", (req,res)=>{
    db.all(`SELECT veiculo_id, SUM(custo) as total_custo FROM maintenance GROUP BY veiculo_id`, [], (err,rows)=>{
        if(err) res.status(400).json({error:err.message});
        else res.json(rows);
    });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
