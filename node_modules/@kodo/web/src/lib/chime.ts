/** Synthesise a soft bell chime using Web Audio API */
export function playChime() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    const frequencies = [523.25, 659.25, 783.99]  // C5 E5 G5 — gentle major chord
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.08)

      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.8)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 1.8)
    })
  } catch {}
}
