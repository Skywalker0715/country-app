import React, { useState, useEffect } from "react";
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CountryList = ({ favorites, setFavorites }) => {
    const [countries, setCountries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      fetch('https://restcountries.com/v3.1/all?fields=name,cca3,flags,capital,population,region')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => setCountries(data))
        .catch(error => console.error('Error fetching countries:', error));
    }, []);
    
          const handleSearch = (e) => {
            setSearchTerm(e.target.value.toLowerCase());
          };
        
          const filteredCountries = countries.filter((country) =>
            country.name.common.toLowerCase().includes(searchTerm)
          );
        
          return (
            <div style={{ padding: '1rem' }}>
              <h1 className="page-title">Daftar Negara Dunia 🌍</h1>
        
              <input
                type="text"
                placeholder="Cari negara..."
                onChange={handleSearch}
                style={{ padding: '8px', width: '100%', marginBottom: '1rem' }}
              />
        
              <div>
                {filteredCountries.map((country) => (
                  <div key={country.cca3} className="country-card">
                    <img
                      src={country.flags?.png || `https://flagcdn.com/w320/${country.cca3.toLowerCase()}.png`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://flagcdn.com/w320/${country.cca3.toLowerCase()}.png`;
                      }}
                      alt={country.name.common}
                      style={{ width: '60px' }}
                    />
                    <div>
                      <h3>{country.name.common || country.name}</h3>
                      <p>Ibukota: {Array.isArray(country.capital) ? country.capital[0] : country.capital || 'N/A'}</p>
                      <p>Populasi: {country.population.toLocaleString()}</p>
                      <p>Wilayah: {country.region}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          try {
                            const existingIndex = favorites.findIndex(
                              fav => fav.cca3 === country.cca3
                            );
                            
                            if (existingIndex >= 0) {
                              await axios.delete(`http://localhost:5000/favorites/${country.code || country.cca3}`);
                              setFavorites(prev => prev.filter(fav => fav.cca3 !== country.cca3));
                              toast.success(`${country.name.common} dihapus dari favorit`);
                            } else {
                              // Format data sesuai yang diharapkan backend
                              const favoriteData = {
                                code: country.cca3,  // Simpan sebagai code
                                cca3: country.cca3,  // Juga simpan sebagai cca3 untuk kompatibilitas
                                name: country.name.common,
                                flag: `https://flagcdn.com/w320/${country.cca3.toLowerCase()}.png`,
                                capital: country.capital?.[0] || 'N/A',
                                population: country.population,
                                region: country.region
                              };
                              const response = await axios.post('http://localhost:5000/favorites', favoriteData);
                              setFavorites(prev => [...prev, response.data.data]);
                              toast.success(`${country.name.common} ditambahkan ke favorit`);
                            }
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Gagal memproses favorit');
                          }
                        }}
                      >
                        {favorites.some(fav => fav.cca3 === country.cca3) ? '❤️ Favorit' : '🤍 Tambah Favorit'}
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        };
        
        export default CountryList;
