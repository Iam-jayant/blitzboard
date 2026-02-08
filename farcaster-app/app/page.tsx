import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/feed.png`,
  button: {
    title: 'Launch BlitzBoard',
    action: {
      type: 'launch_frame',
      name: 'BlitzBoard - Quadratic Voting on Monad',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#0f0f23',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'BlitzBoard - Quadratic Voting on Monad',
    openGraph: {
      title: 'BlitzBoard - Quadratic Voting on Monad',
      description: 'On-chain quadratic voting platform. Vote on hackathon submissions with sharded parallel execution on Monad.',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}
