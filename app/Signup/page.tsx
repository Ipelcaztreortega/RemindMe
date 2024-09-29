'use client';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { useRouter } from 'next/navigation';
import styles from './Signup.module.css';

function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // You can add the phone number to the user's profile here if needed
            router.push('/');
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Failed to sign up. Please try again.');
        }
    };

    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error) {
            console.error('Error signing up with Google:', error);
            alert('Failed to sign up with Google. Please try again.');
        }
    };

    return (
        <div className={styles.SignUpContainer}>
            <div>
                <h1>Sign up</h1>
                <form onSubmit={handleSignup}>
                    <label>
                        Email:
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        Password:
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        Phone Number:
                        <input 
                            type="tel" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                        />
                    </label>
                    <button type="submit">Sign Up</button>
                </form>
                <button onClick={handleGoogleSignup}>Sign Up with Google</button>
            </div>
            <div>
                <h1>Why should I sign up?</h1>
                <ol>
                    <li>You can delete reminders</li>
                    <li>You can update reminder times</li>
                    <li>You can stop reminders entirely</li>
                    <li>You can see all your reminders</li>
                    <li>You can change the email or phone number that reminders are sent to</li>
                </ol>
            </div>
        </div>
    );
}

export default SignupPage;