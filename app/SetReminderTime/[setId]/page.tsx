'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';
import styles from '../SetReminderTime.module.css';

interface Task {
    id: string;
    category: string;
    date: string;
    task: string;
}

interface ReminderSet {
    id: string;
    name: string;
    tasks: Task[];
    reminderPreferences?: {
        oneDay: boolean;
        oneWeek: boolean;
    };
}

interface SetReminderTimeProps {
    params: { setId: string }
}

export default function SetReminderTime({ params }: SetReminderTimeProps) {
    const { setId } = params;
    const [reminderSet, setReminderSet] = useState<ReminderSet | null>(null);
    const [oneDay, setOneDay] = useState(false);
    const [oneWeek, setOneWeek] = useState(false);
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchReminderSet = async () => {
            if (!setId) {
                alert('No reminder set ID provided');
                router.push('/ViewReminders');
                return;
            }

            const reminderSetDoc = await getDoc(doc(db, 'reminderSets', setId));
            if (!reminderSetDoc.exists()) {
                alert('Reminder set not found');
                router.push('/ViewReminders');
                return;
            }

            const tasksCollection = collection(reminderSetDoc.ref, 'tasks');
            const tasksSnapshot = await getDocs(tasksCollection);
            const tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task));

            setReminderSet({
                id: reminderSetDoc.id,
                name: reminderSetDoc.data().name,
                tasks: tasks,
                reminderPreferences: reminderSetDoc.data().reminderPreferences
            });

            if (reminderSetDoc.data().reminderPreferences) {
                setOneDay(reminderSetDoc.data().reminderPreferences.oneDay);
                setOneWeek(reminderSetDoc.data().reminderPreferences.oneWeek);
            }

            const user = auth.currentUser;
            if (user) {
                setEmail(user.email || '');
                setPhoneNumber(user.phoneNumber || '');
            }
        };

        fetchReminderSet();
    }, [setId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reminderSet) return;

        try {
            await updateDoc(doc(db, 'reminderSets', reminderSet.id), {
                reminderPreferences: { oneDay, oneWeek },
                contactEmail: email,
                contactPhone: phoneNumber
            });

            console.log('Reminder preferences saved. Setting up reminders...');

            reminderSet.tasks.forEach(task => {
                const dueDate = new Date(task.date);
                if (oneDay) {
                    const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
                    console.log(`Set reminder for ${task.task} on ${oneDayBefore.toDateString()}`);
                }
                if (oneWeek) {
                    const oneWeekBefore = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                    console.log(`Set reminder for ${task.task} on ${oneWeekBefore.toDateString()}`);
                }
            });

            alert('Reminder preferences saved and reminders set!');
            router.push('/ViewReminders');
        } catch (error) {
            console.error('Error saving reminder preferences:', error);
            alert('Failed to save reminder preferences. Please try again.');
        }
    };

    if (!reminderSet) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Set Reminder Times for {reminderSet.name}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.checkboxGroup}>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={oneDay} 
                            onChange={(e) => setOneDay(e.target.checked)} 
                        />
                        Remind me 1 day before due date
                    </label>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={oneWeek} 
                            onChange={(e) => setOneWeek(e.target.checked)} 
                        />
                        Remind me 1 week before due date
                    </label>
                </div>
                <div className={styles.inputGroup}>
                    <label>
                        Email for reminders:
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </label>
                    {/* Uncomment this section if you want to include phone number input
                    <label>
                        Phone number for reminders:
                        <input 
                            type="tel" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                        />
                    </label>
                    */}
                </div>
                <button type="submit" className={styles.submitButton}>Save Reminder Preferences</button>
            </form>
        </div>
    );
}