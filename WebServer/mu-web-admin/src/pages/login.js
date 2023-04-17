import Head from 'next/head';
import styles from '@/styles/Login.module.css';
import axios from 'axios';
import {useState} from 'react';
import {useRouter} from 'next/router';

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState();
  const handleChange = e => {
    setState(prev => {
      return {
        ...prev,
        [e.target.name]: e.target.value
      };
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const {username, password} = state;
    axios.post('/api/login', {
      username,
      password
    }, {
      withCredentials: true
    }).then(() => {
      router.push('/').then();
    }).catch(e => {
      console.log(e);
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
          <input type="text" name="username" onChange={handleChange}/>
          <input type="password" name="password" onChange={handleChange}/>
          <button onClick={handleSubmit}>Login</button>
        </div>
      </main>
    </>
  );
}
