import Head from 'next/head';
import styles from '@/styles/Main.module.css';
import {Roboto} from 'next/font/google';

import Nav from './Nav';

const roboto = Roboto({subsets: ['latin'], weight: '400'});

const Layout = ({children}) => {

  return (
    <>
      <Head>
        <title>MuOnlineJS Admin Panel</title>
        <meta name="description" content="MuOnlineJS Admin Panel"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div className={`${styles.main} ${roboto.className} ${styles.rowResponsive}`}>
        <Nav />
        <main className={`${styles.mainWrapper} ${roboto.className}`}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
