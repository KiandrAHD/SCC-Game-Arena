import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { getProgress, startGame, userMessage } from '../../lib/participantApi'

const config = {
  reflex: { title: 'Reflex Rush', number: 1, path: '/play/reflex', description: 'Klik target dan hindari jebakan selama 40 detik.', rules: ['20 target', '+10 untuk target benar', '-5 untuk jebakan'], next: '/prepare/memory' },
  memory: { title: 'Memory Rush', number: 2, path: '/play/memory', description: 'Ingat pola dan ulangi dengan tepat.', rules: ['8 ronde', '+25 setiap ronde benar', '3 kesalahan mengakhiri game'], next: '/prepare/quiz' },
  quiz: { title: 'Quiz Blitz', number: 3, path: '/play/quiz', description: 'Jawab 10 pertanyaan dari server.', rules: ['10 soal', '+20 jawaban benar', '10 detik setiap soal'], next: '/result' },
}

export default function PrepareGamePage() {
  const params = useParams()
  const gameKey = params.gameKey || 'reflex'
  const item = config[gameKey] || config.reflex
  const navigate = useNavigate()
  const [state, setState] = useState('loading')
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const load = async () => { setState('loading'); setError(''); try { const data = await getProgress(); setProgress(data); const game = data.games?.[gameKey]; const previous = gameKey === 'reflex' || data.games?.[gameKey === 'memory' ? 'reflex' : 'memory']?.completed; if (game?.completed) { navigate(item.next, { replace: true }); return } if (!previous) { setError('Game ini belum diizinkan oleh progres server.'); setState('error'); return } setState('ready') } catch (e) { setError(userMessage(e)); setState('error') } }
  useEffect(() => { load() }, [gameKey])
  const begin = async () => { if (starting) return; setStarting(true); setError(''); try { await startGame(gameKey); navigate(item.path) } catch (e) { setError(userMessage(e)); setStarting(false) } }
  if (state === 'loading') return <Card className="max-w-xl mx-auto mt-8 text-center">Memeriksa progres peserta...</Card>
  if (state === 'error') return <Card className="max-w-xl mx-auto mt-8 text-center"><p className="text-red-600 mb-4">{error}</p><Button onClick={load}>Coba Lagi</Button><Button variant="ghost" className="ml-2" onClick={() => navigate('/')}>Kembali ke Beranda</Button></Card>
  return <Card className="max-w-xl mx-auto mt-8"><Badge variant="primary">Game {item.number}</Badge><h1 className="text-3xl font-bold text-text mt-3">{item.title}</h1><p className="text-muted mt-2">{item.description}</p><ul className="my-6 space-y-2 list-disc list-inside">{item.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul><p className="text-sm text-muted mb-5">Progres server: {progress?.games?.[gameKey]?.completed ? 'Selesai' : 'Belum selesai'}</p>{error && <p className="text-red-600 mb-4" role="alert">{error}</p>}<Button size="lg" loading={starting} onClick={begin}>Mulai Game</Button></Card>
}
