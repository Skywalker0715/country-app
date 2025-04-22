import fs from 'fs';
import path from 'path';

const FAVORITES_FILE = path.resolve('./favorites.json');

function readFavorites() {
  if (!fs.existsSync(FAVORITES_FILE)) {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
  return data ? JSON.parse(data) : [];
}

function writeFavorites(favorites) {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const favorites = readFavorites();
    res.status(200).json(favorites);
  } else if (req.method === 'POST') {
    const newFavorite = req.body;

    const favorites = readFavorites();

    const formattedFavorite = {
      code: newFavorite.code || newFavorite.cca3,
      cca3: newFavorite.cca3 || newFavorite.code,
      name: newFavorite.name?.common || newFavorite.name || 'Unknown',
      flag: newFavorite.flag || `https://flagcdn.com/w320/${(newFavorite.cca3 || newFavorite.code).toLowerCase()}.png`.toLowerCase(),
      capital: newFavorite.capital || ['N/A'],
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
