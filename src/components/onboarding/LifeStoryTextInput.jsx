import { useState } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryTextInput({ storyKey }) {
  const { profileData, updateLifeStory, completeLifeStory } = useOnboarding()
  const storyData = profileData.lifeStories[storyKey]
  const story = lifeStoryPrompts[storyKey]

  const [text, setText] = useState(storyData.text || '')
  const [promptsExpanded, setPromptsExpanded] = useState(false)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleTextChange = (e) => {
    setText(e.target.value)
    updateLifeStory(storyKey, { text: e.target.value })
  }

  const handleSave = () => {
    completeLifeStory()
  }

  const renderPromptList = () => {
    if (story.sections) {
      return story.sections.map((section, idx) => (
        <div key={idx} className="prompt-section">
          <p className="prompt-section-title"><strong>{section.title}:</strong></p>
          <ul>
            {section.prompts.map((prompt, pIdx) => (
              <li key={pIdx}>{prompt}</li>
            ))}
          </ul>
        </div>
      ))
    }

    return (
      <>
        {story.introText && (
          <p className="prompt-intro-text">{story.introText}</p>
        )}
        <ul>
          {story.prompts.map((prompt, idx) => (
            <li key={idx}>{prompt}</li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <div className="story-header-icon">{story.icon}</div>
        <h1 className="form-title">Write Your Story</h1>
        <p className="form-subtitle">{story.subtitle}</p>
      </div>

      <div className="video-prompt-list collapsed-by-default">
        <button
          type="button"
          className="prompt-collapse-btn"
          onClick={() => setPromptsExpanded(!promptsExpanded)}
        >
          <span className="prompt-intro">Prompts to help you write:</span>
          <svg
            className={`collapse-chevron ${promptsExpanded ? 'expanded' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        {promptsExpanded && (
          <div className="prompt-content">
            {renderPromptList()}
          </div>
        )}
      </div>

      <div className="text-input-section">
        <div className="input-group">
          <textarea
            className="input-field textarea-field text-story-input"
            value={text}
            onChange={handleTextChange}
            placeholder="Share your story here..."
            rows={10}
          />
          <div className="word-counter-row">
            <span className="word-counter">{wordCount} words</span>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave}>
        {text.trim() ? 'Save & Continue' : 'Skip for now'}
      </button>

      <p className="skip-note">You can add or edit this text later from your profile.</p>
    </div>
  )
}

export default LifeStoryTextInput
