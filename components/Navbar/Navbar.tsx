'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../../config/firebaseConfig';
import { signOut, User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <nav className={styles.navContainer}>
            <div className={styles.logo}>
                <h1>RemindMe</h1>
            </div>
            <ul className={styles.navList}>
                <li>
                    <Link href='/' className={`${styles.navItem} ${pathname === '/' ? styles.activeNavItem : ''}`}>
                        HOME
                    </Link>
                </li>
                <li>
                    <Link href='/HowItWorks' className={`${styles.navItem} ${pathname === '/HowItWorks' ? styles.activeNavItem : ''}`}>
                        HOW IT WORKS
                    </Link>
                </li>
                {user ? (
                    <>
                        <li>
                            <Link href='/ViewReminders' className={`${styles.navItem} ${pathname === '/ViewReminders' ? styles.activeNavItem : ''}`}>
                                VIEW REMINDERS
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className={styles.logoutButton}>LOG OUT</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link href='/Signup' className={`${styles.navItem} ${pathname === '/Signup' ? styles.activeNavItem : ''}`}>
                                SIGN UP
                            </Link>
                        </li>
                        <li>
                            <Link href='/Login' className={`${styles.navItem} ${pathname === '/Login' ? styles.activeNavItem : ''}`}>
                                LOG IN
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;