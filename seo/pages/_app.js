// Importeer global.css vanuit de juiste map
import '../styles/global.css';  // Dit pad zou correct moeten zijn als _app.js in seo/pages/ staat

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
