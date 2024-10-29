'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Failed to log in. Please check your credentials and try again.');
        }
    };

    return (
        <div className={styles.LoginContainer}>
            <div className={styles.LoginBox}>
                <h1 className={styles.Title}>Login</h1>
                <form className={styles.Form} onSubmit={handleLogin}>
                    <label className={styles.Label}>
                        Email:
                        <input 
                            className={styles.Input}
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </label>
                    <label className={styles.Label}>
                        Password:
                        <input 
                            className={styles.Input}
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </label>
                    <button className={`${styles.Button} ${styles.SubmitButton}`} type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;