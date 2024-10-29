import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

function Footer() {
    return (
        <footer className={styles.FooterContainer}>
            <Link href="/privacy" className={styles.FooterLink}>
                Privacy
            </Link>
            <Link href="/feedback" className={styles.FooterLink}>
                Feedback
            </Link>
        </footer>
    );
}

export default Footer;