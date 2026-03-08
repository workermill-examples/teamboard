'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export function CTA() {
  return (
    <div className="mt-20 text-center">
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 lg:p-12">
        <h4 className="text-2xl font-bold text-white mb-4">
          Ready to streamline your workflow?
        </h4>
        <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of teams who have transformed their productivity with TeamBoard.
          Start your journey today.
        </p>
        <Link
          href="/login"
          className={cn(
            "inline-flex items-center justify-center px-8 py-3 text-base font-medium",
            "text-primary-600 bg-white hover:bg-secondary-50 border border-white",
            "rounded-md shadow-lg hover:shadow-xl transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500",
            "transform hover:-translate-y-0.5"
          )}
        >
          Get Started Now
          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>

        {/* Demo credentials hint */}
        <div className="mt-4 text-primary-100/80 text-sm">
          Demo login: <code className="text-white bg-white/20 px-2 py-1 rounded text-sm font-mono">demo@workermill.com</code> / <code className="text-white bg-white/20 px-2 py-1 rounded text-sm font-mono">demo1234</code>
        </div>
      </div>
    </div>
  )
}