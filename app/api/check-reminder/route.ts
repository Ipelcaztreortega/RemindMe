import { NextResponse } from 'next/server';
import { checkAndSendReminders } from '../../../services/reminderService';
import { db } from '../../../config/firebaseConfig';

export async function POST() {
    try {
        await checkAndSendReminders(db);
        return NextResponse.json({ message: 'Reminders checked and sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error checking reminders:', error);
        return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'This endpoint only accepts POST requests' }, { status: 405 });
}