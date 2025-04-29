// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="nl">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Steun campagnes voor Gaza via GazaAid. Direct, transparant en vertrouwd doneren. Bekijk en filter alle actuele inzamelacties." />
        <meta name="keywords" content="Gaza, GazaAid, crowdfunding, doneren, hulp, humanitair, Palestina, GoFundMe" />
        <meta name="author" content="GazaAid" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta property="og:title" content="GazaAid - Direct doneren aan Gaza campagnes" />
        <meta property="og:description" content="Bekijk en steun actuele crowdfundingcampagnes voor Gaza. Transparant, actueel en vertrouwd." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jouw-domein.nl" />
        <meta property="og:image" content="https://jouw-domein.nl/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GazaAid - Direct doneren aan Gaza campagnes" />
        <meta name="twitter:description" content="Bekijk en steun actuele crowdfundingcampagnes voor Gaza." />
        <meta name="twitter:image" content="https://jouw-domein.nl/og-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
