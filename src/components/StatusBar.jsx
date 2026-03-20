function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-bar-time">09:39</span>
      <div className="status-bar-icons">
        {/* Cellular */}
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 22h2V10H2v12zm4 0h2V7H6v15zm4 0h2V4h-2v18zm4 0h2V7h-2v15zm4 0h2V2h-2v20z"/>
        </svg>
        {/* WiFi */}
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-6.62-2.73l1.42 1.42C8.23 15.3 10.04 14.5 12 14.5s3.77.8 5.2 2.19l1.42-1.42C16.7 13.4 14.46 12.5 12 12.5s-4.7.9-6.62 2.77zm-2.83-2.83l1.42 1.42C6.09 11.78 8.94 10.5 12 10.5s5.91 1.28 8.03 3.36l1.42-1.42C18.91 9.99 15.62 8.5 12 8.5s-6.91 1.49-9.45 3.94z"/>
        </svg>
        {/* Battery */}
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 4h-3V2h-4v2H7c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"/>
        </svg>
      </div>
    </div>
  )
}

export default StatusBar
