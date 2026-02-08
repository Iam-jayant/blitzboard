'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useFrame } from '@/components/farcaster-provider'
import { APP_URL } from '@/lib/constants'

interface LeaderboardEntry {
  rank: number
  submission_id: string
  project_title: string
  description: string | null
  project_link: string | null
  score: number
}

export function Leaderboard({
  eventId,
  onBack,
}: {
  eventId: string | null
  onBack: () => void
}) {
  const { actions } = useFrame()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (eventId) fetchLeaderboard(eventId)
  }, [eventId])

  async function fetchLeaderboard(eid: string) {
    setLoading(true)
    try {
      const { data: event } = await supabase
        .from('events')
        .select('name')
        .eq('id', eid)
        .single()

      if (event) setEventName(event.name)

      const { data } = await supabase
        .from('submissions')
        .select('id, project_title, description, project_link, score')
        .eq('event_id', eid)
        .order('score', { ascending: false })

      if (data) {
        setEntries(
          data.map((s, idx) => ({
            rank: idx + 1,
            submission_id: s.id,
            project_title: s.project_title,
            description: s.description,
            project_link: s.project_link,
            score: s.score || 0,
          }))
        )
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleShare() {
    if (!actions || !eventId) return
    actions.composeCast({
      text: `🏆 Check out the leaderboard for "${eventName}" on BlitzBoard!\n\nQuadratic voting powered by Monad ⚡`,
      embeds: [`${APP_URL}`],
    })
  }

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <span className="text-4xl">🏆</span>
        <p className="text-sm text-gray-400">Select an event first</p>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#836EF9] hover:underline"
        >
          ← Browse Events
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-[#1a1a2e] rounded animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-[#1a1a2e] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getBarWidth = (score: number) => {
    const maxScore = entries[0]?.score || 1
    return maxScore > 0 ? (score / maxScore) * 100 : 0
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-sm font-semibold truncate max-w-[180px]">{eventName}</h2>
        <button
          type="button"
          onClick={handleShare}
          className="text-xs text-[#836EF9] hover:underline"
        >
          Share
        </button>
      </div>

      <div className="bg-[#1a1a2e] rounded-xl p-3 border border-[#2a2a3e] text-center">
        <h3 className="text-lg font-bold text-[#836EF9]">🏆 Leaderboard</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">{entries.length} submissions</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No submissions yet
        </div>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.submission_id}
            className={`bg-[#1a1a2e] rounded-xl p-3 border ${
              entry.rank <= 3 ? 'border-[#836EF9]/30' : 'border-[#2a2a3e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg min-w-[28px] text-center">
                {getRankEmoji(entry.rank)}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{entry.project_title}</h4>
                {entry.description && (
                  <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                    {entry.description}
                  </p>
                )}
                {/* Score bar */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#0f0f23] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#836EF9] to-[#00D2FF] rounded-full transition-all"
                      style={{ width: `${getBarWidth(entry.score)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#836EF9] min-w-[32px] text-right">
                    {entry.score}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
