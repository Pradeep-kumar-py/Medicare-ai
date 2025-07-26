// Responsive design utilities and constants

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const;

export const SPACING = {
  container: {
    xs: 'px-4',
    sm: 'px-6',
    md: 'px-8',
    lg: 'px-8',
    xl: 'px-8',
  },
  section: {
    xs: 'py-8',
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
  },
} as const;

export const GRID_COLS = {
  mobile: 'grid-cols-1',
  tablet: 'sm:grid-cols-2',
  desktop: 'lg:grid-cols-3',
  wide: 'xl:grid-cols-4',
} as const;

export const TEXT_SIZES = {
  heading: {
    xs: 'text-xl',
    sm: 'sm:text-2xl',
    md: 'md:text-3xl',
    lg: 'lg:text-4xl',
    xl: 'xl:text-5xl',
  },
  body: {
    xs: 'text-sm',
    sm: 'sm:text-base',
    md: 'md:text-lg',
  },
  caption: {
    xs: 'text-xs',
    sm: 'sm:text-sm',
  },
} as const;

// Helper function to combine responsive classes
export function createResponsiveClasses(
  base: string,
  responsive: Record<string, string>
): string {
  return [base, ...Object.values(responsive)].join(' ');
}

// Common responsive patterns
export const RESPONSIVE_PATTERNS = {
  grid: `grid gap-4 sm:gap-6 md:gap-8 ${GRID_COLS.mobile} ${GRID_COLS.tablet} ${GRID_COLS.desktop}`,
  container: `container ${SPACING.container.xs} ${SPACING.container.sm} ${SPACING.container.md}`,
  section: `${SPACING.section.xs} ${SPACING.section.sm} ${SPACING.section.md} ${SPACING.section.lg}`,
  heading: createResponsiveClasses('font-bold', TEXT_SIZES.heading),
  body: createResponsiveClasses('', TEXT_SIZES.body),
  flexCenter: 'flex items-center justify-center',
  cardPadding: 'p-4 sm:p-6 md:p-8',
} as const;

// Responsive image sizes
export const IMAGE_SIZES = {
  avatar: {
    xs: 'w-8 h-8',
    sm: 'sm:w-12 sm:h-12',
    md: 'md:w-16 md:h-16',
  },
  icon: {
    xs: 'w-4 h-4',
    sm: 'sm:w-5 sm:h-5',
    md: 'md:w-6 md:h-6',
  },
  logo: {
    xs: 'w-6 h-6',
    sm: 'sm:w-8 sm:h-8',
    md: 'md:w-10 md:h-10',
  },
} as const;

// Helper to check if screen is mobile
export function isMobileScreen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

// Helper to check if screen is tablet
export function isTabletScreen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

// Helper to check if screen is desktop
export function isDesktopScreen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}
