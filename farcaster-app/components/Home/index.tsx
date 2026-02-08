'use client'

import { FarcasterActions } from '@/components/Home/FarcasterActions'
import { User } from '@/components/Home/User'
import { WalletActions } from '@/components/Home/WalletActions'
import { NotificationActions } from './NotificationActions'
import CustomOGImageAction from './CustomOGImageAction'
import { Haptics } from './Haptics'
import { LiveEvents } from '@/components/Home/LiveEvents'
import { VotingPanel } from '@/components/Home/VotingPanel'
import { Leaderboard } from '@/components/Home/Leaderboard'
import { useState } from 'react'

type Tab = 'home' | 'events' | 'vote' | 'leaderboard'

export function Demo() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setActiveTab('vote')
  }

  const handleViewLeaderboard = (eventId: string) => {
    setSelectedEventId(eventId)
    setActiveTab('leaderboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        BlitzBoard - Quadratic Voting on Monad
      </h1>

      {/* Tab Navigation */}
      <div className="w-full max-w-4xl flex justify-center space-x-2">
        {(['home', 'events', 'vote', 'leaderboard'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-transparent text-gray-400 hover:text-white border border-[#333]'
            }`}
            onClick={() => {
              if (tab === 'vote' && !selectedEventId) setActiveTab('events')
              else if (tab === 'leaderboard' && !selectedEventId) setActiveTab('events')
              else setActiveTab(tab)
            }}
          >
            {tab === 'home' ? '🏠 Home' : tab === 'events' ? '🔥 Events' : tab === 'vote' ? '🗳️ Vote' : '🏆 Ranks'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {activeTab === 'home' && (
          <>
            <User />
            <FarcasterActions />
            <NotificationActions />
            <WalletActions />
            <CustomOGImageAction />
            <Haptics />
          </>
        )}
        {activeTab === 'events' && (
          <LiveEvents
            onSelectEvent={handleSelectEvent}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}
        {activeTab === 'vote' && (
          <VotingPanel
            eventId={selectedEventId}
            onBack={() => setActiveTab('events')}
            onViewLeaderboard={handleViewLeaderboard}
          />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard
            eventId={selectedEventId}
            onBack={() => setActiveTab('events')}
          />
        )}
      </div>
    </div>
  )
}
