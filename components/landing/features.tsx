'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'Intuitive Kanban Boards',
    description: 'Visualize your workflow with drag-and-drop cards, customizable columns, and real-time collaboration.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V17m0-10a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
      </svg>
    ),
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    title: 'Real-time Collaboration',
    description: 'See changes instantly as team members move cards, add comments, and update project status.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    title: 'Advanced Analytics',
    description: 'Track team performance with detailed charts, burndown graphs, and productivity insights.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-success-500 to-success-600',
  },
  {
    title: 'Smart Notifications',
    description: 'Stay informed with intelligent notifications about deadlines, assignments, and project updates.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM12 17h5l-5 5v-5zM9 17h5l-5 5v-5z" />
      </svg>
    ),
    gradient: 'from-warning-500 to-warning-600',
  },
  {
    title: 'Flexible Workflows',
    description: 'Customize boards, labels, and automation rules to match your team\'s unique processes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-primary-600 to-accent-500',
  },
  {
    title: 'Enterprise Security',
    description: 'Role-based permissions, audit logs, and enterprise-grade security to protect your data.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-destructive-500 to-destructive-600',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
            Features
          </h2>
          <h3 className="mt-2 text-3xl font-bold text-secondary-900 sm:text-4xl lg:text-5xl">
            Everything your team needs
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-secondary-600">
            Powerful project management tools designed to help teams collaborate effectively
            and deliver results faster.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "relative group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300",
                "border border-secondary-200 hover:border-primary-200 p-6",
                "transform hover:-translate-y-1"
              )}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center text-white",
                  feature.gradient,
                  "group-hover:scale-110 transition-transform duration-200"
                )}>
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h4 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-700 transition-colors">
                {feature.title}
              </h4>

              <p className="text-secondary-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative element */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-lg text-secondary-600 mb-8">
            Ready to transform your team&apos;s productivity?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              Start Free Trial
            </Link>
            <a
              href="#how-it-works"
              className={cn(
                "inline-flex items-center justify-center px-8 py-3 text-base font-medium",
                "text-primary-700 bg-white hover:bg-primary-50 border border-primary-300",
                "rounded-md shadow-md hover:shadow-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              )}
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}