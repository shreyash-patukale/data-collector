export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12v.01M8.464 8.464a5 5 0 000 7.072M15.536 8.464a5 5 0 010 7.072" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-white mb-2">You're offline</h1>
      <p className="text-gray-500 text-sm max-w-xs">
        HydroTrack requires an internet connection to sync data. Please reconnect to continue.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 bg-brand-500 text-black font-semibold rounded-xl px-6 py-3 text-sm"
      >
        Try again
      </button>
    </div>
  )
}
