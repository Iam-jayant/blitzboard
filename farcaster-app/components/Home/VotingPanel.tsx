'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useFrame } from '@/components/farcaster-provider'
import { AGENT_CONSENSUS_ADDRESS, AGENT_CONSENSUS_ABI } from '@/lib/contract'
import { monadTestnet } from 'wagmi/chains'
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

interface Submission {
  id: string
  project_title: string
  description: string | null
  project_link: string | null
  score: number
}

interface VoteAllocation {
  submission_id: string
  votes: number
}

const DEFAULT_CREDITS = 100

function calculateCost(votes: number): number {
  return votes * votes
}

function calculateTotalCost(allocations: VoteAllocation[]): number {
  return allocations.reduce((sum, a) => sum + calculateCost(a.votes), 0)
}

export function VotingPanel({
  eventId,
  onBack,
  onViewLeaderboard,
}: {
  eventId: string | null
  onBack: () => void
  onViewLeaderboard: (eventId: string) => void
}) {
  const { isEthProviderAvailable } = useFrame()
  const { isConnected, address, chainId } = useAccount()
  const { connect } = useConnect()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: txHash, isPending: isSending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [allocations, setAllocations] = useState<VoteAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [eventName, setEventName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const totalCost = calculateTotalCost(allocations)
  const remainingCredits = DEFAULT_CREDITS - totalCost

  useEffect(() => {
    if (eventId) fetchSubmissions(eventId)
  }, [eventId])

  useEffect(() => {
    if (isConfirmed) {
      setSubmitted(true)
    }
  }, [isConfirmed])

  async function fetchSubmissions(eid: string) {
    setLoading(true)
    try {
      // Get event info
      const { data: event } = await supabase
        .from('events')
        .select('name')
        .eq('id', eid)
        .single()

      if (event) setEventName(event.name)

      // Get submissions
      const { data } = await supabase
        .from('submissions')
        .select('id, project_title, description, project_link, score')
        .eq('event_id', eid)
        .order('score', { ascending: false })

      if (data) {
        setSubmissions(data)
        setAllocations(data.map((s) => ({ submission_id: s.id, votes: 0 })))
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateVotes = useCallback(
    (submissionId: string, delta: number) => {
      setAllocations((prev) => {
        const updated = prev.map((a) => {
          if (a.submission_id !== submissionId) return a
          const newVotes = Math.max(0, Math.min(10, a.votes + delta))
          // Check credits
          const otherCost = prev
            .filter((o) => o.submission_id !== submissionId)
            .reduce((s, o) => s + calculateCost(o.votes), 0)
          if (otherCost + calculateCost(newVotes) > DEFAULT_CREDITS) return a
          return { ...a, votes: newVotes }
        })
        return updated
      })
    },
    []
  )

  async function handleSubmitVotes() {
    if (!eventId || !isConnected) return

    const activeAllocations = allocations.filter((a) => a.votes > 0)
    if (activeAllocations.length === 0) return

    // Ensure on Monad Testnet
    if (chainId !== monadTestnet.id) {
      switchChain({ chainId: monadTestnet.id })
      return
    }

    writeContract({
      address: AGENT_CONSENSUS_ADDRESS,
      abi: AGENT_CONSENSUS_ABI,
      functionName: 'submitVotes',
      args: [
        eventId,
        activeAllocations.map((a) => a.submission_id),
        activeAllocations.map((a) => BigInt(a.votes)),
      ],
    })
  }

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <span className="text-4xl">🗳️</span>
        <p className="text-sm text-gray-400">Select an event to start voting</p>
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <span className="text-5xl">🎉</span>
        <h2 className="text-lg font-bold text-[#836EF9]">Votes Submitted!</h2>
        <p className="text-xs text-gray-400 text-center">
          Your votes have been recorded on-chain on Monad.
        </p>
        {txHash && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#836EF9] hover:underline"
          >
            View Transaction →
          </a>
        )}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => eventId && onViewLeaderboard(eventId)}
            className="bg-[#836EF9] text-white text-xs font-semibold py-2 px-4 rounded-lg"
          >
            🏆 View Leaderboard
          </button>
          <button
            type="button"
            onClick={onBack}
            className="bg-[#2a2a3e] text-white text-xs font-semibold py-2 px-4 rounded-lg"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-[#1a1a2e] rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[#1a1a2e] rounded-xl animate-pulse" />
        ))}
      </div>
    )
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
        <h2 className="text-sm font-semibold truncate max-w-[200px]">{eventName}</h2>
      </div>

      {/* Credits Bar */}
      <div className="bg-[#1a1a2e] rounded-xl p-3 border border-[#2a2a3e]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Voting Credits</span>
          <span className="text-sm font-mono font-bold text-[#836EF9]">
            {remainingCredits} / {DEFAULT_CREDITS}
          </span>
        </div>
        <div className="w-full h-2 bg-[#0f0f23] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#836EF9] to-[#6C63FF] rounded-full transition-all duration-300"
            style={{ width: `${(totalCost / DEFAULT_CREDITS) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Cost = votes². Each submission: max 10 votes (100 credits)
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="bg-[#1a1a2e] rounded-xl p-3 border border-[#836EF9]/30">
          <p className="text-xs text-gray-400 mb-2">
            Connect wallet to submit votes on-chain
          </p>
          {isEthProviderAvailable ? (
            <button
              type="button"
              onClick={() => connect({ connector: miniAppConnector() })}
              className="w-full bg-[#836EF9] text-white text-xs font-semibold py-2 rounded-lg"
            >
              Connect Farcaster Wallet
            </button>
          ) : (
            <p className="text-[10px] text-gray-500">
              Wallet provider not available. Open in Farcaster app.
            </p>
          )}
        </div>
      )}

      {/* Submissions to Vote On */}
      {submissions.map((sub) => {
        const alloc = allocations.find((a) => a.submission_id === sub.id)
        const votes = alloc?.votes || 0
        const cost = calculateCost(votes)

        return (
          <div
            key={sub.id}
            className="bg-[#1a1a2e] rounded-xl p-3 border border-[#2a2a3e]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{sub.project_title}</h3>
                {sub.description && (
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">
                    {sub.description}
                  </p>
                )}
              </div>
              <span className="text-xs font-mono text-gray-500 ml-2">
                Score: {sub.score || 0}
              </span>
            </div>

            {/* Vote Controls */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateVotes(sub.id, -1)}
                  disabled={votes === 0}
                  className="w-7 h-7 rounded-lg bg-[#2a2a3e] hover:bg-[#3a3a4e] disabled:opacity-30 text-white text-sm font-bold flex items-center justify-center"
                >
                  −
                </button>
                <span className={`text-lg font-bold font-mono min-w-[28px] text-center ${votes > 0 ? 'text-[#836EF9]' : 'text-gray-600'}`}>
                  {votes}
                </span>
                <button
                  type="button"
                  onClick={() => updateVotes(sub.id, 1)}
                  disabled={votes >= 10 || remainingCredits < calculateCost(votes + 1) - cost}
                  className="w-7 h-7 rounded-lg bg-[#836EF9] hover:bg-[#836EF9]/80 disabled:opacity-30 text-white text-sm font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-gray-500">
                Cost: {cost} credits
              </span>
            </div>
          </div>
        )
      })}

      {/* Submit Button */}
      {isConnected && allocations.some((a) => a.votes > 0) && (
        <button
          type="button"
          onClick={handleSubmitVotes}
          disabled={isSending || isConfirming}
          className="w-full bg-gradient-to-r from-[#836EF9] to-[#6C63FF] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
        >
          {isSending
            ? 'Confirm in Wallet...'
            : isConfirming
            ? 'Confirming on Monad...'
            : `Submit Votes (${totalCost} credits)`}
        </button>
      )}
    </div>
  )
}
