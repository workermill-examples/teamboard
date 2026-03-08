import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnWorkspaces = nextUrl.pathname.startsWith('/workspaces')
      const isOnWorkspace = nextUrl.pathname.match(/^\/[^\/]+\/(dashboard|boards|activity|members|settings)/)

      if (isOnWorkspaces || isOnWorkspace) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/workspaces', nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
} satisfies NextAuthConfig