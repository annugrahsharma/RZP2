import { useState, useRef } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingVideoEarlyLife() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState(profileData.videoEarlyLife || null)
  const [videoUrl, setVideoUrl] = useState(profileData.videoEarlyLifeUrl || null)
  const [promptsExpanded, setPromptsExpanded] = useState(true)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      videoRef.current.srcObject = stream
      videoRef.current.play()

      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoBlob(blob)
        setVideoUrl(url)
        updateProfileData({ videoEarlyLife: blob, videoEarlyLifeUrl: url })

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
        videoRef.current.src = url
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Unable to access camera. Please ensure you have granted camera permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const retakeVideo = () => {
    setVideoBlob(null)
    setVideoUrl(null)
    updateProfileData({ videoEarlyLife: null, videoEarlyLifeUrl: null })
  }

  const validateAndNext = () => {
    nextStep()
  }

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">Let's Create Your Early Life Video / Audio</h1>
          <p className="form-subtitle">In this video / audio, tell gang members the story of your early life.</p>
        </div>

        <div className="video-prompt-list">
          <button
            type="button"
            className="prompt-collapse-btn"
            onClick={() => setPromptsExpanded(!promptsExpanded)}
          >
            <span className="prompt-intro">You can talk about:</span>
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
            <ul>
              <li>Places where you were born and grew up</li>
              <li>Various cities you lived in and experienced</li>
              <li>Family and parents</li>
              <li>Who were your friends — what did you do together?</li>
              <li>What were the things that interested you?</li>
              <li>Educational institutes you attended — schools, colleges, universities. Give some idea of timelines.</li>
              <li>Anything else that feels natural for this video / audio</li>
            </ul>
          )}
        </div>

        <div className="video-recording-section">
          <div className="video-container">
            <video
              ref={videoRef}
              className="video-preview"
              playsInline
              muted={isRecording}
              controls={!isRecording && videoUrl}
            />
            {!videoUrl && !isRecording && (
              <div className="video-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 7l-7 5 7 5V7z"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span>Camera preview</span>
              </div>
            )}
          </div>

          <div className="video-controls">
            {!videoUrl ? (
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
              <button type="button" className="btn-retake" onClick={retakeVideo}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Retake Video
              </button>
            )}
          </div>

          <div className="video-tips">
            <p>Find a quiet, well-lit space for best results.</p>
          </div>
        </div>

        <button className="btn-primary" onClick={validateAndNext}>
          {videoUrl ? 'Continue' : 'Skip for now'}
        </button>

        <p className="skip-note">You can record this video later from your profile.</p>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingVideoEarlyLife
