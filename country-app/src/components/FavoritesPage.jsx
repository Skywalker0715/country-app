import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FavoritesPage = ({ favorites, setFavorites }) => {
  const [flagStatus, setFlagStatus] = useState({});

  const removeFavorite = async (country) => {
    try {
      const countryId = (country.cca3 || country.code || '').toUpperCase();
      await axios.delete(`http://localhost:5000/favorites/${countryId}`);
      setFavorites(prev => prev.filter(fav => fav.cca3 !== country.cca3));
      toast.success(`${country.name?.common || country.name} dihapus dari favorit`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus favorit');
    }
  };

  const getCountryCode2 = (country) => {
    if (country.cca2) return country.cca2.toLowerCase();
    if (country.alpha2Code) return country.alpha2Code.toLowerCase();
    if (country.cca3) return country.cca3.substring(0, 2).toLowerCase();
    return 'xx';
  };

  const getSafeFlagUrl = (country) => {
    const code2 = getCountryCode2(country);
    if (!code2 || code2.length !== 2) return null;
    return `https://flagcdn.com/w320/${code2}.png`;
  };

  const handleFlagError = (countryId) => {
    console.log(`Gagal memuat bendera untuk ID: ${countryId}`);
    setFlagStatus(prev => ({
      ...prev,
      [countryId]: 'failed'
    }));
  };

  const handleFlagSuccess = (countryId) => {
    setFlagStatus(prev => ({
      ...prev,
      [countryId]: 'loaded'
    }));
  };

  useEffect(() => {
    if (favorites.length > 0) {
      console.log('=== DEBUG DATA FAVORIT ===');
      favorites.forEach((country, index) => {
        const countryId = country.cca3 || `country-${index}`;
        const flagUrl = getSafeFlagUrl(country);
        console.log(`Negara #${index + 1}:`, {
          name: country.name?.common || country.name,
          cca3: country.cca3,
          flagUrl: flagUrl,
          status: flagStatus[countryId]
        });
      });
    }
  }, [favorites, flagStatus]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 className="favorites-title">Negara Favorit ⭐</h1>
      {favorites.length === 0 ? (
        <p>Belum ada negara favorit</p>
      ) : (
        <div>
          {favorites.map((country, index) => {
            const countryId = country.cca3 || `country-${index}`;
            const countryName = country.name?.common || country.name || 'Negara Tidak Diketahui';
            const flagUrl = getSafeFlagUrl(country);
            const status = flagStatus[countryId];

            return (
              <motion.div
                key={countryId}
                className="country-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  margin: '1rem 0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'white'
                }}
              >
                <div style={{
                  minWidth: '80px',
                  width: '80px',
                  height: '50px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {flagUrl && status !== 'failed' ? (
                    <img
                      src={flagUrl}
                      alt={`Bendera ${countryName}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onLoad={() => handleFlagSuccess(countryId)}
                      onError={() => handleFlagError(countryId)}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#e0e0e0',
                      color: '#333',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {country.cca3 || getCountryCode2(country).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3>{countryName}</h3>
                  <p>Ibukota: {Array.isArray(country.capital) ? country.capital[0] : country.capital || 'N/A'}</p>
                  <p>Populasi: {country.population?.toLocaleString() || 'N/A'}</p>
                  <p>Wilayah: {country.region || 'N/A'}</p>
                  <button
                    onClick={() => removeFavorite(country)}
                    style={{
                      background: '#ff4444',
                      marginTop: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Hapus Favorit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
