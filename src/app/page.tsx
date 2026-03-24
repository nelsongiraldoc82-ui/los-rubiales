function SignatureCanvas({ onSignatureChange, label, clearLabel, placeholder }: {
  onSignatureChange: (s: string | null) => void
  label: string
  clearLabel: string
  placeholder: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSig, setHasSig] = useState(false)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = c.offsetWidth || 300
    c.height = 150
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(20, c.height - 30)
      ctx.lineTo(c.width - 20, c.height - 30)
      ctx.stroke()
      ctx.strokeStyle = '#1e40af'  // AZUL OSCURO
      ctx.lineWidth = 3.5            // MÁS GRUESO
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [])

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current
    if (!c) return null
    const rect = c.getBoundingClientRect()
    const scaleX = c.width / rect.width
    const scaleY = c.height / rect.height
    const touch = 'touches' in e ? e.touches[0] : e
    return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
  }

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const coords = getCoords(e)
    if (!coords) return
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) { ctx.beginPath(); ctx.moveTo(coords.x, coords.y) }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const coords = getCoords(e)
    if (!coords) return
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) { ctx.lineTo(coords.x, coords.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(coords.x, coords.y) }
    setHasSig(true)
  }

  const stop = () => {
    if (isDrawing && hasSig) onSignatureChange(canvasRef.current?.toDataURL('image/png') || null)
    setIsDrawing(false)
  }

  const clear = () => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!ctx || !c) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(20, c.height - 30)
    ctx.lineTo(c.width - 20, c.height - 30)
    ctx.stroke()
    ctx.strokeStyle = '#1e40af'  // AZUL OSCURO
    ctx.lineWidth = 3.5            // MÁS GRUESO
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setHasSig(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold text-green-800">{label}</Label>
      <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-white relative">
        <canvas ref={canvasRef} className="w-full h-40 cursor-crosshair touch-none"
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
        {!hasSig && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-gray-300 italic">{placeholder}</span></div>}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={clear}><RotateCcw className="h-4 w-4 mr-2" />{clearLabel}</Button>
    </div>
  )
}
