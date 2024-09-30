import { Firestore, collection, getDocs, Timestamp, query, where, updateDoc, DocumentSnapshot } from 'firebase/firestore';
import { sendEmail } from './emailService';

interface Task {
    Task: string;
    Date: string;
}

interface ReminderSet {
    reminderPreferences: {
        oneDay: boolean;
        oneWeek: boolean;
    };
    contactEmail: string;
    lastChecked?: Timestamp;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;

export async function checkAndSendReminders(db: Firestore) {
    const now = Timestamp.now();
    const tomorrow = new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds);

    const reminderSetsCollection = collection(db, 'reminderSets');
    const activeRemindersQuery = query(
        reminderSetsCollection, 
        where('reminderPreferences.oneDay', '==', true), 
        where('reminderPreferences.oneWeek', '==', true)
    );

    const reminderSetsSnapshot = await getDocs(activeRemindersQuery);

    // Process reminder sets in parallel
    await Promise.all(reminderSetsSnapshot.docs.map(doc => processReminderSet(db, doc, now, tomorrow)));
}

async function processReminderSet(db: Firestore, reminderSetDoc: DocumentSnapshot, now: Timestamp, tomorrow: Timestamp) {
    try {
        const reminderSet = reminderSetDoc.data() as ReminderSet;
        const lastChecked = reminderSet.lastChecked ? reminderSet.lastChecked : Timestamp.fromMillis(0);

        const tasksCollection = collection(db, 'reminderSets', reminderSetDoc.id, 'tasks');
        const tasksQuery = query(tasksCollection, where('Date', '>', lastChecked.toDate()));
        const tasksSnapshot = await getDocs(tasksQuery);

        for (const taskDoc of tasksSnapshot.docs) {
            const taskData = taskDoc.data() as Task;
            await checkAndSendTaskReminder(reminderSet, taskData, now, tomorrow);
        }

        // Update the lastChecked timestamp
        await updateDoc(reminderSetDoc.ref, { lastChecked: now });
    } catch (error) {
        console.error(`Error processing reminder set ${reminderSetDoc.id}:`, error);
    }
}

async function checkAndSendTaskReminder(reminderSet: ReminderSet, task: Task, now: Timestamp, tomorrow: Timestamp) {
    const dueDate = task.Date ? Timestamp.fromDate(new Date(task.Date)) : null;

    if (dueDate) {
        if (shouldSendReminder(reminderSet, dueDate, now, tomorrow)) {
            await sendReminder(reminderSet, task);
        }
    }
}

function shouldSendReminder(reminderSet: ReminderSet, dueDate: Timestamp, now: Timestamp, tomorrow: Timestamp): boolean {
    const dueDateMs = dueDate.toMillis();
    const nowMs = now.toMillis();
    const tomorrowMs = tomorrow.toMillis();

    return (
        (reminderSet.reminderPreferences.oneDay && isWithinNextDay(dueDateMs - ONE_DAY_MS, nowMs, tomorrowMs)) ||
        (reminderSet.reminderPreferences.oneWeek && isWithinNextDay(dueDateMs - ONE_WEEK_MS, nowMs, tomorrowMs))
    );
}

function isWithinNextDay(targetMs: number, nowMs: number, tomorrowMs: number): boolean {
    return targetMs >= nowMs && targetMs <= tomorrowMs;
}

async function sendReminder(reminderSet: ReminderSet, task: Task) {
    if (reminderSet.contactEmail) {
        const dueDate = new Date(task.Date);
        const reminderTime = dueDate.getTime() - ONE_DAY_MS > Date.now() ? 
            "one week before" : "one day before";
        const message = `Reminder: "${task.Task}" is due on ${task.Date}. This is your ${reminderTime} reminder.`;
        
        try {
            await sendEmail(reminderSet.contactEmail, 'Task Reminder', message);
            console.log(`Reminder sent for task "${task.Task}" to ${reminderSet.contactEmail}`);
        } catch (error) {
            console.error(`Error sending reminder for task "${task.Task}":`, error);
        }
    }
}