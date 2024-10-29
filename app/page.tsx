'use client';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reminderSetName, setReminderSetName] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        router.push('/Login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file.');
      event.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !reminderSetName || !user) {
      alert('Please select a file, enter a reminder set name, and ensure you are logged in.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const csv = e.target?.result;
      if (typeof csv === 'string') {
        Papa.parse(csv, {
          header: true,
          complete: async (results) => {
            try {
              const reminderSetRef = doc(collection(db, 'reminderSets'));
              await setDoc(reminderSetRef, {
                name: reminderSetName,
                userId: user.uid,
                createdAt: new Date()
              });

              const tasksRef = collection(reminderSetRef, 'tasks');
              for (const row of results.data as Array<{Category: string, Date: string, Task: string}>) {
                await addDoc(tasksRef, {
                  Category: row.Category,
                  Date: row.Date,
                  Task: row.Task
                });
              }
              
              alert('CSV file was successfully processed!');
              router.push(`/Tasks/${reminderSetRef.id}`);
            } catch (error) {
              console.error('Error adding document: ', error);
              alert('Error uploading data to Firebase.');
            }
          }
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  if (!user) {
    return <div className={styles.container}>Please log in to upload reminders.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Begin Your Reminders</h1>
      <div className={styles.uploadSection}>
        <h2>What are these reminders for?</h2>
        <input
          type="text"
          value={reminderSetName}
          onChange={(e) => setReminderSetName(e.target.value)}
          placeholder="Enter reminder set name"
          className={styles.textInput}
        />
        <h2>Select your clean CSV file</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {selectedFile && (
          <p className={styles.fileName}>Selected file: {selectedFile.name}</p>
        )}
        <button onClick={handleUpload} className={styles.uploadButton}>
          Upload to Firebase
        </button>
      </div>
    </div>
  );
}