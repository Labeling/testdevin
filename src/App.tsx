import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <CardTitle>Robot Framework Log Viewer</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* URL Input */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="url" className="sr-only">Log URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter Robot Framework log URL"
                  className="w-full"
                />
              </div>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-blue-600" 
                onClick={loadHtmlContent} 
                role="button" 
                tabIndex={0}
              >
                <Upload className="w-5 h-5" />
                <span>Load</span>
              </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading log content...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading log content...</p>
        </div>
      )}
    </div>
  )
}

export default App
