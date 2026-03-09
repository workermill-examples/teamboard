'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GitHubIcon } from '@/components/ui/icons'

function MockCard({ title, priority, color, assignee }: { title: string; priority: string; color: string; assignee: string }) {
  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className={cn("rounded-lg border border-secondary-200 bg-white p-3 shadow-sm", color && `border-l-4 ${color}`)}>
      <p className="text-xs font-medium text-secondary-800 leading-snug">{title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", priorityColors[priority])}>
          {priority.toUpperCase()}
        </span>
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-[8px] font-bold text-white">
          {assignee}
        </div>
      </div>
    </div>
  )
}

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
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-20 lg:items-center">

            {/* Text content */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-secondary-900 sm:text-5xl lg:text-6xl">
                <span className="block">Streamline your</span>
                <span className="block text-primary-600">team&apos;s workflow</span>
              </h1>

              <p className="mt-6 text-lg text-secondary-600 max-w-xl leading-relaxed">
                Transform the way your team collaborates with powerful Kanban boards,
                real-time updates, and intuitive project management tools designed for modern teams.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex items-center justify-center px-8 py-3 text-base font-medium",
                    "text-white bg-primary-600 hover:bg-primary-700 border border-transparent",
                    "rounded-lg shadow-lg hover:shadow-xl transition-all duration-200",
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
                    "rounded-lg shadow-md hover:shadow-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  )}
                >
                  <GitHubIcon className="mr-2 w-5 h-5" aria-hidden={true} />
                  View on GitHub
                </Link>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-5">
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
              <div className="mt-10 flex items-center gap-6">
                <span className="text-sm text-secondary-500">Trusted by teams at</span>
                <div className="flex items-center gap-4 text-secondary-400">
                  <span className="font-semibold">WorkerMill</span>
                  <span className="w-1 h-1 bg-secondary-300 rounded-full" />
                  <span className="font-semibold">Startups</span>
                  <span className="w-1 h-1 bg-secondary-300 rounded-full" />
                  <span className="font-semibold">Enterprises</span>
                </div>
              </div>
            </div>

            {/* Visual element — realistic Kanban mockup */}
            <div className="mt-12 lg:mt-0">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-2xl blur-2xl" />

                <div className="relative bg-white rounded-xl shadow-2xl border border-secondary-200 overflow-hidden">
                  {/* Browser chrome */}
                  <div className="bg-secondary-50 px-4 py-2.5 border-b border-secondary-200 flex items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                    </div>
                    <div className="ml-4 flex-1 bg-white rounded-md px-3 py-1 text-xs text-secondary-400 border border-secondary-200">
                      teamboard.workermill.com
                    </div>
                  </div>

                  {/* App content */}
                  <div className="p-4">
                    {/* Board header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                        <span className="text-sm font-semibold text-secondary-800">Product Roadmap</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="px-2 py-0.5 rounded bg-secondary-100 text-[10px] text-secondary-500 font-medium">Filter</div>
                        <div className="px-2 py-0.5 rounded bg-secondary-100 text-[10px] text-secondary-500 font-medium">Sort</div>
                      </div>
                    </div>

                    {/* Kanban columns */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* To Do */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-secondary-500 uppercase tracking-wider">To Do</span>
                          <span className="text-[10px] bg-secondary-100 text-secondary-500 px-1.5 rounded-full font-medium">3</span>
                        </div>
                        <MockCard title="Design new onboarding flow" priority="high" color="border-l-orange-400" assignee="A" />
                        <MockCard title="Update API docs for v2" priority="medium" color="border-l-blue-400" assignee="M" />
                        <MockCard title="Add export to CSV" priority="low" color="border-l-slate-300" assignee="J" />
                      </div>

                      {/* In Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-secondary-500 uppercase tracking-wider">In Progress</span>
                          <span className="text-[10px] bg-primary-100 text-primary-600 px-1.5 rounded-full font-medium">2</span>
                        </div>
                        <MockCard title="Implement drag & drop reorder" priority="urgent" color="border-l-red-400" assignee="S" />
                        <MockCard title="Real-time SSE notifications" priority="high" color="border-l-orange-400" assignee="A" />
                      </div>

                      {/* Done */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-secondary-500 uppercase tracking-wider">Done</span>
                          <span className="text-[10px] bg-green-100 text-green-600 px-1.5 rounded-full font-medium">4</span>
                        </div>
                        <MockCard title="User auth with NextAuth v5" priority="high" color="border-l-green-400" assignee="M" />
                        <MockCard title="Workspace RBAC roles" priority="medium" color="border-l-green-400" assignee="J" />
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
