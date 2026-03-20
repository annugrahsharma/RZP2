import { useState } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryPrompts({ storyKey }) {
  const { goToInputMethodSelection } = useOnboarding()
  const [promptsExpanded, setPromptsExpanded] = useState(true)

  const story = lifeStoryPrompts[storyKey]

  const renderPromptList = () => {
    // Current life has sections (Personal & Professional)
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

    // Other stories have a flat list with optional intro text
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
        <h1 className="form-title">{story.title}</h1>
        <p className="form-subtitle">{story.subtitle}</p>
      </div>

      <div className="video-prompt-list">
        <button
          type="button"
          className="prompt-collapse-btn"
          onClick={() => setPromptsExpanded(!promptsExpanded)}
        >
          <span className="prompt-intro">What you can talk about:</span>
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

      <div className="prompts-action-note">
        <p>Take your time to think about your journey. In the next step, you'll choose how you'd like to share — via video, audio, or text.</p>
      </div>

      <button className="btn-primary" onClick={goToInputMethodSelection}>
        I'm Ready - Choose Input Method
      </button>
    </div>
  )
}

export default LifeStoryPrompts
