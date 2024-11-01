'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';
import { useRouter } from 'next/navigation';
import styles from '../Tasks.module.css';

interface Task {
    id: string;
    Category: string;
    Date: string;
    Task: string;
}

interface ReminderSet {
    id: string;
    name: string;
    tasks: Task[];
}

interface TaskPageProps {
    params: { setId: string }
}

export default function TaskPage({ params }: TaskPageProps) {
    const { setId } = params;
    const [reminderSet, setReminderSet] = useState<ReminderSet | null>(null);
    const [user, setUser] = useState(auth.currentUser);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchReminderSet = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            const reminderSetDocRef = doc(db, 'reminderSets', id);
            const reminderSetDoc = await getDoc(reminderSetDocRef);
            
            if (reminderSetDoc.exists()) {
                const tasksCollection = collection(reminderSetDocRef, 'tasks');
                const tasksSnapshot = await getDocs(tasksCollection);
                const tasks = tasksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Task));

                setReminderSet({
                    id: reminderSetDoc.id,
                    name: reminderSetDoc.data().name,
                    tasks: tasks
                });
            } else {
                console.error('Reminder set not found');
                router.push('/ViewReminders');
            }
        } catch (error) {
            console.error('Error fetching reminder set:', error);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (!user) {
                router.push('/Login');
            } else if (setId) {
                fetchReminderSet(setId);
            } else {
                router.push('/ViewReminders');
            }
        });

        return () => unsubscribe();
    }, [setId, fetchReminderSet, router]);

    const handleDelete = async (taskId: string) => {
        if (!reminderSet) return;

        try {
            await deleteDoc(doc(db, 'reminderSets', reminderSet.id, 'tasks', taskId));
            setReminderSet(prevSet => 
                prevSet ? {
                    ...prevSet,
                    tasks: prevSet.tasks.filter(task => task.id !== taskId)
                } : null
            );
            alert('Task deleted successfully!');
        } catch (error) {
            console.error('Error deleting task: ', error);
            alert('Error deleting task.');
        }
    };

    const handleConfirm = () => {
        if (reminderSet) {
            router.push(`/SetReminderTime/${reminderSet.id}`);
        }
    };

    const handleDeleteReminderSet = async () => {
        if (!reminderSet) return;

        if (window.confirm('Are you sure you want to delete this entire reminder set? This action cannot be undone.')) {
            try {
                const tasksCollection = collection(db, 'reminderSets', reminderSet.id, 'tasks');
                const tasksSnapshot = await getDocs(tasksCollection);
                const deleteTasks = tasksSnapshot.docs.map(doc => 
                    deleteDoc(doc.ref)
                );
                await Promise.all(deleteTasks);

                await deleteDoc(doc(db, 'reminderSets', reminderSet.id));

                alert('Reminder set deleted successfully!');
                router.push('/ViewReminders');
            } catch (error) {
                console.error('Error deleting reminder set: ', error);
                alert('Error deleting reminder set.');
            }
        }
    };

    if (!user) {
        return <div className={styles.container}>Please log in to view your tasks.</div>;
    }

    if (isLoading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (!reminderSet) {
        return <div className={styles.container}>Reminder set not found.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{reminderSet.name}</h1>
            <div className={styles.cardContainer}>
                {reminderSet.tasks.map((task) => (
                    <div key={task.id} className={styles.card}>
                        <h3>{task.Task}</h3>
                        <p>Category: {task.Category}</p>
                        <p>Date: {task.Date}</p>
                        <button onClick={() => handleDelete(task.id)} className={styles.deleteButton}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <div className={styles.buttonContainer}>
                <button onClick={handleConfirm} className={styles.confirmButton}>
                    Confirm and Set Reminder Time
                </button>
                <button onClick={handleDeleteReminderSet} className={styles.deleteSetButton}>
                    Delete Reminder Set
                </button>
            </div>
        </div>
    );
}