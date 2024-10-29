'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ViewReminders.module.css';

interface ReminderSet {
    id: string;
    name: string;
}

function ViewRemindersPage() {
    const [reminderSets, setReminderSets] = useState<ReminderSet[]>([]);
    const [user, setUser] = useState(auth.currentUser);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                router.push('/Login');
            } else {
                fetchReminderSets(currentUser.uid);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchReminderSets = async (userId: string) => {
        setIsLoading(true);
        try {
            const reminderSetsQuery = query(collection(db, 'reminderSets'), where('userId', '==', userId));
            const reminderSetsSnapshot = await getDocs(reminderSetsQuery);
            const reminderSetsList = reminderSetsSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));
            setReminderSets(reminderSetsList);
        } catch (error) {
            console.error('Error fetching reminder sets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div className={styles.container}>
            <p className={styles.errorMessage}>Please log in to view your reminders.</p>
        </div>;
    }

    if (isLoading) {
        return <div className={styles.container}>
            <p className={styles.loadingMessage}>Loading...</p>
        </div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Your Reminder Sets</h1>
            {reminderSets.length === 0 ? (
                <p className={styles.errorMessage}>You do not have any reminder sets yet.</p>
            ) : (
                <ul className={styles.reminderList}>
                    {reminderSets.map((reminderSet) => (
                        <li key={reminderSet.id} className={styles.reminderItem}>
                            <Link href={`/Tasks/${reminderSet.id}`}>
                                {reminderSet.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ViewRemindersPage;