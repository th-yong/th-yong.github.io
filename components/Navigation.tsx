'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminModal from './AdminModal'

export default function Navigation() {
  const pathname = usePathname()
  const [clickCount, setClickCount] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    if (clickCount >= 5) {
      setShowAdmin(true)
      setClickCount(0)
    }
  }, [clickCount])

  const handleLogoClick = () => {
    setClickCount((prev: number) => prev + 1)
    setTimeout(() => setClickCount(0), 2000)
  }

  const navItems = [
    { href: '/about', label: 'About' },
    { href: '/tech', label: 'Tech' },
    { href: '/tags', label: 'Tags' },
    { href: '/projects', label: 'Projects' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Tae-Hoon's blog
            </Link>
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
    </>
  )
}

