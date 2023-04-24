import '@/styles/globals.css';
import {Roboto} from 'next/font/google';
import Layout from '@/components/Layout';
const roboto = Roboto({subsets: ['latin'], weight: '400'});

export default function App({Component, pageProps, router}) {
  const isLoginPage = router.pathname === '/login';
  if (isLoginPage) {
    return (
      <div className={roboto.className} style={{height: '100%'}}>
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <Layout>
      <Component {...pageProps}/>
    </Layout>
  );
}

