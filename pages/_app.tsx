import type { AppProps } from 'next/app';
import 'react-notifications-component/dist/theme.css';
import '@fortawesome/fontawesome-svg-core/styles.css'; // import Font Awesome CSS
import '@/styles/global.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
      <Component {...pageProps} />
  );
}

export default MyApp;
