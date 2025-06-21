import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link 
} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import CountryList from './components/CountryList';
import FavoritesPage from './components/FavoritesPage';
import './App.css';
import axios from 'axios'; 

function App() {
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dari backend
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/favorites', {
          timeout: 5000,
          validateStatus: function (status) {
            return status < 500; // Reject only if status is 500 or above
          }
        });

        if (res.status === 200) {
          // Pastikan data berupa array
          const favoritesData = Array.isArray(res.data) ? res.data : 
                              (res.data.data ? res.data.data : []);
          
          const formattedFavorites = favoritesData.map(item => ({
            ...item,
            cca3: item.code || item.cca3 || '',
            flag: item.flag || `https://flagcdn.com/w320/${(item.cca3 || item.code || '').toUpperCase()}.png`,
            name: item.name || { common: item.name || 'Unknown' },
            capital: item.capital || ['N/A'],
            population: item.population || 0,
            region: item.region || 'Unknown'
          }));
          
          setFavorites(formattedFavorites);
          setError(null);
        } else {
          throw new Error(`Server error: ${res.status}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        const errorMsg = err.response?.data?.message || 
                        err.message || 
                        'Gagal memuat data favorit';
        setError(errorMsg);
        toast.error(errorMsg);
        
        // Fallback data jika server error
        const localFavorites = localStorage.getItem('favoritesBackup');
        if (localFavorites) {
          setFavorites(JSON.parse(localFavorites));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
    
    // Simpan backup ke localStorage
    const interval = setInterval(() => {
      if (favorites.length > 0) {
        localStorage.setItem('favoritesBackup', JSON.stringify(favorites));
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {loading && <div className="loading">Memuat data...</div>}
      {error && <div className="error">{error}</div>}
      <Router>
        <nav className="navbar" style={{
          padding: '1rem',
          background: '#f8f9fa',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Link 
            to="/" 
            className="nav-link"
            style={{
              color: '#495057',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
            activeStyle={{
              background: '#e9ecef',
              color: '#212529',
              borderBottom: '2px solid #0d6efd'
            }}
          >
            Daftar Negara
          </Link>
          <Link 
            to="/favorites" 
            className="nav-link"
            style={{
              color: '#495057', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
            activeStyle={{
              background: '#e9ecef',
              color: '#212529',
              borderBottom: '2px solid #0d6efd'
            }}
          >
            Favorit
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<CountryList favorites={favorites} setFavorites={setFavorites} />} />
          <Route path="/favorites" element={<FavoritesPage favorites={favorites} setFavorites={setFavorites} />} />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Router>
    </div>
  );
}

export default App;
