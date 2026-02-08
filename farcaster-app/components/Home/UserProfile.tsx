'use client'

import { useFrame } from '@/components/farcaster-provider'

export function UserProfile() {
  const { context } = useFrame()

  if (!context?.user) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#2a2a3e] flex items-center justify-center">
        <span className="text-xs">?</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-medium text-gray-200 truncate max-w-[100px]">
          {context.user.displayName || context.user.username}
        </p>
        <p className="text-[10px] text-gray-500">FID: {context.user.fid}</p>
      </div>
      {context.user.pfpUrl ? (
        <img
          src={context.user.pfpUrl}
          alt={context.user.username || 'Profile'}
          className="w-8 h-8 rounded-full border border-[#836EF9]/30"
          width={32}
          height={32}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#836EF9]/20 flex items-center justify-center border border-[#836EF9]/30">
          <span className="text-xs font-bold text-[#836EF9]">
            {(context.user.username || 'U')[0].toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
