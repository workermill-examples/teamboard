'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GitHubIcon } from '@/components/ui/icons'

export function LandingNav() {
  return (
    <nav className="relative z-50 bg-white/90 backdrop-blur-md border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <span className="text-xl font-semibold text-secondary-900">
                TeamBoard
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className={cn(
                "text-secondary-600 hover:text-secondary-900 text-sm font-medium",
                "transition-colors duration-200"
              )}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                "text-secondary-600 hover:text-secondary-900 text-sm font-medium",
                "transition-colors duration-200"
              )}
            >
              How it works
            </Link>
            <Link
              href="https://github.com/workermill-examples/teamboard"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 text-sm font-medium",
                "transition-colors duration-200"
              )}
            >
              <GitHubIcon className="w-4 h-4" />
              <span>Source</span>
            </Link>
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm font-medium",
                "text-primary-600 bg-white hover:bg-primary-50 border border-primary-300",
                "rounded-md transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              )}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium",
                "text-primary-600 bg-white hover:bg-primary-50 border border-primary-300",
                "rounded-md transition-colors duration-200"
              )}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}