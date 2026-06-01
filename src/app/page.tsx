'use client'

import dynamic from 'next/dynamic'
import { UgandaFlagPreloader } from '@/components/uganda-preloader'

/**
 * HomeContent is loaded dynamically with { ssr: false } to break the
 * circular-dependency chain that framer-motion creates in the production
 * bundle (ReferenceError: Cannot access 'tX' before initialization).
 *
 * By keeping framer-motion out of the initial page chunk, the TDZ error
 * is avoided entirely because the library is loaded asynchronously on the
 * client, after the initial module evaluation has completed.
 */
const HomeContent = dynamic(() => import('@/components/home-content'), {
  ssr: false,
  loading: () => <UgandaFlagPreloader />,
})

export default function Page() {
  return <HomeContent />
}
