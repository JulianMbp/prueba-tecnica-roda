/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Roda Brand Colors
        'roda-black': '#000000',
        'roda-dark': '#0C0D0D',
        'roda-white': '#FFFFFF',
        'roda-yellow': '#EBFF00',
        'roda-green': '#C6F833',
        'roda-purple': '#B794F6',
        
        // Extended grays
        'roda-gray-50': '#F9FAFB',
        'roda-gray-100': '#F3F4F6',
        'roda-gray-200': '#E5E7EB',
        'roda-gray-300': '#D1D5DB',
        'roda-gray-400': '#9CA3AF',
        'roda-gray-500': '#6B7280',
        'roda-gray-600': '#4B5563',
        'roda-gray-700': '#374151',
        'roda-gray-800': '#1F2937',
        'roda-gray-900': '#111827',
        
        // Status colors
        'roda-success': '#10B981',
        'roda-warning': '#F59E0B',
        'roda-error': '#EF4444',
        'roda-info': '#3B82F6',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
