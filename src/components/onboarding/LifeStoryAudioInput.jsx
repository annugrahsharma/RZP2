import { useState, useRef, useEffect } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryAudioInput({ storyKey }) {
  const { profileData, updateLifeStory, goToConfirmation } = useOnboarding()
  const storyData = profileData.lifeStories[storyKey]
  const story = lifeStoryPrompts[storyKey]

  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(storyData.audioUrl || null)
  const [recordingTime, setRecordingTime] = useState(0)
  const audioRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        updateLifeStory(storyKey, { audioBlob: blob, audioUrl: url })

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Unable to access microphone. Please ensure you have granted microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const retakeAudio = () => {
    setAudioUrl(null)
    setRecordingTime(0)
    updateLifeStory(storyKey, { audioBlob: null, audioUrl: null })
  }

  const handleSave = () => {
    goToConfirmation()
  }

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <div className="story-header-icon">{story.icon}</div>
        <h1 className="form-title">Record Your Audio</h1>
        <p className="form-subtitle">{story.subtitle}</p>
      </div>

      <div className="audio-recording-section">
        <div className="audio-container">
          {!audioUrl && !isRecording && (
            <div className="audio-placeholder">
              <div className="audio-icon-large">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <span>Ready to record</span>
            </div>
          )}

          {isRecording && (
            <div className="audio-recording-indicator">
              <div className="recording-pulse-ring"></div>
              <div className="audio-icon-recording">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <span className="recording-time">{formatTime(recordingTime)}</span>
              <span className="recording-label">Recording...</span>
            </div>
          )}

          {audioUrl && (
            <div className="audio-player-container">
              <audio ref={audioRef} src={audioUrl} controls className="audio-player" />
            </div>
          )}
        </div>

        <div className="audio-controls">
          {!audioUrl ? (
            <>
              {!isRecording ? (
                <button type="button" className="btn-record" onClick={startRecording}>
                  <span className="record-dot"></span>
                  Start Recording
                </button>
              ) : (
                <button type="button" className="btn-stop-record" onClick={stopRecording}>
                  <span className="stop-square"></span>
                  Stop Recording
                </button>
              )}
            </>
          ) : (
            <button type="button" className="btn-retake" onClick={retakeAudio}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Retake Audio
            </button>
          )}
        </div>

        <div className="video-tips">
          <p>Find a quiet space for the best audio quality.</p>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave}>
        {audioUrl ? 'Save & Continue' : 'Skip for now'}
      </button>

      <p className="skip-note">You can record this audio later from your profile.</p>
    </div>
  )
}

export default LifeStoryAudioInput
