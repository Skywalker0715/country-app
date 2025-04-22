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
  const {
    query: { code },
    method,
  } = req;

  if (method === 'DELETE') {
    let favorites = readFavorites();

    const newFavorites = favorites.filter(item =>
      item.code !== code && item.cca3 !== code
    );

    if (newFavorites.length === favorites.length) {
      res.status(404).json({ message: 'Negara tidak ditemukan' });
      return;
    }

    writeFavorites(newFavorites);
    res.status(200).json({ message: 'Berhasil dihapus' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
