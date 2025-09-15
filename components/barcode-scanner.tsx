"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrowserMultiFormatReader } from "@zxing/browser"

interface BarcodeScannerProps {
  onScan: (barcode: string) => string | null
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "">("")
  const [codeReader] = useState(new BrowserMultiFormatReader())

  // simpan object controls dari decodeFromVideoDevice
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    let canceled = false
    setIsScanning(true)

    if (videoRef.current) {
      controlsRef.current = codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err, controls) => {
          if (canceled) return

          // simpan controls biar bisa di-stop manual
          if (!controlsRef.current) {
            controlsRef.current = controls
          }

          if (videoRef.current?.srcObject) {
            streamRef.current = videoRef.current.srcObject as MediaStream
          }

          if (result) {
            const text = result.getText()
            const productName = onScan(text)

            if (productName) {
              setFeedback(`${productName} berhasil ditambahkan!`)
              setFeedbackType("success")
              playBeepSound()
              setTimeout(() => handleClose(), 1500)
            } else {
              setFeedback("Barcode tidak ditemukan di database.")
              setFeedbackType("error")
            }
          }
        }
      )
    }

    return () => {
      canceled = true
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopCamera = () => {
    // hentikan decoding ZXing langsung
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }

    // hentikan track stream manual kalau masih aktif
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current?.srcObject) {
      ;(videoRef.current.srcObject as MediaStream)
        ?.getTracks()
        .forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    codeReader.reset()
    setIsScanning(false)
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  const handleManualInput = () => {
    const barcode = prompt("Masukkan barcode secara manual:")
    if (barcode) {
      const productName = onScan(barcode)
      if (productName) {
        setFeedback(`${productName} berhasil ditambahkan!`)
        setFeedbackType("success")
        playBeepSound()
        setTimeout(() => handleClose(), 1500)
      } else {
        setFeedback("Barcode tidak ditemukan dalam database.")
        setFeedbackType("error")
      }
    }
  }

  const playBeepSound = () => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "square"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Scanner Barcode</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Camera */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-48 bg-gray-900 rounded-lg object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-pink-500 w-48 h-24 relative">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-pink-500 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Arahkan kamera ke barcode produk
            </p>
            {isScanning && (
              <p className="text-green-600 text-sm mt-1 animate-pulse">
                Kamera aktif
              </p>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`text-center p-3 rounded-lg ${
                feedbackType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <p className="text-sm font-medium">{feedback}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManualInput} className="flex-1">
              Input Manual
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Tutup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
