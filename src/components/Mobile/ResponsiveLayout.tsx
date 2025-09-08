import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, MoreVertical } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { Button } from '@/components/ui/button';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  showSidebarOnMobile?: boolean;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export default function ResponsiveLayout({
  children,
  sidebar,
  header,
  footer,
  className = '',
  sidebarWidth = 'md',
  showSidebarOnMobile = false
}: ResponsiveLayoutProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-72',
    lg: 'w-80'
  };

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentBreakpoint('mobile');
        setSidebarOpen(false);
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const isMobile = currentBreakpoint === 'mobile';
  const isTablet = currentBreakpoint === 'tablet';
  const isDesktop = currentBreakpoint === 'desktop';

  const shouldShowSidebar = sidebar && (isDesktop || (showSidebarOnMobile && sidebarOpen));
  const shouldShowOverlay = isMobile && sidebarOpen;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark-900 ${className}`}>
      {/* Mobile Header with Menu Button */}
      {(isMobile || isTablet) && header && (
        <div className="sticky top-0 z-40 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center justify-between p-4">
            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">{header}</div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop Sidebar */}
            {isDesktop && (
              <div className={`${sidebarWidthClasses[sidebarWidth]} flex-shrink-0`}>
                <div className="sticky top-0 h-screen overflow-y-auto bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-600">
                  {header && (
                    <div className="border-b border-gray-200 dark:border-dark-600 p-4">
                      {header}
                    </div>
                  )}
                  {sidebar}
                </div>
              </div>
            )}

            {/* Mobile/Tablet Sidebar Overlay */}
            {(isMobile || isTablet) && sidebarOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setSidebarOpen(false)}
                />
                
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-full ${sidebarWidthClasses[sidebarWidth]} bg-white dark:bg-dark-800 shadow-xl z-50 transform transition-transform duration-300`}>
                  <AnimatedContainer className="h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
                      {header}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="p-2"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    {/* Sidebar Content */}
                    <div className="overflow-y-auto h-full pb-16">
                      {sidebar}
                    </div>
                  </AnimatedContainer>
                </div>
              </>
            )}
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Desktop Header */}
          {isDesktop && header && !sidebar && (
            <div className="sticky top-0 z-30 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600">
              <div className="p-4">{header}</div>
            </div>
          )}

          {/* Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const getGridCols = () => {
    const mobile = cols.mobile || 1;
    const tablet = cols.tablet || 2;
    const desktop = cols.desktop || 3;
    
    return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
  };

  return (
    <div className={`grid ${getGridCols()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function ResponsiveCard({
  children,
  title,
  subtitle,
  actions,
  className = '',
  compact = false
}: ResponsiveCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={`bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg shadow-sm ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`border-b border-gray-200 dark:border-dark-600 ${compact ? 'p-3' : 'p-4 md:p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-gray-600 dark:text-dark-400 truncate ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center gap-2 ml-4">
                {/* Mobile: Show more button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActions(!showActions)}
                    className="p-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Desktop: Show actions directly */}
                <div className="hidden md:flex items-center gap-2">
                  {actions}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Actions Dropdown */}
          {showActions && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
              <div className="flex flex-wrap gap-2">
                {actions}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className={compact ? 'p-3' : 'p-4 md:p-6'}>
        {children}
      </div>
    </div>
  );
}

// Responsive Stack Component
interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    mobile?: 'vertical' | 'horizontal';
    tablet?: 'vertical' | 'horizontal';
    desktop?: 'vertical' | 'horizontal';
  };
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = { mobile: 'vertical', tablet: 'horizontal', desktop: 'horizontal' },
  align = 'start',
  gap = 'md',
  className = ''
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const getDirectionClasses = () => {
    const classes = [];
    
    if (direction.mobile === 'horizontal') {
      classes.push('flex-row');
    } else {
      classes.push('flex-col');
    }
    
    if (direction.tablet === 'horizontal') {
      classes.push('md:flex-row');
    } else if (direction.tablet === 'vertical') {
      classes.push('md:flex-col');
    }
    
    if (direction.desktop === 'horizontal') {
      classes.push('lg:flex-row');
    } else if (direction.desktop === 'vertical') {
      classes.push('lg:flex-col');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`flex ${getDirectionClasses()} ${alignClasses[align]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
}

// Example usage component
export function ResponsiveLayoutExample() {
  const sidebarContent = (
    <div className="p-4 space-y-2">
      <div className="font-medium text-gray-900 dark:text-white mb-4">Navigation</div>
      {['Dashboard', 'Pacientes', 'Agendamentos', 'Relatórios'].map(item => (
        <div key={item} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded cursor-pointer">
          {item}
        </div>
      ))}
    </div>
  );

  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">FisioFlow</h1>
      <div className="flex items-center gap-2">
        <Button size="sm">Perfil</Button>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout
      header={headerContent}
      sidebar={sidebarContent}
      showSidebarOnMobile={true}
    >
      <div className="p-4 md:p-6">
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
          <ResponsiveCard title="Card 1" subtitle="Exemplo de card responsivo">
            <p>Conteúdo do card que se adapta a diferentes tamanhos de tela.</p>
          </ResponsiveCard>
          <ResponsiveCard title="Card 2" subtitle="Outro card de exemplo">
            <p>Este layout se ajusta automaticamente para mobile, tablet e desktop.</p>
          </ResponsiveCard>
          <ResponsiveCard title="Card 3" subtitle="Terceiro card">
            <p>Perfeito para dashboards e interfaces administrativas.</p>
          </ResponsiveCard>
        </ResponsiveGrid>
      </div>
    </ResponsiveLayout>
  );
}