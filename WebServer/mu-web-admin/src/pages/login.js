import Head from 'next/head';
import styles from '@/styles/Login.module.css';
import axios from 'axios';
import {useState} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';
import loginImage from '@/assets/images/login.png';

const displayErrorMessage = message => {
  if (!message) return false;
  return (
    <div className={styles.errorMessage}>
      <p>{message}</p>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState();
  const [errorMessage, setErrorMessage] = useState();
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
    setErrorMessage();
    const {username, password} = state || '';
    axios.post('/api/login', {
      username,
      password
    }, {
      withCredentials: true
    }).then(() => {
      router.push('/').then();
    }).catch(e => {
      const errorMessage = e?.response?.data?.message || e?.message;
      setErrorMessage(errorMessage);
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
      <main>
        <div className={styles.mainWrapper}>
          <div className={styles.loginFormWrapper}>
            <h2 className={styles.loginTitle}>Mu Web Admin</h2>
            <div className={styles.loginSubtitle}>
              <h3>Welcome to MuWebAdmin!</h3>
              <h4>Please sign-in to your account to start moderating</h4>
            </div>
            {displayErrorMessage(errorMessage)}
            <label htmlFor="username">Username</label>
            <input id="username" type="text" name="username" onChange={handleChange} placeholder="Username"/>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" onChange={handleChange} placeholder="Password"/>
            <button onClick={handleSubmit}>Login</button>
          </div>
          <Image src={loginImage} alt="MuWebAdmin Login" className={styles.image}/>
        </div>
      </main>
    </>
  );
}
