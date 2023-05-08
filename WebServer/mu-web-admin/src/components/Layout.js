import Head from 'next/head';
import styles from '@/styles/Main.module.css';
import axios from 'axios';
import {Roboto} from 'next/font/google';

const roboto = Roboto({subsets: ['latin'], weight: '400'});
import {useRouter} from 'next/router';
import {
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineProfile,
  AiOutlineSetting,
} from 'react-icons/ai';
import {
  MdManageAccounts,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md';
import {RxDotFilled} from 'react-icons/rx';
import {useEffect, useState} from 'react';

const Layout = ({children}) => {
  const router = useRouter();
  const handleLogout = e => {
    e.preventDefault();
    axios.get('/api/logout').then(() => {
      router.push('/login').then();
    });
  };

  const toggleSubmenu = parentName => {
    setMenuItems((prev) => {
      menuItems.forEach((menu, index) => {
        if (menu.text === parentName) {
          prev[index].subMenuOpen = !prev[index].subMenuOpen;
          prev[index].isActive = !prev[index].isActive;
        }
      });
      return [...prev];
    });
  };

  const menuItemsInitial = [
    {
      text: 'Dashboard',
      icon: <AiOutlineHome/>,
      onClick: () => router.push('/'),
      pattern: '/',
      isActive: false,
    },
    {
      text: 'Configurations',
      icon: <AiOutlineSetting/>,
      onClick: () => router.push('/'),
      pattern: '/configurations',
      isActive: false,
    },
    {
      text: 'Manage accounts',
      icon: <MdManageAccounts/>,
      onClick: () => router.push('/'),
      pattern: '/manage-accounts',
      isActive: false,
    },
    {
      text: 'Logs',
      icon: <AiOutlineProfile/>,
      onClick: () => toggleSubmenu('Logs'),
      pattern: '/logs/[slug]',
      isActive: false,
      subMenuOpen: false,
      subMenu: [
        {
          text: 'ConnectServer',
          icon: <RxDotFilled/>,
          onClick: (e) => {
            e.stopPropagation();
            return router.push('/logs/ConnectServer');
          },
          pattern: '/logs/ConnectServer',
          isActive: false,
        },
        {
          text: 'JoinServer',
          icon: <RxDotFilled/>,
          onClick: (e) => {
            e.stopPropagation();
            return router.push('/logs/JoinServer');
          },
          pattern: '/logs/JoinServer',
          isActive: false,
        }
      ]
    },
    {
      text: 'Logout',
      icon: <AiOutlineLogout/>,
      onClick: handleLogout,
      pattern: '/logout',
      isActive: false,
    }
  ];

  const [menuItems, setMenuItems] = useState(menuItemsInitial);


  useEffect(() => {
    if (!menuItems) {
      return '';
    }
    const setActiveMenus = array => {
      array.forEach((menu, index) => {
        if (menu.pattern === router.asPath || menu.pattern === router.pathname) {
          array[index].isActive = true;
          if (Object.prototype.hasOwnProperty.call(array[index], 'subMenuOpen')) {
            array[index].subMenuOpen = true;
            if (array[index].subMenu.length) {
              setActiveMenus(array[index].subMenu);
            }
          }
        }
        else {
          array[index].isActive = false;
          if (Object.prototype.hasOwnProperty.call(array[index], 'subMenuOpen')) {
            array[index].subMenuOpen = false;
            if (array[index].subMenu.length) {
              setActiveMenus(array[index].subMenu);
            }
          }
        }
      });
    };
    setMenuItems(prev => {
      setActiveMenus(prev);
      return [...prev];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath, router.pathname]);

  const renderMenuItems = menuItems => {
    if (!menuItems) {
      return '';
    }
    const render = [];
    menuItems.forEach((menuObject, key) => {
      const hasSubmenu = menuObject?.subMenu?.length;
      const renderSubMenu = () => {
        if (!hasSubmenu || !menuObject.subMenuOpen) {
          return '';
        }
        return (
          <ul className={styles.navUl}>
            {renderMenuItems(menuObject.subMenu)}
          </ul>
        );
      };

      const displaySubMenuArrow = () => {
        if (!hasSubmenu) {
          return '';
        }
        return menuObject.subMenuOpen ? <MdOutlineKeyboardArrowDown/> :
          <MdOutlineKeyboardArrowRight/>;
      };

      render.push(
        <li
          key={`menu-${key}`}
          onClick={menuObject.onClick}
          className={`${menuObject.isActive ? styles.navMenuActive : ''} ${hasSubmenu ? `${styles.hasSubmenu} hasSubmenu` : ''}`}
        >
          {menuObject.icon}
          {menuObject.text}
          {displaySubMenuArrow()}
          {renderSubMenu()}
        </li>
      );
    });
    return render;
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
            {renderMenuItems(menuItems)}
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
