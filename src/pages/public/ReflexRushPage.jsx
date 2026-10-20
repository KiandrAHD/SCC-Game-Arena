import { useEffect, useRef, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useGameSession, elapsedMs } from '../../hooks/useGameSession'
const TOTAL = 20
const point = () => ({ x: 10 + Math.random() * 80, y: 12 + Math.random() * 72, dx: (Math.random() * 2 - 1), dy: (Math.random() * 2 - 1) })
export default function ReflexRushPage() {
 const game = useGameSession('reflex'); const [hit,setHit]=useState(0),[trap,setTrap]=useState(0),[left,setLeft]=useState(40),[target,setTarget]=useState(null),[decoy,setDecoy]=useState(null),[feedback,setFeedback]=useState(''); const start=useRef(0), done=useRef(false)
 const spawn=()=>{ setTarget(point()); setDecoy(Math.random()<.55 ? point() : null); setFeedback('') }
 const finish=async(h=hit,t=trap)=>{ if(done.current)return; done.current=true; try { await game.submit({metrics:{targets_hit:h,targets_missed:TOTAL-h,traps_hit:t,duration_ms:elapsedMs(start.current)}}) } catch { done.current=false } }
 useEffect(()=>{if(game.state==='playing'){start.current=performance.now();done.current=false;setHit(0);setTrap(0);spawn()}},[game.state])
 useEffect(()=>{if(game.state!=='playing')return;let frame;let last=performance.now();const tick=(now)=>{const dt=Math.min(32,now-last)/16;last=now;const speed=0.3+hit*.035;const move=(p)=>p&&({...p,x:Math.max(7,Math.min(93,p.x+p.dx*speed*dt)),y:Math.max(9,Math.min(91,p.y+p.dy*speed*dt)),dx:(p.x<=7||p.x>=93)?-p.dx:p.dx,dy:(p.y<=9||p.y>=91)?-p.dy:p.dy});setTarget(move);setDecoy(move);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);const timer=setInterval(()=>{const remain=Math.max(0,40-Math.floor(elapsedMs(start.current)/1000));setLeft(remain);if(!remain)finish()},200);return()=>{cancelAnimationFrame(frame);clearInterval(timer)}},[game.state,hit])
 const choose=(isTrap)=>{if(done.current||!target)return;if(isTrap){setTrap(v=>v+1);setFeedback('Jebakan! -5');setDecoy(null);return}const h=hit+1;setHit(h);setFeedback('+10');if(h===TOTAL)finish(h,trap);else spawn(h)}
 if(game.state==='loading')return <Card className="max-w-xl mx-auto mt-8 text-center">Memuat progres...</Card>
 if(game.state==='error')return <Card className="max-w-xl mx-auto mt-8 text-center"><p className="text-red-600 mb-4">{game.error}</p><Button onClick={game.refresh}>Coba Lagi</Button></Card>
 if(game.state==='completed')return <Card className="max-w-xl mx-auto mt-8 text-center"><h1 className="text-2xl font-bold mb-3">Reflex Rush sudah selesai</h1><Button as="link" to="/play/memory">Lanjut ke Memory Rush</Button></Card>
 if(game.state==='ready')return <Card className="max-w-xl mx-auto mt-8 text-center"><Badge variant="primary">Game 1</Badge><h1 className="text-3xl font-bold my-3">Reflex Rush</h1><p className="text-muted mb-6">Sentuh bintang bergerak, hindari jebakan. 20 target dalam 40 detik.</p><Button size="lg" onClick={game.begin}>Mulai Game</Button></Card>
 if(game.state==='submitting')return <Card className="max-w-xl mx-auto mt-8 text-center">Menyimpan hasil resmi...</Card>
 const object=(p,isTrap)=>p&&<button aria-label={isTrap?'Jebakan':'Target'} onPointerDown={()=>choose(isTrap)} className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg touch-manipulation active:scale-90 ${isTrap?'bg-slate-600':'bg-red-500'} text-white font-bold`} style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)'}}>{isTrap?'×':'★'}</button>
 return <div className="max-w-2xl mx-auto px-4 py-6"><div className="flex justify-between gap-3 mb-4"><Badge variant="primary">Target {hit}/{TOTAL}</Badge><strong className={left<=5?'text-red-600':''}>{left}s · {Math.max(0,hit*10-trap*5)} poin</strong></div><p className="h-6 text-center font-bold text-primary" aria-live="polite">{feedback}</p><Card className="relative h-[min(65vh,520px)] min-h-80 overflow-hidden bg-slate-100"><div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_#94a3b8_1px,_transparent_1px)] bg-[length:20px_20px]" />{object(target,false)}{object(decoy,true)}</Card></div>
}
