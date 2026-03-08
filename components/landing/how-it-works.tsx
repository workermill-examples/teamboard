'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const steps = [
  {
    step: '01',
    title: 'Create Your Workspace',
    description: 'Set up your team workspace in seconds. Invite members, configure permissions, and establish your project structure.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'primary',
  },
  {
    step: '02',
    title: 'Build Your Boards',
    description: 'Create Kanban boards that mirror your workflow. Add columns, set WIP limits, and customize labels to match your process.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V17m0-10a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
      </svg>
    ),
    color: 'accent',
  },
  {
    step: '03',
    title: 'Collaborate & Execute',
    description: 'Move cards through your workflow, assign team members, set deadlines, and track progress in real-time.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'success',
  },
  {
    step: '04',
    title: 'Analyze & Improve',
    description: 'Use powerful analytics and reporting to understand team performance and optimize your workflows continuously.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'warning',
  },
]

const colorStyles = {
  primary: {
    bg: 'bg-primary-500',
    text: 'text-primary-500',
    border: 'border-primary-500',
    lightBg: 'bg-primary-50',
  },
  accent: {
    bg: 'bg-accent-500',
    text: 'text-accent-500',
    border: 'border-accent-500',
    lightBg: 'bg-accent-50',
  },
  success: {
    bg: 'bg-success-500',
    text: 'text-success-500',
    border: 'border-success-500',
    lightBg: 'bg-success-50',
  },
  warning: {
    bg: 'bg-warning-500',
    text: 'text-warning-500',
    border: 'border-warning-500',
    lightBg: 'bg-warning-50',
  },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
            How it works
          </h2>
          <h3 className="mt-2 text-3xl font-bold text-secondary-900 sm:text-4xl lg:text-5xl">
            Get started in minutes
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-secondary-600">
            From setup to execution, TeamBoard makes project management intuitive and efficient
            for teams of any size.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 lg:space-y-20">
          {steps.map((step, index) => {
            const styles = colorStyles[step.color as keyof typeof colorStyles]
            const isEven = index % 2 === 0

            return (
              <div
                key={step.step}
                className={cn(
                  "lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center",
                  isEven ? "lg:grid-flow-col" : "lg:grid-flow-col"
                )}
              >
                {/* Content */}
                <div className={cn(
                  "lg:col-span-6",
                  isEven ? "lg:order-1" : "lg:order-2"
                )}>
                  <div className="flex items-center mb-4">
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg",
                      styles.bg
                    )}>
                      {step.step}
                    </div>
                    <div className={cn(
                      "ml-4 w-16 h-0.5",
                      styles.bg
                    )} />
                  </div>

                  <h4 className="text-2xl font-bold text-secondary-900 mb-4">
                    {step.title}
                  </h4>

                  <p className="text-lg text-secondary-600 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  <div className={cn(
                    "inline-flex items-center text-sm font-medium",
                    styles.text
                  )}>
                    Learn more
                    <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Visual */}
                <div className={cn(
                  "mt-8 lg:mt-0 lg:col-span-6",
                  isEven ? "lg:order-2" : "lg:order-1"
                )}>
                  <div className="relative mx-auto max-w-md lg:max-w-none">
                    {/* Background decoration */}
                    <div className={cn(
                      "absolute inset-0 rounded-lg transform rotate-3 opacity-10",
                      styles.bg
                    )} />

                    {/* Main card */}
                    <div className={cn(
                      "relative bg-white rounded-lg shadow-lg border-2 p-8",
                      styles.border,
                      styles.lightBg
                    )}>
                      {/* Icon */}
                      <div className={cn(
                        "flex items-center justify-center w-16 h-16 rounded-lg text-white mb-4",
                        styles.bg
                      )}>
                        {step.icon}
                      </div>

                      {/* Placeholder content based on step */}
                      <div className="space-y-3">
                        {step.step === '01' && (
                          <>
                            <div className="h-4 bg-secondary-200 rounded w-3/4" />
                            <div className="flex space-x-2">
                              <div className="w-8 h-8 bg-primary-200 rounded-full" />
                              <div className="w-8 h-8 bg-accent-200 rounded-full" />
                              <div className="w-8 h-8 bg-success-200 rounded-full" />
                            </div>
                          </>
                        )}
                        {step.step === '02' && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <div className="h-2 bg-primary-300 rounded" />
                              <div className="h-8 bg-primary-100 rounded" />
                              <div className="h-6 bg-primary-100 rounded" />
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 bg-accent-300 rounded" />
                              <div className="h-6 bg-accent-100 rounded" />
                              <div className="h-8 bg-accent-100 rounded" />
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 bg-success-300 rounded" />
                              <div className="h-6 bg-success-100 rounded" />
                            </div>
                          </div>
                        )}
                        {step.step === '03' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-success-400 rounded" />
                              <div className="h-3 bg-secondary-200 rounded flex-1" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-warning-400 rounded-full" />
                              <div className="h-2 bg-secondary-200 rounded flex-1" />
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-6 h-6 bg-primary-400 rounded-full text-white text-xs flex items-center justify-center">A</div>
                              <div className="w-6 h-6 bg-accent-400 rounded-full text-white text-xs flex items-center justify-center">B</div>
                            </div>
                          </>
                        )}
                        {step.step === '04' && (
                          <div className="space-y-2">
                            <div className="h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded flex items-end justify-around p-2">
                              <div className="w-2 h-8 bg-primary-400 rounded" />
                              <div className="w-2 h-12 bg-accent-400 rounded" />
                              <div className="w-2 h-6 bg-success-400 rounded" />
                              <div className="w-2 h-10 bg-warning-400 rounded" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
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
          </div>
        </div>
      </div>
    </section>
  )
}