import { useState, useEffect, useRef } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

// Indian cities list for autocomplete
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
  'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
  'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar',
  'Thiruvananthapuram', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Guntur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai',
  'Warangal', 'Cuttack', 'Firozabad', 'Kochi', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Nanded', 'Kolhapur',
  'Ajmer', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj',
  'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
]

function OnboardingLocation() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [errors, setErrors] = useState({})
  const [citySearch, setCitySearch] = useState(profileData.city || '')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState([])
  const cityInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    if (citySearch.length >= 2) {
      const filtered = INDIAN_CITIES.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      ).slice(0, 6)
      setFilteredCities(filtered)
      setShowCitySuggestions(filtered.length > 0)
    } else {
      setFilteredCities([])
      setShowCitySuggestions(false)
    }
  }, [citySearch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCitySuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    updateProfileData({ [name]: value })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleCityChange = (e) => {
    const value = e.target.value
    setCitySearch(value)
    updateProfileData({ city: value })

    if (errors.city) {
      setErrors(prev => ({ ...prev, city: null }))
    }
  }

  const selectCity = (city) => {
    setCitySearch(city)
    updateProfileData({ city })
    setShowCitySuggestions(false)
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: null }))
    }
  }

  const validateAndNext = () => {
    const newErrors = {}

    if (!profileData.locality?.trim()) {
      newErrors.locality = 'Locality is required'
    }
    if (!profileData.city?.trim()) {
      newErrors.city = 'City is required'
    }
    if (!profileData.pincode?.trim()) {
      newErrors.pincode = 'Pin code is required'
    } else if (!/^\d{6}$/.test(profileData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pin code'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">Where do you live?</h1>
          <p className="form-subtitle">Help members near you connect</p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="locality">Locality / Area *</label>
          <input
            type="text"
            id="locality"
            name="locality"
            className={`input-field ${errors.locality ? 'input-error' : ''}`}
            placeholder="e.g., Koramangala, Bandra West"
            value={profileData.locality || ''}
            onChange={handleChange}
          />
          {errors.locality && <span className="error-text">{errors.locality}</span>}
        </div>

        <div className="input-group city-autocomplete">
          <label className="input-label" htmlFor="city">City *</label>
          <input
            ref={cityInputRef}
            type="text"
            id="city"
            name="city"
            className={`input-field ${errors.city ? 'input-error' : ''}`}
            placeholder="Start typing your city..."
            value={citySearch}
            onChange={handleCityChange}
            onFocus={() => citySearch.length >= 2 && filteredCities.length > 0 && setShowCitySuggestions(true)}
            autoComplete="off"
          />
          {showCitySuggestions && (
            <div className="city-suggestions" ref={suggestionsRef}>
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  className="city-suggestion-item"
                  onClick={() => selectCity(city)}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
          {errors.city && <span className="error-text">{errors.city}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="pincode">Pin Code *</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            className={`input-field ${errors.pincode ? 'input-error' : ''}`}
            placeholder="e.g., 560034"
            value={profileData.pincode || ''}
            onChange={handleChange}
            maxLength={6}
          />
          {errors.pincode && <span className="error-text">{errors.pincode}</span>}
        </div>

        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingLocation
