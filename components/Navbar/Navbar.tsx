'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../../config/firebaseConfig';
import { signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

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
        <div className={styles.navContainer}>
            <div>
                <h1>RemindMe</h1>
            </div>
            <div>
                <ul>
                    <Link href='/'><li>HOME</li></Link>
                    <Link href='/HowItWorks'><li>HOW IT WORKS</li></Link>
                    {user ? (
                        <>
                            <Link href='/ViewReminders'><li>VIEW REMINDERS</li></Link>
                            <li onClick={handleLogout} style={{cursor: 'pointer'}}>LOG OUT</li>
                        </>
                    ) : (
                        <>
                            <Link href='/Signup'><li>SIGN UP</li></Link>
                            <Link href='/Login'><li>LOG IN</li></Link>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Navbar;