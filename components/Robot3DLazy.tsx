'use client'

import dynamic from 'next/dynamic'

const Robot3D = dynamic(() => import('./Robot3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full" aria-hidden="true" />,
})

export default Robot3D
