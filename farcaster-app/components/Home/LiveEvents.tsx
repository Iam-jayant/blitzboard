'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string
  end_date: string
  event_type: string | null
  submission_type: string
}

interface Submission {
  id: string
  project_title: string
  score: number
}

interface LiveEventData {
  event: Event
  submissions: Submission[]
  totalSubmissions: number
}

export function LiveEvents({
  onSelectEvent,
  onViewLeaderboard,
}: {
  onSelectEvent: (eventId: string) => void
  onViewLeaderboard: (eventId: string) => void
}) {
  const [events, setEvents] = useState<LiveEventData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLiveEvents()
  }, [])

  async function fetchLiveEvents() {
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['live', 'ended'])
        .order('start_date', { ascending: false })
        .limit(20)

      if (error) throw error

      const results: LiveEventData[] = []
      for (const event of eventsData || []) {
        const { data: submissions, count } = await supabase
          .from('submissions')
          .select('id, project_title, score', { count: 'exact' })
          .eq('event_id', event.id)
          .order('score', { ascending: false })
          .limit(3)

        results.push({
          event,
          submissions: submissions || [],
          totalSubmissions: count || 0,
        })
      }

      setEvents(results)
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Live Events</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1a1a2e] rounded-xl p-4 animate-pulse h-32" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <span className="text-4xl">📭</span>
        <h2 className="text-lg font-semibold">No Events Yet</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Events from BlitzBoard will appear here. Create one on the main app!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span>🔥</span> Events
      </h2>
      {events.map(({ event, submissions, totalSubmissions }) => (
        <div
          key={event.id}
          className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3e] overflow-hidden hover:border-[#3a3a4e] transition-colors"
        >
          {/* Event Header */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{event.name}</h3>
                {event.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 ${event.status === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {event.status === 'live' ? '● LIVE' : 'ENDED'}
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-3 text-[10px] text-gray-500 mb-3">
              <span>📊 {totalSubmissions} submissions</span>
              <span>🗳️ {event.submission_type}</span>
              {event.event_type && <span>🏷️ {event.event_type}</span>}
            </div>

            {/* Top Submissions Preview */}
            {submissions.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {submissions.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-[#0f0f23] rounded-lg px-3 py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-xs truncate">{sub.project_title}</span>
                    </div>
                    <span className="text-xs font-mono text-[#836EF9] ml-2">
                      {sub.score || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {event.status === 'live' && (
                <button
                  type="button"
                  onClick={() => onSelectEvent(event.id)}
                  className="flex-1 bg-[#836EF9] hover:bg-[#836EF9]/80 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  🗳️ Vote Now
                </button>
              )}
              <button
                type="button"
                onClick={() => onViewLeaderboard(event.id)}
                className="flex-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
