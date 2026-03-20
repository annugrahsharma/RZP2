import { useState } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryEarlyConfirm() {
  const { profileData, updateLifeStory, completeLifeStory } = useOnboarding()
  const storyData = profileData.lifeStories.earlyLife
  const story = lifeStoryPrompts.earlyLife

  // Local state for editable fields
  const [interests, setInterests] = useState(storyData.interests || [])
  const [newInterest, setNewInterest] = useState('')
  const [bornIn, setBornIn] = useState(storyData.bornIn || '')
  const [hometown, setHometown] = useState(storyData.hometown || '')
  const [schools, setSchools] = useState(storyData.schools.length > 0 ? storyData.schools : [{ name: '', location: '' }])
  const [universities, setUniversities] = useState(storyData.universities.length > 0 ? storyData.universities : [{ name: '', location: '', major: '' }])
  const [summary, setSummary] = useState(storyData.summary || storyData.text || '')

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

  const updateSchool = (index, field, value) => {
    const updated = [...schools]
    updated[index][field] = value
    setSchools(updated)
  }

  const addSchool = () => {
    setSchools([...schools, { name: '', location: '' }])
  }

  const removeSchool = (index) => {
    if (schools.length > 1) {
      setSchools(schools.filter((_, i) => i !== index))
    }
  }

  const updateUniversity = (index, field, value) => {
    const updated = [...universities]
    updated[index][field] = value
    setUniversities(updated)
  }

  const addUniversity = () => {
    setUniversities([...universities, { name: '', location: '', major: '' }])
  }

  const removeUniversity = (index) => {
    if (universities.length > 1) {
      setUniversities(universities.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    updateLifeStory('earlyLife', {
      interests,
      bornIn,
      hometown,
      schools: schools.filter(s => s.name.trim()),
      universities: universities.filter(u => u.name.trim()),
      summary
    })
    completeLifeStory()
  }

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <div className="story-header-icon">{story.icon}</div>
        <h1 className="form-title">Confirm Your Early Life</h1>
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
          Interests
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

      {/* Birth & Hometown */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Birth & Hometown</span>
        </div>
        <div className="input-group">
          <label className="input-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
            </svg>
            Born in
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="City where you were born"
            value={bornIn}
            onChange={(e) => setBornIn(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Hometown
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Your hometown"
            value={hometown}
            onChange={(e) => setHometown(e.target.value)}
          />
        </div>
      </div>

      {/* Schools */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Schools</span>
        </div>
        {schools.map((school, idx) => (
          <div key={idx} className="entry-card">
            <div className="entry-fields">
              <input
                type="text"
                className="input-field"
                placeholder="School name"
                value={school.name}
                onChange={(e) => updateSchool(idx, 'name', e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Location"
                value={school.location}
                onChange={(e) => updateSchool(idx, 'location', e.target.value)}
              />
            </div>
            {schools.length > 1 && (
              <button type="button" className="entry-remove-btn" onClick={() => removeSchool(idx)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-entry-btn" onClick={addSchool}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add School
        </button>
      </div>

      {/* Universities */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Universities</span>
        </div>
        {universities.map((uni, idx) => (
          <div key={idx} className="entry-card">
            <div className="entry-fields">
              <input
                type="text"
                className="input-field"
                placeholder="University name"
                value={uni.name}
                onChange={(e) => updateUniversity(idx, 'name', e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Location"
                value={uni.location}
                onChange={(e) => updateUniversity(idx, 'location', e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Major / Degree"
                value={uni.major}
                onChange={(e) => updateUniversity(idx, 'major', e.target.value)}
              />
            </div>
            {universities.length > 1 && (
              <button type="button" className="entry-remove-btn" onClick={() => removeUniversity(idx)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-entry-btn" onClick={addUniversity}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add University
        </button>
      </div>

      {/* Summary */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Early Life Summary</span>
        </div>
        <div className="input-group">
          <textarea
            className="input-field textarea-field"
            placeholder="A brief summary of your early life..."
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

export default LifeStoryEarlyConfirm
