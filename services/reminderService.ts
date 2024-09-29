import { Firestore, collection, getDocs, Timestamp } from 'firebase/firestore';
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

export async function checkAndSendReminders(db: Firestore) {
    const now = Timestamp.now();
    
    const reminderSetsCollection = collection(db, 'reminderSets');
    const reminderSetsSnapshot = await getDocs(reminderSetsCollection);

    for (const reminderSetDoc of reminderSetsSnapshot.docs) {
        const reminderSet = reminderSetDoc.data() as ReminderSet;
        const tasksCollection = collection(db, 'reminderSets', reminderSetDoc.id, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollection);

        for (const task of tasksSnapshot.docs) {
            const taskData = task.data() as Task;
            const dueDate = taskData.Date ? new Date(taskData.Date) : null;

            if (dueDate) {
                const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
                const oneWeekBefore = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);

                if (
                    (reminderSet.reminderPreferences.oneDay && isWithinLastHour(oneDayBefore, now)) ||
                    (reminderSet.reminderPreferences.oneWeek && isWithinLastHour(oneWeekBefore, now))
                ) {
                    await sendReminder(reminderSet, taskData);
                }
            }
        }
    }
}

function isWithinLastHour(date: Date, now: Timestamp): boolean {
    const hourAgo = new Date(now.toDate().getTime() - 60 * 60 * 1000);
    return date >= hourAgo && date <= now.toDate();
}

async function sendReminder(reminderSet: ReminderSet, task: Task) {
    if (reminderSet.contactEmail) {
        const message = `Reminder: "${task.Task}" is due on ${task.Date}`;
        await sendEmail(reminderSet.contactEmail, 'Task Reminder', message);
    }
}