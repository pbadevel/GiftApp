// pages/_app.tsx
import type { AppProps } from 'next/app'
import { ToastProvider } from '@/context/ToastContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  )
}

export default MyApp