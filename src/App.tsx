import { useState, useEffect } from 'react'

function App() {
  const [url, setUrl] = useState<string>('https://imgservice.blob.core.windows.net/testscreenshot/D-20250103181318.6777b83e43cead17fd93f52f.log.html?sp=r&st=2025-01-13T06:46:50Z&se=2025-01-13T14:46:50Z&spr=https&sv=2022-11-02&sr=b&sig=lmeyOhVDSf0xFXbztOBo4XwmlgSGqucJiBihlVtYpwA%3D')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadHtmlContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch HTML content')
      
      const content = await response.text()
      
      // Replace the current document's content
      document.open()
      document.write(content)
      document.close()
      
      setLoading(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      setLoading(false)
    }
  }

  // Load content when URL is provided
  useEffect(() => {
    if (url) {
      loadHtmlContent()
    }
  }, [])

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Robot Framework Log Viewer</h1>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="Enter Robot Framework log URL"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={loadHtmlContent}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading log content...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
