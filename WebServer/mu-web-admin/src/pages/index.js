import Head from 'next/head';
import styles from '@/styles/Main.module.css';
import axios from 'axios';
import {useRouter} from 'next/navigation';

export default function Home() {
  const {push} = useRouter();
  const handleLogout = e => {
    e.preventDefault();
    axios.get('/api/logout').then(() => {
      push('/login');
    });
  };
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
          test
          <button onClick={handleLogout}>Logout</button>
        </div>
      </main>
    </>
  );
}
