import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {Roboto} from 'next/font/google';

import {
    AiOutlineHome,
    AiOutlineSetting,
    AiOutlineProfile,
    AiOutlineLogout
} from 'react-icons/ai';
import {
    IoMdClose,
    IoMdMenu
} from 'react-icons/io';
import{
    MdManageAccounts
} from 'react-icons/md';

const roboto = Roboto({subsets: ['latin'], weight: '400'});

import NavLink from './NavLink';

import styles from '@/styles/Nav.module.css';

const Nav = () => {
    const router = useRouter();
    const [nav, setNav] = useState(false);

    const handleLogout = () => {
        axios.get('/api/logout').then(() => {
          router.push('/login').then();
        });
      };

    return(
        <nav className={`${styles.mainNav} ${nav && styles.mainNavActive}`}>
            <ul className={`${styles.mainNavList} ${nav && styles.mainNavListActive}`}>
                <li><NavLink href='/' exact className={styles.mainNavLink} onClick={ () => setNav(false) }><AiOutlineHome className={styles.mainNavLinkImage} />Dashboard</NavLink></li>
                <li><NavLink href='/configurations'className={styles.mainNavLink} onClick={ () => setNav(false) }><AiOutlineSetting className={styles.mainNavLinkImage} />Configurations</NavLink></li>
                <li><NavLink href='/manage-accounts'className={styles.mainNavLink} onClick={ () => setNav(false) }><MdManageAccounts className={styles.mainNavLinkImage} />Manage Accounts</NavLink></li>
                <li>
                    <NavLink href='/logs' collapsable>
                        <summary><AiOutlineProfile className={styles.mainNavLinkImage} />Logs</summary>
                        <ul>
                            <li><NavLink href='/logs/ConnectServer' className={styles.mainNavLink} onClick={ () => setNav(false) }><AiOutlineHome className={styles.mainNavLinkImage} />ConnectServer</NavLink></li>
                            <li><NavLink href='/logs/JoinServer' className={styles.mainNavLink} onClick={ () => setNav(false) }><AiOutlineHome className={styles.mainNavLinkImage} />JoinServer</NavLink></li>
                        </ul>
                    </NavLink>
                </li>
                <li><button type='button' className={`${styles.button} ${roboto.className}`} onClick={ () => handleLogout() }><AiOutlineLogout className={styles.mainNavLinkImage} />Logout</button></li>
            </ul>
            <div className={styles.navToggle}>
                <button type='button' className={styles.button} onClick={() => setNav(!nav)}>{nav ? <IoMdClose className={styles.mainNavLinkImage} /> : <IoMdMenu className={styles.mainNavLinkImage} />}</button>
            </div>
        </nav>
    )
}

export default Nav;