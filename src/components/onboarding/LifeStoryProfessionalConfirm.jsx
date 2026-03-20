import { useState } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryProfessionalConfirm() {
  const { profileData, updateLifeStory, completeLifeStory } = useOnboarding()
  const storyData = profileData.lifeStories.professional
  const story = lifeStoryPrompts.professional

  // Local state for editable fields
  const [skills, setSkills] = useState(storyData.skills || [])
  const [newSkill, setNewSkill] = useState('')
  const [firstJob, setFirstJob] = useState(storyData.firstJob || { company: '', titles: [''] })
  const [subsequentJobs, setSubsequentJobs] = useState(
    storyData.subsequentJobs.length > 0
      ? storyData.subsequentJobs
      : [{ company: '', titles: [''] }]
  )
  const [summary, setSummary] = useState(storyData.summary || storyData.text || '')

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  // First Job handlers
  const updateFirstJobCompany = (value) => {
    setFirstJob({ ...firstJob, company: value })
  }

  const updateFirstJobTitle = (index, value) => {
    const updated = [...firstJob.titles]
    updated[index] = value
    setFirstJob({ ...firstJob, titles: updated })
  }

  const addFirstJobTitle = () => {
    setFirstJob({ ...firstJob, titles: [...firstJob.titles, ''] })
  }

  const removeFirstJobTitle = (index) => {
    if (firstJob.titles.length > 1) {
      setFirstJob({ ...firstJob, titles: firstJob.titles.filter((_, i) => i !== index) })
    }
  }

  // Subsequent Jobs handlers
  const updateSubsequentJob = (jobIndex, field, value) => {
    const updated = [...subsequentJobs]
    updated[jobIndex][field] = value
    setSubsequentJobs(updated)
  }

  const updateSubsequentJobTitle = (jobIndex, titleIndex, value) => {
    const updated = [...subsequentJobs]
    updated[jobIndex].titles[titleIndex] = value
    setSubsequentJobs(updated)
  }

  const addSubsequentJobTitle = (jobIndex) => {
    const updated = [...subsequentJobs]
    updated[jobIndex].titles.push('')
    setSubsequentJobs(updated)
  }

  const removeSubsequentJobTitle = (jobIndex, titleIndex) => {
    const updated = [...subsequentJobs]
    if (updated[jobIndex].titles.length > 1) {
      updated[jobIndex].titles = updated[jobIndex].titles.filter((_, i) => i !== titleIndex)
      setSubsequentJobs(updated)
    }
  }

  const addSubsequentJob = () => {
    setSubsequentJobs([...subsequentJobs, { company: '', titles: [''] }])
  }

  const removeSubsequentJob = (index) => {
    if (subsequentJobs.length > 1) {
      setSubsequentJobs(subsequentJobs.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    updateLifeStory('professional', {
      skills,
      firstJob: firstJob.company.trim() ? firstJob : null,
      subsequentJobs: subsequentJobs.filter(j => j.company.trim()),
      summary
    })
    completeLifeStory()
  }

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <div className="story-header-icon">{story.icon}</div>
        <h1 className="form-title">Confirm Your Professional Life</h1>
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

      {/* Skills Tags */}
      <div className="confirm-section">
        <label className="input-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          Skills & Expertise
        </label>
        <div className="tags-container">
          {skills.map((skill, idx) => (
            <span key={idx} className="tag">
              {skill}
              <button type="button" className="tag-remove" onClick={() => removeSkill(idx)}>×</button>
            </span>
          ))}
        </div>
        <div className="tag-input-row">
          <input
            type="text"
            className="input-field"
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleSkillKeyPress}
          />
          <button type="button" className="add-tag-btn" onClick={addSkill}>Add</button>
        </div>
      </div>

      {/* First Job */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>First Job</span>
        </div>
        <div className="job-entry-card">
          <div className="input-group">
            <label className="input-label small">Company</label>
            <input
              type="text"
              className="input-field"
              placeholder="Company name"
              value={firstJob.company}
              onChange={(e) => updateFirstJobCompany(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label small">Titles</label>
            <div className="titles-list">
              {firstJob.titles.map((title, idx) => (
                <div key={idx} className="title-input-row">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Job title"
                    value={title}
                    onChange={(e) => updateFirstJobTitle(idx, e.target.value)}
                  />
                  {firstJob.titles.length > 1 && (
                    <button type="button" className="title-remove-btn" onClick={() => removeFirstJobTitle(idx)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-title-btn" onClick={addFirstJobTitle}>+ Add Title</button>
            </div>
          </div>
        </div>
      </div>

      {/* Subsequent Jobs */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Subsequent Jobs</span>
        </div>
        {subsequentJobs.map((job, jobIdx) => (
          <div key={jobIdx} className="job-entry-card">
            <div className="job-entry-header">
              {subsequentJobs.length > 1 && (
                <button type="button" className="entry-remove-btn" onClick={() => removeSubsequentJob(jobIdx)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="input-group">
              <label className="input-label small">Company</label>
              <input
                type="text"
                className="input-field"
                placeholder="Company name"
                value={job.company}
                onChange={(e) => updateSubsequentJob(jobIdx, 'company', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label small">Titles</label>
              <div className="titles-list">
                {job.titles.map((title, titleIdx) => (
                  <div key={titleIdx} className="title-input-row">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Job title"
                      value={title}
                      onChange={(e) => updateSubsequentJobTitle(jobIdx, titleIdx, e.target.value)}
                    />
                    {job.titles.length > 1 && (
                      <button type="button" className="title-remove-btn" onClick={() => removeSubsequentJobTitle(jobIdx, titleIdx)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-title-btn" onClick={() => addSubsequentJobTitle(jobIdx)}>+ Add Title</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="add-entry-btn" onClick={addSubsequentJob}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Job
        </button>
      </div>

      {/* Summary */}
      <div className="confirm-section">
        <div className="section-divider-line">
          <span>Professional Life Summary</span>
        </div>
        <div className="input-group">
          <textarea
            className="input-field textarea-field"
            placeholder="A brief summary of your professional journey..."
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

export default LifeStoryProfessionalConfirm
