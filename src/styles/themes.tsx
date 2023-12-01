import { createTheme } from 'react-data-table-component';

export function createThemes() {
   createTheme('custom', {
      text: {
         primary: 'var(--text-color)',
         secondary: 'var(--text-color-2)',
      },
      background: {
         default: 'var(--bg-light)',
      },
      context: {
         background: 'var(--bg-light)',
         text: 'var(--text-color)',
      },
      divider: {
         default: 'var(--background-color)',
      },
      action: {
         button: 'rgba(0,0,0,.54)',
         hover: 'rgba(0,0,0,.08)',
         disabled: 'rgba(0,0,0,.12)',
      }
   });
}