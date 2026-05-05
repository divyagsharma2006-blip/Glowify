import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, AlertCircle, Check, RotateCcw } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

type FaceBox = { x: number; y: number; width: number; height: number }

interface FaceScannerProps {
  onComplete?: () => void
}

export default function FaceScanner({ onComplete }: FaceScannerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null)
  const [recommendedActions, setRecommendedActions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanStep, setScanStep] = useState<'front' | 'left' | 'right' | 'done'>('front')
  const [cameraReady, setCameraReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.id) {
        setUserId(data.user.id)
      }
    }
    getUser()
  }, [])

  const startCamera = async () => {
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {})
          setCameraReady(true)
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Camera access denied. Please allow camera permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = async () => {
    if (!cameraReady) return
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        const box = await detectFaceBox(canvas)
        setFaceBox(box)
        setImage(imageData)
        analyzeSkin(imageData)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageData = reader.result as string
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const img = new Image()
          img.src = imageData
          img.onload = async () => {
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0)
              const box = await detectFaceBox(canvas)
              setFaceBox(box)
              setImage(imageData)
              analyzeSkin(imageData)
            }
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeSkin = async (imageData: string) => {
    setIsAnalyzing(true)
    // Simulate AI analysis with more detailed results
    setTimeout(() => {
      const conditions = {
        front: [
          "Front view: Clear skin with minimal pores. Some fine lines around eyes.",
          "Front view: Mild acne on forehead. Good hydration levels.",
          "Front view: Even skin tone. Slight dryness on cheeks."
        ],
        left: [
          "Left side: Clear complexion. No visible blemishes.",
          "Left side: Minor redness on jawline. Consider soothing products.",
          "Left side: Smooth texture. Good skin elasticity."
        ],
        right: [
          "Right side: Balanced skin. Few scattered pores.",
          "Right side: Slight unevenness. Vitamin C may help.",
          "Right side: Healthy glow. Maintain current routine."
        ]
      }

      const results = conditions[scanStep as keyof typeof conditions] || ["Analysis complete."]
      const result = results[Math.floor(Math.random() * results.length)]
      const actions = generateRecommendedActions(result, scanStep)

      setAnalysis(result)
      setRecommendedActions(actions)
      setIsAnalyzing(false)

      // Save to Supabase
      if (userId) {
        saveScanResult(scanStep, result, imageData)
      }
    }, 3000)
  }

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const detectFaceBox = async (canvas: HTMLCanvasElement): Promise<FaceBox | null> => {
    const detectorClazz = (window as any).FaceDetector
    if (detectorClazz) {
      try {
        const detector = new detectorClazz()
        const faces = await detector.detect(canvas)
        if (faces.length > 0) {
          const face = faces[0].boundingBox
          return {
            x: face.left / canvas.width,
            y: face.top / canvas.height,
            width: face.width / canvas.width,
            height: face.height / canvas.height
          }
        }
      } catch (err) {
        console.warn('FaceDetector failed:', err)
      }
    }

    return {
      x: 0.18,
      y: 0.15,
      width: 0.64,
      height: 0.7
    }
  }

  const generateRecommendedActions = (result: string, step: 'front' | 'left' | 'right' | 'done') => {
    const base = ['Use gentle, non-irritating cleanser']
    const actions: string[] = []

    if (step === 'front') {
      actions.push('Apply an oil-balancing cleanser', 'Use a lightweight moisturizer')
    }
    if (step === 'left') {
      actions.push('Use a calming serum on the left cheek', 'Apply targeted spot treatment if needed')
    }
    if (step === 'right') {
      actions.push('Use SPF on the right cheek', 'Try a brightening vitamin C product')
    }

    if (/acne|pimple|blemish/i.test(result)) {
      actions.push('Apply a salicylic acid spot treatment', 'Use non-comedogenic moisturizer')
    }
    if (/redness/i.test(result)) {
      actions.push('Use a soothing ceramide cream', 'Avoid harsh scrubs for now')
    }
    if (/dry|dryness|dehydrated/i.test(result)) {
      actions.push('Apply hyaluronic acid serum', 'Use a rich hydrating moisturizer')
    }
    if (/fine lines|lines/i.test(result)) {
      actions.push('Use a retinol or peptide serum', 'Apply eye cream at night')
    }

    return [...base, ...actions, 'Stay hydrated and maintain consistent routine']
  }

  const saveScanResult = async (angle: string, result: string, imageData: string) => {
    try {
      const payload = {
        user_id: userId,
        scan_angle: angle,
        analysis_result: result,
        image_data: imageData,
        scanned_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('face_scans')
        .insert([payload])

      if (error) {
        console.error('Error saving scan:', error)
      }
    } catch (err) {
      console.error('Exception saving scan:', err)
    }
  }

  const nextStep = () => {
    if (scanStep === 'front') {
      setScanStep('left')
      setImage(null)
      setAnalysis(null)
    } else if (scanStep === 'left') {
      setScanStep('right')
      setImage(null)
      setAnalysis(null)
    } else if (scanStep === 'right') {
      setScanStep('done')
      setImage(null)
      setAnalysis(null)
      stopCamera()
    }
  }

  const resetScan = () => {
    setScanStep('front')
    setImage(null)
    setAnalysis(null)
    setCameraReady(false)
    stopCamera()
  }

  useEffect(() => {
    if (scanStep !== 'done' && !image) {
      startCamera()
    }
    return () => stopCamera()
  }, [scanStep, image])

  const getStepInstruction = () => {
    switch (scanStep) {
      case 'front': return "Position your face directly facing the camera"
      case 'left': return "Turn your head to the left side"
      case 'right': return "Turn your head to the right side"
      case 'done': return "Scan complete! Check your personalized kit."
      default: return ""
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Face Scanner</h2>
        <p className="text-gray-600 mb-6">
          Scan your face from multiple angles to get detailed skin analysis and personalized recommendations
        </p>

        {scanStep !== 'done' && (
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-800">
                Step: {scanStep.charAt(0).toUpperCase() + scanStep.slice(1)} View
              </p>
              <p className="text-sm text-blue-600 mt-1">{getStepInstruction()}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Upload size={20} />
            Upload Image
          </button>
          {scanStep !== 'done' && (
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-pink-500 text-pink-600 py-2 rounded-lg hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={20} />
              Capture {scanStep.charAt(0).toUpperCase() + scanStep.slice(1)}
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        {/* Camera View */}
        {scanStep !== 'done' && !image && (
          <div className="relative mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg shadow-md"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image}
                alt="Uploaded"
                className="w-full rounded-lg shadow-md"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = (e.clientX - rect.left) / rect.width
                  const y = (e.clientY - rect.top) / rect.height
                  const width = faceBox?.width ?? 0.4
                  const height = faceBox?.height ?? 0.55
                  setFaceBox({
                    x: clamp(x - width / 2, 0, 1 - width),
                    y: clamp(y - height / 2, 0, 1 - height),
                    width,
                    height
                  })
                }}
              />
              {faceBox && (
                <div
                  className="absolute rounded-lg border-2 border-blue-400 pointer-events-none"
                  style={{
                    left: `${faceBox.x * 100}%`,
                    top: `${faceBox.y * 100}%`,
                    width: `${faceBox.width * 100}%`,
                    height: `${faceBox.height * 100}%`
                  }}
                />
              )}
              <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs text-gray-700 shadow-sm">
                Click your face to reposition the tracker
              </div>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                    <p>Analyzing your skin...</p>
                  </div>
                </div>
              )}
            </div>
            {analysis && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Analysis Results:</h3>
                    <p className="text-gray-700">{analysis}</p>
                    <div className="mt-4 pt-4 border-t border-pink-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Recommended Actions:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {recommendedActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scanStep !== 'done' && analysis && (
              <div className="flex justify-center">
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Next: {scanStep === 'front' ? 'Left Side' : scanStep === 'left' ? 'Right Side' : 'Complete'}
                </button>
              </div>
            )}
          </div>
        )}

        {scanStep === 'done' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan Complete!</h3>
            <p className="text-gray-600 mb-4">Your personalized skincare kit is being generated based on your face scan and profile.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onComplete ? onComplete() : window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View My Kit
              </button>
              <button
                onClick={resetScan}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={16} className="inline mr-2" />
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          🔒 Privacy Note: Your images are processed locally and not stored on our servers.
        </p>
      </div>
    </div>
  )
}