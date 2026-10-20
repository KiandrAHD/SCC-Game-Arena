import { useEffect, useRef, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useGameSession, elapsedMs } from '../../hooks/useGameSession'

const TOTAL = 20
export default function ReflexRushPage() {
  const game = useGameSession('reflex')
  const [round, setRound] = useState(0); const [hit, setHit] = useState(0); const [trap, setTrap] = useState(0); const [left, setLeft] = useState(40); const [target, setTarget] = useState(null); const startRef = useRef(0); const finishRef = useRef(false)
  const finish = async (h = hit, t = trap) => { if (finishRef.current) return; finishRef.current = true; const missed = TOTAL - h; try { await game.submit({ metrics: { targets_hit: h, targets_missed: missed, traps_hit: t, duration_ms: elapsedMs(startRef.current) } }); } catch { finishRef.current = false } }
  const next = () => { const isTrap = Math.random() < .25; setTarget({ x: 8 + Math.random() * 84, y: 12 + Math.random() * 76, trap: isTrap }); setRound((r) => r + 1) }
  useEffect(() => { if (game.state === 'playing') { startRef.current = performance.now(); next() } }, [game.state])
  useEffect(() => { if (game.state !== 'playing') return; const id = setInterval(() => { const remain = Math.max(0, 40 - Math.floor(elapsedMs(startRef.current) / 1000)); setLeft(remain); if (!remain || round >= TOTAL) finish() }, 250); return () => clearInterval(id) }, [game.state, round, hit, trap])
  const click = () => { if (!target || round > TOTAL) return; if (target.trap) { const t = trap + 1; setTrap(t); next() } else { const h = hit + 1; setHit(h); if (round >= TOTAL) finish(h, trap); else next() } }
  if (game.state === 'loading') return <Card className="max-w-xl mx-auto mt-8 text-center">Memuat progres...</Card>
  if (game.state === 'error') return <Card className="max-w-xl mx-auto mt-8 text-center"><p className="text-red-600 mb-4">{game.error}</p><Button onClick={() => game.refresh()}>Coba Lagi</Button></Card>
  if (game.state === 'completed') return <Card className="max-w-xl mx-auto mt-8 text-center"><h1 className="text-2xl font-bold mb-3">Reflex Rush sudah selesai</h1><Button as="link" to="/play/memory">Lanjut ke Memory Rush</Button></Card>
  if (game.state === 'ready') return <Card className="max-w-xl mx-auto mt-8 text-center"><Badge variant="primary">Game 1</Badge><h1 className="text-3xl font-bold mt-3 mb-3">Reflex Rush</h1><p className="text-muted mb-6">Klik target merah, hindari jebakan. 20 target dalam 40 detik.</p><Button size="lg" onClick={() => game.begin()}>Mulai Game</Button></Card>
  if (game.state === 'submitting') return <Card className="max-w-xl mx-auto mt-8 text-center">Menyimpan hasil resmi...</Card>
  return <div className="max-w-2xl mx-auto px-4 py-6"><div className="flex justify-between mb-4"><Badge variant="primary">Target {Math.min(round, TOTAL)}/{TOTAL}</Badge><strong className={left <= 5 ? 'text-red-600' : ''}>{left}s · {hit * 10 - trap * 5} poin</strong></div><Card className="relative h-[min(70vh,520px)] overflow-hidden bg-slate-100 touch-none" aria-label="Arena Reflex Rush"><button aria-label={target?.trap ? 'Jebakan' : 'Target'} onPointerDown={click} className={`absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg transition-transform active:scale-90 ${target?.trap ? 'bg-slate-500' : 'bg-red-500'} text-white`} style={{ left: `${target?.x || 50}%`, top: `${target?.y || 50}%`, transform: 'translate(-50%, -50%)' }}>{target?.trap ? '×' : '★'}</button></Card></div>
}
