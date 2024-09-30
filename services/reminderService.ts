import { Firestore, collection, getDocs, Timestamp, QueryDocumentSnapshot} from 'firebase/firestore';
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
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;

export async function checkAndSendReminders(db: Firestore) {
    const now = Timestamp.now();
    const tomorrow = new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds);

    const reminderSetsCollection = collection(db, 'reminderSets');
    const reminderSetsSnapshot = await getDocs(reminderSetsCollection);

    for (const reminderSetDoc of reminderSetsSnapshot.docs) {
        await processReminderSet(db, reminderSetDoc, now, tomorrow);
    }
}

async function processReminderSet(db: Firestore, reminderSetDoc: QueryDocumentSnapshot, now: Timestamp, tomorrow: Timestamp) {
    try {
        const reminderSet = reminderSetDoc.data() as ReminderSet;
        const tasksCollection = collection(db, 'reminderSets', reminderSetDoc.id, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollection);

        for (const taskDoc of tasksSnapshot.docs) {
            const taskData = taskDoc.data() as Task;
            await checkAndSendTaskReminder(reminderSet, taskData, now, tomorrow);
        }
    } catch (error) {
        console.error(`Error processing reminder set ${reminderSetDoc.id}:`, error);
    }
}

async function checkAndSendTaskReminder(reminderSet: ReminderSet, task: Task, now: Timestamp, tomorrow: Timestamp) {
    const dueDate = task.Date ? new Date(task.Date) : null;

    if (dueDate) {
        const oneDayBefore = new Date(dueDate.getTime() - ONE_DAY_MS);
        const oneWeekBefore = new Date(dueDate.getTime() - ONE_WEEK_MS);

        if (
            (reminderSet.reminderPreferences.oneDay && isWithinNextDay(oneDayBefore, now, tomorrow)) ||
            (reminderSet.reminderPreferences.oneWeek && isWithinNextDay(oneWeekBefore, now, tomorrow))
        ) {
            await sendReminder(reminderSet, task);
        }
    }
}

function isWithinNextDay(date: Date, now: Timestamp, tomorrow: Timestamp): boolean {
    return date >= now.toDate() && date <= tomorrow.toDate();
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