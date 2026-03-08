'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GitHubIcon } from '@/components/ui/icons'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-accent-100/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">

            {/* Text content */}
            <div className="lg:col-span-7">
              <h1 className="text-4xl font-bold tracking-tight text-secondary-900 sm:text-5xl lg:text-6xl">
                <span className="block">Streamline your</span>
                <span className="block text-primary-600">team&apos;s workflow</span>
              </h1>

              <p className="mt-6 text-xl text-secondary-600 max-w-3xl">
                Transform the way your team collaborates with powerful Kanban boards,
                real-time updates, and intuitive project management tools designed for modern teams.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex items-center justify-center px-8 py-3 text-base font-medium",
                    "text-white bg-primary-600 hover:bg-primary-700 border border-transparent",
                    "rounded-md shadow-lg hover:shadow-xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    "transform hover:-translate-y-0.5"
                  )}
                >
                  Try the Demo
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <Link
                  href="https://github.com/workermill-examples/teamboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center justify-center px-8 py-3 text-base font-medium",
                    "text-primary-700 bg-white hover:bg-secondary-50 border border-primary-300",
                    "rounded-md shadow-md hover:shadow-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  )}
                >
                  <GitHubIcon className="mr-2 w-5 h-5" aria-hidden={true} />
                  View on GitHub
                </Link>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-6 flex justify-center">
                <p className="text-sm text-secondary-500">
                  <code className="bg-secondary-100 px-2 py-1 rounded text-secondary-700 font-mono">
                    demo@workermill.com
                  </code>
                  {' · '}
                  <code className="bg-secondary-100 px-2 py-1 rounded text-secondary-700 font-mono">
                    demo1234
                  </code>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center space-x-6">
                <div className="text-sm text-secondary-500">
                  Trusted by teams at
                </div>
                <div className="flex items-center space-x-4 text-secondary-400">
                  <span className="font-semibold">WorkerMill</span>
                  <span className="w-1 h-1 bg-secondary-400 rounded-full" />
                  <span className="font-semibold">Startups</span>
                  <span className="w-1 h-1 bg-secondary-400 rounded-full" />
                  <span className="font-semibold">Enterprises</span>
                </div>
              </div>
            </div>

            {/* Visual element */}
            <div className="mt-12 lg:mt-0 lg:col-span-5">
              <div className="mx-auto max-w-lg">
                {/* Dashboard preview mockup */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 transform rotate-6 rounded-lg opacity-20 blur-sm"></div>
                  <div className="relative bg-white rounded-lg shadow-2xl border border-secondary-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-secondary-50 px-4 py-3 border-b border-secondary-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-destructive-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-warning-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-success-400 rounded-full"></div>
                        <div className="ml-4 text-sm text-secondary-500 font-medium">
                          teamboard.workermill.com
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Title */}
                      <div className="h-8 bg-gradient-to-r from-primary-200 to-primary-300 rounded w-3/4"></div>

                      {/* Kanban columns */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <div className="h-6 bg-secondary-200 rounded w-full"></div>
                          <div className="space-y-2">
                            <div className="h-16 bg-primary-100 rounded border-l-4 border-primary-400"></div>
                            <div className="h-12 bg-accent-100 rounded border-l-4 border-accent-400"></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-6 bg-secondary-200 rounded w-full"></div>
                          <div className="space-y-2">
                            <div className="h-12 bg-warning-100 rounded border-l-4 border-warning-400"></div>
                            <div className="h-16 bg-success-100 rounded border-l-4 border-success-400"></div>
                            <div className="h-12 bg-primary-100 rounded border-l-4 border-primary-400"></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-6 bg-secondary-200 rounded w-full"></div>
                          <div className="space-y-2">
                            <div className="h-12 bg-accent-100 rounded border-l-4 border-accent-400"></div>
                            <div className="h-16 bg-success-100 rounded border-l-4 border-success-400"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}