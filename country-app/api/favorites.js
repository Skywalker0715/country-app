import fs from 'fs';
import path from 'path';

const FAVORITES_FILE = path.resolve('./server/favorites.json');

function readFavorites() {
  try {
    if (!fs.existsSync(FAVORITES_FILE)) {
      fs.writeFileSync(FAVORITES_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading favorites file:', error);
    throw error;
  }
}

function writeFavorites(favorites) {
  try {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
  } catch (error) {
    console.error('Error writing favorites file:', error);
    throw error;
  }
}

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const favorites = readFavorites();
      res.status(200).json(favorites);
    } else if (req.method === 'POST') {
      console.log('POST /api/favorites body:', req.body);
      const newFavorite = req.body;

      const favorites = readFavorites();

      const formattedFavorite = {
        code: newFavorite.code || newFavorite.cca3,
        cca3: newFavorite.cca3 || newFavorite.code,
        name: typeof newFavorite.name === 'object' && newFavorite.name !== null ? (newFavorite.name.common || 'Unknown') : (newFavorite.name || 'Unknown'),
        flag: newFavorite.flag || `https://flagcdn.com/w320/${(newFavorite.cca3 || newFavorite.code).toLowerCase()}.png`.toLowerCase(),
        capital: Array.isArray(newFavorite.capital) ? newFavorite.capital : (newFavorite.capital ? [newFavorite.capital] : ['N/A']),
        population: newFavorite.population || 0,
        region: newFavorite.region || 'Unknown'
      };

      const exists = favorites.find(item =>
        item.code === formattedFavorite.code ||
        item.cca3 === formattedFavorite.cca3
      );

      if (exists) {
        res.status(400).json({ message: 'Negara sudah difavoritkan' });
        return;
      }

      favorites.push(formattedFavorite);
      writeFavorites(favorites);
      res.status(201).json({
        message: 'Berhasil ditambahkan',
        data: formattedFavorite
      });
    } else if (req.method === 'DELETE') {
      const code = req.url.split('/').pop().toUpperCase();
      let favorites = readFavorites();
      const index = favorites.findIndex(item => item.code.toUpperCase() === code || item.cca3.toUpperCase() === code);
      if (index === -1) {
        res.status(404).json({ message: 'Negara tidak ditemukan di favorit' });
        return;
      }
      favorites.splice(index, 1);
      writeFavorites(favorites);
      res.status(200).json({ message: 'Berhasil dihapus dari favorit' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API handler error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}