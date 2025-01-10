import * as React from 'react'
import { Camera, Sun } from 'lucide-react'
import { Slider } from './components/ui/slider'

const { useState, useRef, useEffect } = React

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [baseColor, setBaseColor] = useState('#800080') // Default purple
  const [saturation, setSaturation] = useState(100)
  const [brightness, setBrightness] = useState(100)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateBackgroundColor = (color: string, saturation: number, brightness: number) => {
    // Convert hex to HSL
    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
      else if (max === g) h = (b - r) / d + 2
      else if (max === b) h = (r - g) / d + 4
      h /= 6
    }

    // Adjust saturation
    s = (s * saturation) / 100

    // Convert back to RGB
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255)
    const newG = Math.round(hue2rgb(p, q, h) * 255)
    const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255)

    // Apply brightness
    const brightnessMultiplier = brightness / 100
    const finalR = Math.round(newR * brightnessMultiplier)
    const finalG = Math.round(newG * brightnessMultiplier)
    const finalB = Math.round(newB * brightnessMultiplier)

    return `rgb(${finalR}, ${finalG}, ${finalB})`
  }

  const backgroundColor = calculateBackgroundColor(baseColor, saturation, brightness)

  useEffect(() => {
    const startCamera = async () => {
      try {
        setError(null)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        setError('Please allow camera access to use this app')
      }
    }
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    const link = document.createElement('a')
    link.download = `photo-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-4 py-6 relative"
      style={{ 
        backgroundColor
      }}
    >
      <div className="w-full max-w-md space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        <div className="space-y-10">
          <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
            />
          </div>
          
          <div className="space-y-6">
            <button 
              className="w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-900 transition-colors" 
              onClick={capturePhoto}
            >
              <Camera className="w-6 h-6" />
              <span className="text-base font-semibold">Take Photo</span>
            </button>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-base font-semibold text-black">Background Color:</label>
                  <span className="text-base font-medium text-black">{baseColor}</span>
                </div>
                <div className="relative">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-full h-14 rounded-lg cursor-pointer border-2 border-black bg-transparent appearance-none"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-base font-semibold text-black">Color Saturation:</label>
                  <span className="text-base font-medium text-black">{saturation}%</span>
                </div>
                <div className="flex items-center gap-4 py-2">
                  <Sun className="w-6 h-6 text-black" />
                  <Slider
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                    aria-label="Color saturation"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-base font-semibold text-black">Background Brightness:</label>
                  <span className="text-base font-medium text-black">{brightness}%</span>
                </div>
                <div className="flex items-center gap-4 py-2">
                  <Sun className="w-6 h-6 text-black" />
                  <Slider
                    value={[brightness]}
                    onValueChange={([value]) => setBrightness(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                    aria-label="Background brightness"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
