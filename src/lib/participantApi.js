import { supabase } from './supabase'

const TOKEN_KEY = 'scc_game_participant_token'

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function getParticipantToken() {
  const persistent = storage()
  return persistent?.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function saveParticipantToken(token) {
  if (typeof token === 'string' && token) storage()?.setItem(TOKEN_KEY, token)
}

export function clearParticipantToken() {
  storage()?.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

async function invoke(name, options = {}) {
  if (!supabase) throw new Error('CONFIGURATION')
  const { data, error } = await supabase.functions.invoke(name, options)
  if (error) {
    let body = null
    try { body = await error.context?.json() } catch { /* response may not be JSON */ }
    const failure = new Error(body?.error || error.message || 'Request failed')
    failure.status = error.status || error.context?.status
    failure.details = body?.details
    throw failure
  }
  return data
}

export function registerParticipant(payload) {
  return invoke('register-participant', { body: payload })
}

export function getProgress() {
  const token = getParticipantToken()
  if (!token) throw new Error('NO_SESSION')
  return invoke('get-progress', { body: { token } })
}

export function startGame(gameKey) {
  const token = getParticipantToken()
  if (!token) throw new Error('NO_SESSION')
  return invoke('start-game', { body: { participant_token: token, game_key: gameKey } })
}

export function submitGameResult(gameKey, payload) {
  const token = getParticipantToken()
  if (!token) throw new Error('NO_SESSION')
  return invoke('submit-game-result', {
    body: { participant_token: token, game_key: gameKey, ...payload },
  })
}

export function getPublicLeaderboard() {
  return invoke('get-public-leaderboard', { method: 'GET' })
}

export function userMessage(error) {
  if (error?.status === 409) return error.message || 'Data sudah terdaftar atau game sudah diselesaikan.'
  if (error?.status === 503) return 'Kompetisi sedang tidak menerima pendaftaran.'
  if (error?.status === 401 || error?.message === 'NO_SESSION') return 'Sesi peserta tidak ditemukan atau sudah kedaluwarsa.'
  if (error?.message === 'CONFIGURATION') return 'Layanan permainan belum dikonfigurasi.'
  if (error?.status === 400) return error.message || 'Data yang dikirim belum valid.'
  return 'Koneksi ke server gagal. Periksa koneksi lalu coba lagi.'
}
