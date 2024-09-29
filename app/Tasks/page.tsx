'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Tasks.module.css';

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

function TaskPage() {
    const [reminderSet, setReminderSet] = useState<ReminderSet | null>(null);
    const [user, setUser] = useState(auth.currentUser);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const setId = searchParams.get('setId');

    const fetchReminderSet = useCallback(async (setId: string) => {
        setIsLoading(true);
        try {
            const reminderSetDocRef = doc(db, 'reminderSets', setId);
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
    }, [router, setId, fetchReminderSet]);

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
            router.push(`/SetReminderTime?setId=${reminderSet.id}`);
        }
    };

    if (!user) {
        return <div>Please log in to view your tasks.</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!reminderSet) {
        return <div>Reminder set not found.</div>;
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
            <button onClick={handleConfirm} className={styles.confirmButton}>
                Confirm and Set Reminder Time
            </button>
        </div>
    );
}

export default TaskPage;