import Head from 'next/head';
import styles from '@/styles/Login.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>MuOnlineJS Admin Panel</title>
        <meta name="description" content="MuOnlineJS Admin Panel"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <main className={styles.main}>
        <div>
          Login
        </div>
      </main>
    </>
  );
}
