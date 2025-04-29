/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'checkbox-border': '#1E60A2',
        'checkbox-checked': '#3b82f6',
        'label': '#4b5563',
        'splash-bg': '#bae6fd',
        'splash-primary': '#3b82f6',
        'splash-text': '#1e40af',
        'splash-loading': '#bae6fd',
        'loading-bg': '#bae6fd',
        'loading-text': '#1e40af',
        'loading-indicator': '#3b82f6',
        'primary': '#3B82F6',
        'background': '#F5F7FA',
        'offline': '#f59e0b',
        'interest-bg': '#f3f4f6',
        'interest-selected': '#dbeafe',
        
      },
      borderRadius: {
        'wave': '100px',
      },
      margin: {
        '100': '100px',
      },
      height: {
        'wave-container': '200px',
        'wave': '150px',
      },
      width: {
        'category': '140px',
        'space': '280px',
        'event': '160px',
      },
      height: {
        'category': '128px',
        'space': '128px',
        'event': '96px',
      }
    },
  },
  plugins: [],
}