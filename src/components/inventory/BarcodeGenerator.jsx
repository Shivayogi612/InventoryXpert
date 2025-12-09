import React, { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

export default function BarcodeGenerator({ product, onClose }) {
  const svgRef = useRef(null)

  useEffect(() => {
    try {
      const code = product.barcode || product.sku || String(product.id)
      if (svgRef.current) {
        JsBarcode(svgRef.current, code, { format: 'CODE128', displayValue: true })
      }
    } catch (err) {
      console.error('Barcode generation failed', err)
    }
  }, [product])

  const download = () => {
    const svg = svgRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const str = serializer.serializeToString(svg)
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product.sku || product.id}-barcode.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
        <h3 className="font-semibold mb-4">Barcode — {product.name}</h3>
        <div className="flex flex-col items-center">
          <svg ref={svgRef} />
          <div className="mt-4 space-x-2">
            <button onClick={download} className="px-4 py-2 bg-primary-500 text-white rounded">Download</button>
            <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
