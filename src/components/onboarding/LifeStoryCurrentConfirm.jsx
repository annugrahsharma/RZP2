import { useState } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryCurrentConfirm() {
  const { profileData, updateLifeStory, completeLifeStory } = useOnboarding()
  const storyData = profileData.lifeStories.current
  const story = lifeStoryPrompts.current

  // Local state for editable fields
  const [interests, setInterests] = useState(storyData.interests || [])
  const [newInterest, setNewInterest] = useState('')
  const [rolesOrganizations, setRolesOrganizations] = useState(
    storyData.rolesOrganizations.length > 0
      ? storyData.rolesOrganizations
      : [{ organization: '', role: '' }]
  )
  const [travelCities, setTravelCities] = useState(storyData.travelCities || [])
  const [newCity, setNewCity] = useState('')
  const [summary, setSummary] = useState(storyData.summary || storyData.text || '')

  // Interest handlers
  const addInterest = () => {
    if (newInterest.trim()) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest('')
    }
  }

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index))
  }

  const handleInterestKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest()
    }
  }

  // Roles/Organizations handlers
  const updateRoleOrg = (index, field, value) => {
    const updated = [...rolesOrganizations]
    updated[index][field] = value
    setRolesOrganizations(updated)
  }

  const addRoleOrg = () => {
    setRolesOrganizations([...rolesOrganizations, { organization: '', role: '' }])
  }

  const removeRoleOrg = (index) => {
    if (rolesOrganizations.length > 1) {
      setRolesOrganizations(rolesOrganizations.filter((_, i) => i !== index))
    }
  }

  // Travel Cities handlers
  const addCity = () => {
    if (newCity.trim()) {
      setTravelCities([...travelCities, newCity.trim()])
      setNewCity('')
    }
  }

  const removeCity = (index) => {
    setTravelCities(travelCities.filter((_, i) => i !== index))
  }

  const handleCityKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCity()
    }
  }

  const handleSave = () => {
    updateLifeStory('current', {
      interests,
      rolesOrganizations: rolesOrganizations.filter(r => r.organization.trim()),
      travelCities,
      summary
    })
    completeLifeStory()
  }

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <div className="story-header-icon">{story.icon}</div>
        <h1 className="form-title">Confirm Your Current Life</h1>
        <p className="form-subtitle">Review and edit the information below</p>
      </div>

      {/* Media Preview */}
      {(storyData.videoUrl || storyData.audioUrl) && (
        <div className="confirm-media-preview">
          {storyData.videoUrl && (
            <video src={storyData.videoUrl} controls className="confirm-video" />
          )}
          {storyData.audioUrl && !storyData.videoUrl && (
            <audio src={storyData.audioUrl} controls className="confirm-audio" />
          )}
        </div>
      )}

      {/* Interests Tags */}
      <div className="confirm-section">
        <label className="input-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          Current Interests & Focus Areas
        </label>
        <div className="tags-container">
          {interests.map((interest, idx) => (
            <span key={idx} className="tag">
              {interest}
              <button type="button" className="tag-remove" onClick={() => removeInterest(idx)}>×</button>
            </span>
          ))}
        </div>
        <div className="tag-input-row">
          <input
            type="text"
            className="input-field"
            placeholder="Add an interest"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={handleInterestKeyPress}
          />
          <button type="button" className="add-tag-btn" onClick={addInterest}>Add</button>
        </div>
      </div>

      {/* Roles / Organizations */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Roles / Organizations</span>
        </div>
        {rolesOrganizations.map((roleOrg, idx) => (
          <div key={idx} className="entry-card">
            <div className="entry-fields">
              <div className="input-group">
                <label className="input-label small">Organization</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Organization name"
                  value={roleOrg.organization}
                  onChange={(e) => updateRoleOrg(idx, 'organization', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label small">Your Role</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your role / contribution"
                  value={roleOrg.role}
                  onChange={(e) => updateRoleOrg(idx, 'role', e.target.value)}
                />
              </div>
            </div>
            {rolesOrganizations.length > 1 && (
              <button type="button" className="entry-remove-btn" onClick={() => removeRoleOrg(idx)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-entry-btn" onClick={addRoleOrg}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Role / Organization
        </button>
      </div>

      {/* Frequent Travel Cities */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Frequent Travel Cities</span>
        </div>
        <div className="tags-container">
          {travelCities.map((city, idx) => (
            <span key={idx} className="tag tag-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {city}
              <button type="button" className="tag-remove" onClick={() => removeCity(idx)}>×</button>
            </span>
          ))}
        </div>
        <div className="tag-input-row">
          <input
            type="text"
            className="input-field"
            placeholder="Add a city"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            onKeyPress={handleCityKeyPress}
          />
          <button type="button" className="add-tag-btn" onClick={addCity}>Add</button>
        </div>
      </div>

      {/* Summary */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Current Life Summary</span>
        </div>
        <div className="input-group">
          <textarea
            className="input-field textarea-field"
            placeholder="A brief summary of your current life..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave}>
        Save & Continue
      </button>
    </div>
  )
}

export default LifeStoryCurrentConfirm
