'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { useRouter} from 'next/navigation';
import styles from './Tasks.module.css';

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
}

function TaskPage() {
    const [reminderSets, setReminderSets] = useState<ReminderSet[]>([]);
    const [user, setUser] = useState(auth.currentUser);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (!user) {
                router.push('/Login');
            } else {
                fetchReminderSets(user.uid);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchReminderSets = async (userId: string) => {
        const reminderSetsQuery = query(collection(db, 'reminderSets'), where('userId', '==', userId));
        const reminderSetsSnapshot = await getDocs(reminderSetsQuery);
        const reminderSetsList: ReminderSet[] = [];

        for (const reminderSetDoc of reminderSetsSnapshot.docs) {
            const tasksCollection = collection(reminderSetDoc.ref, 'tasks');
            const tasksSnapshot = await getDocs(tasksCollection);
            const tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task));

            reminderSetsList.push({
                id: reminderSetDoc.id,
                name: reminderSetDoc.data().name,
                tasks: tasks
            });
        }

        setReminderSets(reminderSetsList);
    };

    const handleDelete = async (reminderSetId: string, taskId: string) => {
        try {
            await deleteDoc(doc(db, 'reminderSets', reminderSetId, 'tasks', taskId));
            setReminderSets(prevSets => 
                prevSets.map(set => 
                    set.id === reminderSetId 
                        ? {...set, tasks: set.tasks.filter(task => task.id !== taskId)}
                        : set
                )
            );
            alert('Task deleted successfully!');
        } catch (error) {
            console.error('Error deleting task: ', error);
            alert('Error deleting task.');
        }
    };

    const handleConfirm = (reminderSetId: string) => {
        router.push(`/SetReminderTime?setId=${reminderSetId}`);
    };

    if (!user) {
        return <div>Please log in to view your tasks.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Your Reminder Sets</h1>
            {reminderSets.map((reminderSet) => (
                <div key={reminderSet.id} className={styles.reminderSet}>
                    <h2>{reminderSet.name}</h2>
                    <div className={styles.cardContainer}>
                        {reminderSet.tasks.map((task) => (
                            <div key={task.id} className={styles.card}>
                                <h3>{task.task}</h3>
                                <p>Category: {task.category}</p>
                                <p>Date: {task.date}</p>
                                <button onClick={() => handleDelete(reminderSet.id, task.id)} className={styles.deleteButton}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => handleConfirm(reminderSet.id)} className={styles.confirmButton}>
                        Confirm and Set Reminder Time
                    </button>
                </div>
            ))}
        </div>
    );
}

export default TaskPage;