import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const WorldMapViewer = ({ content, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [mapType, setMapType] = useState('standard');
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // Country data with coordinates
    const countryData = {
        'bangladesh': { lat: 23.6850, lng: 90.3563, zoom: 7, name: 'Bangladesh', capital: 'Dhaka', population: '165 million', area: '147,570 km²' },
        'india': { lat: 20.5937, lng: 78.9629, zoom: 5, name: 'India', capital: 'New Delhi', population: '1.4 billion', area: '3.287 million km²' },
        'usa': { lat: 37.0902, lng: -95.7129, zoom: 4, name: 'United States', capital: 'Washington, D.C.', population: '331 million', area: '9.834 million km²' },
        'uk': { lat: 51.5074, lng: -0.1278, zoom: 6, name: 'United Kingdom', capital: 'London', population: '67 million', area: '243,610 km²' },
        'china': { lat: 35.8617, lng: 104.1954, zoom: 5, name: 'China', capital: 'Beijing', population: '1.4 billion', area: '9.597 million km²' },
        'japan': { lat: 36.2048, lng: 138.2529, zoom: 6, name: 'Japan', capital: 'Tokyo', population: '125 million', area: '377,975 km²' },
        'australia': { lat: -25.2744, lng: 133.7751, zoom: 4, name: 'Australia', capital: 'Canberra', population: '25.7 million', area: '7.692 million km²' },
        'brazil': { lat: -14.2350, lng: -51.9253, zoom: 4, name: 'Brazil', capital: 'Brasília', population: '213 million', area: '8.516 million km²' },
        'egypt': { lat: 26.8206, lng: 30.8025, zoom: 6, name: 'Egypt', capital: 'Cairo', population: '104 million', area: '1.01 million km²' },
        'south africa': { lat: -30.5595, lng: 22.9375, zoom: 5, name: 'South Africa', capital: 'Pretoria', population: '60 million', area: '1.221 million km²' },
        'canada': { lat: 56.1304, lng: -106.3468, zoom: 4, name: 'Canada', capital: 'Ottawa', population: '38 million', area: '9.985 million km²' },
        'germany': { lat: 51.1657, lng: 10.4515, zoom: 6, name: 'Germany', capital: 'Berlin', population: '83 million', area: '357,582 km²' },
        'france': { lat: 46.2276, lng: 2.2137, zoom: 6, name: 'France', capital: 'Paris', population: '67 million', area: '551,695 km²' },
        'italy': { lat: 41.8719, lng: 12.5674, zoom: 6, name: 'Italy', capital: 'Rome', population: '60 million', area: '301,340 km²' },
        'russia': { lat: 61.5240, lng: 105.3188, zoom: 4, name: 'Russia', capital: 'Moscow', population: '144 million', area: '17.1 million km²' },
        'pakistan': { lat: 30.3753, lng: 69.3451, zoom: 5, name: 'Pakistan', capital: 'Islamabad', population: '220 million', area: '881,913 km²' },
        'nepal': { lat: 28.3949, lng: 84.1240, zoom: 7, name: 'Nepal', capital: 'Kathmandu', population: '29 million', area: '147,516 km²' },
        'sri lanka': { lat: 7.8731, lng: 80.7718, zoom: 7, name: 'Sri Lanka', capital: 'Colombo', population: '21 million', area: '65,610 km²' }
    };

    // Get default location based on content title
    const getDefaultLocation = () => {
        const title = (content.title + ' ' + (content.description || '')).toLowerCase();
        
        for (const [key, data] of Object.entries(countryData)) {
            if (title.includes(key)) {
                return data;
            }
        }
        return { lat: 20.5937, lng: 78.9629, zoom: 2, name: 'World Map', capital: 'Earth', population: '7.9 billion', area: '510.1 million km²' };
    };

    // Initialize map after component mounts
    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const mapContainer = document.getElementById('world-map');
            if (mapContainer && !mapInstanceRef.current) {
                initMap();
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    const initMap = () => {
        const defaultLoc = getDefaultLocation();
        
        // Check if map container exists
        const mapContainer = document.getElementById('world-map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        // Create map instance
        const mapInstance = L.map('world-map').setView([defaultLoc.lat, defaultLoc.lng], defaultLoc.zoom);
        
        // Add tile layer
        const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);
        
        // Add marker for default location
        const marker = L.marker([defaultLoc.lat, defaultLoc.lng]).addTo(mapInstance);
        marker.bindPopup(`
            <div style="min-width: 200px;">
                <b style="font-size: 16px;">${defaultLoc.name || content.title}</b><br>
                <hr style="margin: 5px 0;">
                <b>Capital:</b> ${defaultLoc.capital || 'N/A'}<br>
                <b>Population:</b> ${defaultLoc.population || 'N/A'}<br>
                <b>Area:</b> ${defaultLoc.area || 'N/A'}<br>
                ${content.description ? `<p style="margin-top: 5px;"><i>${content.description.substring(0, 100)}</i></p>` : ''}
            </div>
        `).openPopup();
        
        mapInstanceRef.current = mapInstance;
        setMapLoaded(true);
    };

    const changeMapType = (type) => {
        if (!mapInstanceRef.current) return;
        
        // Remove existing tile layers
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });
        
        let tileUrl = '';
        if (type === 'standard') {
            tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        } else if (type === 'satellite') {
            tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        } else if (type === 'terrain') {
            tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        }
        
        L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);
        
        setMapType(type);
    };

    const searchLocation = async () => {
        if (!searchQuery.trim() || !mapInstanceRef.current) return;
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                mapInstanceRef.current.flyTo([lat, lng], 12);
                
                const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
                marker.bindPopup(`
                    <b>${data[0].display_name}</b><br>
                    Found! Click to explore this location.
                `).openPopup();
            } else {
                alert('Location not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching for location. Please try again.');
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation && mapInstanceRef.current) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    mapInstanceRef.current.flyTo([lat, lng], 15);
                    
                    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
                    marker.bindPopup('<b>Your Location</b><br>You are here!').openPopup();
                },
                () => {
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const flyToCountry = (countryKey) => {
        const country = countryData[countryKey];
        if (country && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([country.lat, country.lng], country.zoom);
            
            const marker = L.marker([country.lat, country.lng]).addTo(mapInstanceRef.current);
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <b style="font-size: 16px;">${country.name}</b><br>
                    <hr style="margin: 5px 0;">
                    <b>Capital:</b> ${country.capital}<br>
                    <b>Population:</b> ${country.population}<br>
                    <b>Area:</b> ${country.area}<br>
                </div>
            `).openPopup();
            
            setSelectedCountry(countryKey);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🌍</div>
                        <div>
                            <h2 className="text-xl font-bold text-white">World Geography Explorer</h2>
                            <p className="text-green-200 text-sm">{content.title}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Controls */}
                <div className="bg-gray-100 p-4 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                                placeholder="Search for a country, city, or landmark..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                onClick={searchLocation}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                🔍 Search
                            </button>
                        </div>
                    </div>
                    
                    <button
                        onClick={getCurrentLocation}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        📍 My Location
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => changeMapType('standard')}
                            className={`px-3 py-2 rounded-lg transition text-sm ${mapType === 'standard' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                        >
                            🗺️ Standard
                        </button>
                        <button
                            onClick={() => changeMapType('satellite')}
                            className={`px-3 py-2 rounded-lg transition text-sm ${mapType === 'satellite' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                        >
                            🛰️ Satellite
                        </button>
                        <button
                            onClick={() => changeMapType('terrain')}
                            className={`px-3 py-2 rounded-lg transition text-sm ${mapType === 'terrain' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                        >
                            ⛰️ Terrain
                        </button>
                    </div>
                </div>

                {/* Map and Country List */}
                <div className="flex-1 flex flex-row overflow-hidden">
                    {/* Map Container */}
                    <div id="world-map" className="flex-1" style={{ height: '60vh', minHeight: '400px', backgroundColor: '#f0f0f0' }}></div>

                    {/* Country Quick Access */}
                    <div className="w-72 bg-gray-50 border-l overflow-y-auto p-3">
                        <h3 className="font-bold text-gray-700 mb-3 text-center sticky top-0 bg-gray-50 py-2">🌏 Quick Access</h3>
                        <div className="space-y-1">
                            {Object.keys(countryData).map((country) => (
                                <button
                                    key={country}
                                    onClick={() => flyToCountry(country)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm capitalize flex items-center gap-2 ${
                                        selectedCountry === country 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <span>📍</span>
                                    <span>{countryData[country].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-gray-50 p-3 border-t">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                        <div className="flex gap-4">
                            <span>🗺️ Search any location worldwide</span>
                            <span>📍 Click on countries to explore</span>
                            <span>🔄 Change map view using buttons</span>
                        </div>
                        <div className="text-green-600 font-medium">
                            🌍 Powered by OpenStreetMap
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldMapViewer;