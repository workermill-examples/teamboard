'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';

interface MobileNavProps {
  className?: string;
}

function MobileNavContent({ className = '' }: MobileNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.workspace as string;

  if (!workspaceSlug) {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: `/${workspaceSlug}/dashboard`,
      icon: '🏠',
      current: pathname === `/${workspaceSlug}/dashboard`
    },
    {
      name: 'Boards',
      href: `/${workspaceSlug}/boards`,
      icon: '📋',
      current: pathname?.startsWith(`/${workspaceSlug}/boards`) || false
    },
    {
      name: 'Activity',
      href: `/${workspaceSlug}/activity`,
      icon: '🕐',
      current: pathname === `/${workspaceSlug}/activity`
    },
    {
      name: 'Members',
      href: `/${workspaceSlug}/members`,
      icon: '👥',
      current: pathname === `/${workspaceSlug}/members`
    },
    {
      name: 'Settings',
      href: `/${workspaceSlug}/settings`,
      icon: '⚙️',
      current: pathname === `/${workspaceSlug}/settings`
    }
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden ${className}`}
      data-testid="mobile-nav"
    >
      <div className="px-2 py-1">
        <div className="flex justify-around">
          {navigation.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors duration-150
                  ${item.current
                    ? 'text-primary bg-primary/10'
                    : 'text-muted hover:text-foreground hover:bg-accent/50'
                  }
                `}
                data-testid={`mobile-nav-${item.name.toLowerCase()}`}
              >
                <span className="text-lg mb-1" aria-hidden="true">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}

export function MobileNav(props: MobileNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileNavContent {...props} />
    </Suspense>
  );
}

export default MobileNav;