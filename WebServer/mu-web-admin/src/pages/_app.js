import '@/styles/globals.css';
import {Roboto} from 'next/font/google';

const roboto = Roboto({subsets: ['latin'], weight: '400'});

export default function App({Component, pageProps}) {
  return (
    <div id="app" className={roboto.className}>
      <Component {...pageProps} />
    </div>
  );
}

