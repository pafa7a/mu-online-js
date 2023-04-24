import Head from 'next/head';
import styles from '@/styles/Main.module.css';
import axios from 'axios';
import {Roboto} from 'next/font/google';

const roboto = Roboto({subsets: ['latin'], weight: '400'});
import {useRouter} from 'next/navigation';
import {
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineProfile,
  AiOutlineSetting,
} from 'react-icons/ai';
import {MdManageAccounts} from 'react-icons/md';

const Layout = ({children}) => {
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
      <div className={`${styles.main} ${roboto.className}`}>
        <div className={styles.navWrapper}>
          <ul className={styles.navUl}>
            <li onClick={() => push('/')} className={styles.navMenuActive}>
              <AiOutlineHome/>
              Dashboard
            </li>
            <li onClick={() => push('/')}>
              <AiOutlineSetting/>
              Configurations
            </li>
            <li onClick={() => push('/')}>
              <MdManageAccounts/>
              Manage accounts
            </li>
            <li onClick={() => push('/')}>
              <AiOutlineProfile/>
              Logs
            </li>
            <li onClick={handleLogout}>
              <AiOutlineLogout/>
              Logout
            </li>
          </ul>
        </div>
        <main className={`${styles.mainWrapper} ${roboto.className}`}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
