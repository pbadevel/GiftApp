// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta 
            name="viewport" 
            content="width=device-width, initial-scale=0.8, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover"
          />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}