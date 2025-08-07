import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

interface City {
  id: number;
  cityName: string;
}

interface CityDropdownProps {
  cities: City[];
  selectedCity: string;
  onCityChange: (cityName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CityDropdown({
  cities,
  selectedCity,
  onCityChange,
  placeholder = "Select your city *",
  disabled = false,
  className = "",
}: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (cityName: string) => {
    onCityChange(cityName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedCityData = cities.find(city => city.cityName === selectedCity);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-lg flex items-center justify-between"
      >
        <span className={selectedCity ? 'text-white' : 'text-gray-400'}>
          {selectedCity || placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1E19] rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">Select your city</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search City"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* City List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredCities.length > 0 ? (
                <div className="space-y-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city.cityName)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-white text-left">{city.cityName}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        city.cityName === selectedCity 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-600'
                      }`}>
                        {city.cityName === selectedCity && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No cities found
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-semibold transition-all hover:shadow-neon"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 