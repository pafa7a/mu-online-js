import { useRouter } from 'next/router';
import Link from 'next/link';

import styles from '@/styles/Nav.module.css';

const NavLink = ({ href, exact = false, collapsable = false, children, ...props }) => {
    const router = useRouter();
    const slug = router.query.slug;
    let relativeURL;
    if(slug){
        relativeURL = router.pathname.replace("[slug]", slug);
    }else{
        relativeURL = router.pathname;
    }

    const isActive = exact ? relativeURL === href : relativeURL.startsWith(href);

    if(isActive){
        if(collapsable) props.open = '0';
        props.className += ` ${styles.active}`;
    }

    if(collapsable){
        props.className += ` ${styles.collapsable}`;
        return <details {...props}>{children}</details>;
    }

    return(
        <Link href={href} {...props}>{children}</Link>
    );
}

export default NavLink;