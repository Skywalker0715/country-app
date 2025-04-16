const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Path ke file favorites
const FAVORITES_FILE = './favorites.json';

// Helper: baca file JSON
function readFavorites() {
    if (!fs.existsSync(FAVORITES_FILE)) {
        // Buat file baru jika tidak ada
        writeFavorites([]);
        return [];
    }
    
    try {
        const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
        if (!data.trim()) {
            // Jika file kosong, kembalikan array kosong
            return [];
        }
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading favorites file:', err);
        // Jika error, backup file corrupt dan buat yang baru
        const backupPath = FAVORITES_FILE + '.bak';
        fs.copyFileSync(FAVORITES_FILE, backupPath);
        console.log(`Created backup of corrupt file at ${backupPath}`);
        writeFavorites([]);
        return [];
    }
}

// Helper: simpan ke file JSON
function writeFavorites(favorites) {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

// GET /favorites → ambil semua favorit
app.get('/favorites', (req, res) => {
    try {
        const favorites = readFavorites();
        
        // Validasi data
        const validatedFavorites = favorites.map(fav => {
          return {
            code: fav.code || fav.cca3,
            cca3: fav.cca3 || fav.code,
            name: fav.name || { common: 'Unknown' },
        flag: fav.flag || `https://flagcdn.com/w320/${(fav.cca3 || fav.code).toLowerCase()}.png`.toLowerCase(),
            capital: fav.capital || ['N/A'],
            population: fav.population || 0,
            region: fav.region || 'Unknown'
          };
        });

        // Pastikan selalu mengembalikan array
        const responseData = Array.isArray(validatedFavorites) ? validatedFavorites : [];
        // Pastikan format JSON yang valid
        const jsonResponse = JSON.stringify(responseData, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(jsonResponse);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
    }
});

// POST /favorites → tambah favorit baru
app.post('/favorites', (req, res) => {
    const newFavorite = req.body;
    let favorites = readFavorites();

    // Validasi dan format data
    const formattedFavorite = {
        code: newFavorite.code || newFavorite.cca3,
        cca3: newFavorite.cca3 || newFavorite.code,
        name: newFavorite.name?.common || newFavorite.name || 'Unknown',
        flag: newFavorite.flag || `https://flagcdn.com/w320/${(newFavorite.cca3 || newFavorite.code).toLowerCase()}.png`.toLowerCase(),
        capital: newFavorite.capital || ['N/A'],
        population: newFavorite.population || 0,
        region: newFavorite.region || 'Unknown'
    };

    // Cek duplikat
    const exists = favorites.find(item => 
        item.code === formattedFavorite.code || 
        item.cca3 === formattedFavorite.cca3
    );
    if (exists) return res.status(400).json({ message: 'Negara sudah difavoritkan' });

    favorites.push(formattedFavorite);
    writeFavorites(favorites);
    res.status(201).json({ 
        message: 'Berhasil ditambahkan', 
        data: formattedFavorite 
    });
});

// DELETE /favorites/:code → hapus favorit berdasarkan code
app.delete('/favorites/:code', (req, res) => {
    const code = req.params.code;
    let favorites = readFavorites();

    const newFavorites = favorites.filter(item => 
        item.code !== code && item.cca3 !== code
    );
    if (newFavorites.length === favorites.length) {
        return res.status(404).json({ message: 'Negara tidak ditemukan' });
    }

    writeFavorites(newFavorites);
    res.json({ message: 'Berhasil dihapus' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
