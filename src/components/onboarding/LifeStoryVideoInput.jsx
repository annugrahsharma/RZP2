import { useState, useRef } from 'react'
import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStoryVideoInput({ storyKey }) {
  const { profileData, updateLifeStory, goToConfirmation } = useOnboarding()
  const storyData = profileData.lifeStories[storyKey]
  const story = lifeStoryPrompts[storyKey]

  const [isRecording, setIsRecording] = useState(false)
  const [videoUrl, setVideoUrl] = useState(storyData.videoUrl || null)
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
        setVideoUrl(url)
        updateLifeStory(storyKey, { videoBlob: blob, videoUrl: url })

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
    setVideoUrl(null)
    updateLifeStory(storyKey, { videoBlob: null, videoUrl: null })
  }

  const handleSave = () => {
    goToConfirmation()
  }

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <div className="story-header-icon">{story.icon}</div>
        <h1 className="form-title">Record Your Video</h1>
        <p className="form-subtitle">{story.subtitle}</p>
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

      <button className="btn-primary" onClick={handleSave}>
        {videoUrl ? 'Save & Continue' : 'Skip for now'}
      </button>

      <p className="skip-note">You can record this video later from your profile.</p>
    </div>
  )
}

export default LifeStoryVideoInput
