import React, { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

// Simple manual-entry + file upload based scanner (camera scanning would require extra libs)
export default function BarcodeScanner({ onFound, onClose }) {
  const [code, setCode] = useState('')
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      // Use browser barcode reading via BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        const img = document.createElement('img')
        img.src = URL.createObjectURL(file)
        img.onload = async () => {
          try {
            const detector = new window.BarcodeDetector({ formats: ['code_128', 'ean_13', 'ean_8'] })
            const results = await detector.detect(img)
            if (results && results.length) {
              onFound(results[0].rawValue)
            } else {
              toast.error('No barcode found in image')
            }
          } catch (err) {
            console.error('BarcodeDetector error', err)
            toast.error('Failed to read barcode from image')
          }
        }
      } else {
        toast.error('Camera scanning not supported in this browser. Use manual entry.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to process image')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="font-semibold mb-3">Scan Barcode</h3>
        <div className="space-y-3">
          <input placeholder="Enter barcode manually" value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-2 border rounded" />
          <div className="flex justify-between">
            <button onClick={() => { if (code.trim()) onFound(code.trim()) }} className="px-4 py-2 bg-primary-500 text-white rounded">Search</button>
            <div className="flex items-center space-x-2">
              <input ref={fileRef} onChange={handleFile} type="file" accept="image/*" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
