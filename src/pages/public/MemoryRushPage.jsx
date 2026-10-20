import { useEffect, useRef, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useGameSession, elapsedMs } from '../../hooks/useGameSession'
const tiles = [{name:'Lingkaran',c:'bg-red-500'},{name:'Kotak',c:'bg-blue-500'},{name:'Segitiga',c:'bg-amber-500'},{name:'Bintang',c:'bg-emerald-500'}]
export default function MemoryRushPage() {
 const game=useGameSession('memory'), [round,setRound]=useState(1),[correct,setCorrect]=useState(0),[mistakes,setMistakes]=useState(0),[pattern,setPattern]=useState([]),[answer,setAnswer]=useState([]),[showing,setShowing]=useState(false),[lit,setLit]=useState(-1),start=useRef(0),done=useRef(false),timers=useRef([])
 const clear=()=>{timers.current.forEach(clearTimeout);timers.current=[]}; useEffect(()=>()=>clear(),[])
 const end=async(c=correct,m=mistakes)=>{if(done.current)return;done.current=true;try{await game.submit({metrics:{rounds_correct:c,mistakes:m,duration_ms:elapsedMs(start.current)}})}catch{done.current=false}}
 const present=(r)=>{clear(); const p=Array.from({length:r+1},()=>Math.floor(Math.random()*4));setPattern(p);setAnswer([]);setShowing(true); p.forEach((v,i)=>timers.current.push(setTimeout(()=>setLit(v),500+i*700), i*700));timers.current.push(setTimeout(()=>{setLit(-1);setShowing(false)},p.length*700+200))}
 useEffect(()=>{if(game.state==='playing'){start.current=performance.now();present(1)}},[game.state])
 const choose=(v)=>{if(showing||done.current)return;const a=[...answer,v];setAnswer(a);if(v!==pattern[a.length-1]){const m=mistakes+1;setMistakes(m);if(m>=3)end(correct,m);else present(round);return}if(a.length===pattern.length){const c=correct+1;setCorrect(c);if(c>=8)end(c,mistakes);else {setRound(r=>r+1);timers.current.push(setTimeout(()=>present(round+1),500))}}}
 if(game.state==='loading')return <Card className="max-w-xl mx-auto mt-8 text-center">Memuat progres...</Card>
 if(game.state==='error')return <Card className="max-w-xl mx-auto mt-8 text-center"><p className="text-red-600 mb-4">{game.error}</p><Button onClick={()=>game.refresh()}>Coba Lagi</Button></Card>
 if(game.state==='completed')return <Card className="max-w-xl mx-auto mt-8 text-center"><h1 className="text-2xl font-bold mb-4">Memory Rush sudah selesai</h1><Button as="link" to="/play/quiz">Lanjut ke Quiz Blitz</Button></Card>
 if(game.state==='ready')return <Card className="max-w-xl mx-auto mt-8 text-center"><Badge variant="primary">Game 2</Badge><h1 className="text-3xl font-bold my-3">Memory Rush</h1><p className="text-muted mb-6">8 ronde. Pola berisi 2–9 simbol. Tiga kesalahan mengakhiri permainan.</p><Button size="lg" onClick={()=>game.begin()}>Mulai Game</Button></Card>
 if(game.state==='submitting')return <Card className="max-w-xl mx-auto mt-8 text-center">Menyimpan hasil resmi...</Card>
 return <div className="max-w-xl mx-auto p-4"><div className="flex justify-between mb-4"><Badge variant="primary">Ronde {round}/8</Badge><strong>{correct*25} poin · Kesalahan {mistakes}/3</strong></div><Card><p className="text-center mb-5 font-semibold" aria-live="polite">{showing?'Amati pola':'Ulangi pola'}</p><div className="grid grid-cols-2 gap-4">{tiles.map((t,i)=><button key={t.name} aria-label={t.name} disabled={showing} onClick={()=>choose(i)} className={`min-h-28 rounded-xl text-white font-bold text-lg touch-manipulation ${t.c} ${lit===i?'ring-8 ring-offset-4 ring-primary scale-105':'opacity-85'} disabled:opacity-70`}>{t.name}</button>)}</div></Card></div>
}
