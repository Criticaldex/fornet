/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   theme: {
      extend: {
         backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic':
               'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
         },
         colors: {
            nav: 'var(--bg-nav)',
            textColor: 'var(--text-color)',
            textColor2: 'var(--text-color-2)',
            foreground: 'var(--foreground)',
            chart: 'var(--bg-light)',
            darkBlue: 'var(--darkBlue)',
            darkBlue2: 'var(--darkBlue2)',
            lightBlue: 'var(--lightBlue)',
            red: 'var(--red)',
            green: 'var(--green)',
            darkRed: 'var(--darkRed)',
            yellowCustom: 'var(--yellow)',
            bgLight: 'var(--bg-light)',
            bgDark: 'var(--bg-dark)',
            contrario: 'var(--contrario)',
            hover: 'var(--background-start)',
            pestanaDark: 'var(--pestanaDark)',
            pestanaLight: 'var(--pestanaLight)',
            pestanaHover: 'var(--pestanaHover)',
            bgNavGlobal: 'var(--bg-nav-global)',
            TextNav: 'var(--textNav)',
            spacerNav: 'var(--spacerNav)',
            hiper: 'var(--hiper)',
            hiper2: 'var(--hiper2)',
            seleccio: 'var(--seleccio)',
            seleccio2: 'var(--seleccio2)',
            universals: 'var(--universals)',
            universals2: 'var(--universals2)'
         },
         fontFamily: {
            nunito: ['Nunito', 'sans-serif']
         }
      },
   },
   plugins: [],
}
