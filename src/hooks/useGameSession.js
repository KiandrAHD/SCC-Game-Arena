import { useCallback, useEffect, useRef, useState } from 'react'
import { getProgress, startGame, submitGameResult, userMessage } from '../lib/participantApi'

const order = ['reflex', 'memory', 'quiz']

export function useGameSession(gameKey) {
  const [progress, setProgress] = useState(null)
  const [state, setState] = useState('loading')
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const submittedRef = useRef(false)
  const idempotencyKeyRef = useRef(null)
  const startedAtRef = useRef(0)

  const refresh = useCallback(async () => {
    setState('loading'); setError('')
    try {
      const value = await getProgress()
      setProgress(value)
      const index = order.indexOf(gameKey)
      const games = value.games || {}
      if (games[gameKey]?.completed) setState('completed')
      else if (index > 0 && !games[order[index - 1]]?.completed) {
        setError('Selesaikan game sebelumnya terlebih dahulu.'); setState('error')
      } else setState('ready')
      return value
    } catch (e) { setError(userMessage(e)); setState('error'); throw e }
  }, [gameKey])

  useEffect(() => { refresh().catch(() => {}) }, [refresh])

  const begin = useCallback(async () => {
    setState('loading'); setError('')
    try {
      const value = await startGame(gameKey)
      setSession(value); startedAtRef.current = performance.now(); setState('playing')
      return value
    } catch (e) { setError(userMessage(e)); setState('error'); throw e }
  }, [gameKey])

  const submit = useCallback(async (payload) => {
    if (submittedRef.current) return null
    submittedRef.current = true; setState('submitting'); setError('')
    const storageKey = `scc_result_key_${gameKey}`
    let key = idempotencyKeyRef.current
    try {
      if (!key) key = sessionStorage.getItem(storageKey)
      if (!key) { key = crypto.randomUUID(); sessionStorage.setItem(storageKey, key) }
    } catch {
      key = crypto.randomUUID()
    }
    idempotencyKeyRef.current = key
    try {
      const value = await submitGameResult(gameKey, { ...payload, idempotency_key: key })
      setState('completed'); setProgress((p) => p)
      return value
    } catch (e) { submittedRef.current = false; setError(userMessage(e)); setState('error'); throw e }
  }, [gameKey])

  return { progress, state, error, session, begin, submit, refresh, startedAt: startedAtRef.current }
}

export function elapsedMs(start) { return Math.max(0, Math.round(performance.now() - start)) }
