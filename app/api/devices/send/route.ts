import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import Clipboard from '@/models/Clipboard';
import webpush from 'web-push';

export const runtime = 'nodejs';

// Initialize web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:clipboard@example.com',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

// POST - Send notification to a device about a new clipboard
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { clipboardId, receiveCode } = body;

        if (!clipboardId || !receiveCode) {
            return NextResponse.json(
                { success: false, error: 'Clipboard ID and receive code are required' },
                { status: 400 }
            );
        }

        // Get the target device
        const device = await Device.findOne({ receiveCode: receiveCode.toLowerCase().trim() });

        if (!device) {
            return NextResponse.json(
                { success: false, error: 'Device not found with that receive code' },
                { status: 404 }
            );
        }

        // Get clipboard info for the notification
        const clipboard = await Clipboard.findOne({ id: clipboardId });

        if (!clipboard) {
            return NextResponse.json(
                { success: false, error: 'Clipboard not found' },
                { status: 404 }
            );
        }

        let notificationSent = false;

        // Try to send push notification if device has subscription
        if (device.pushSubscription?.endpoint && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
            try {
                const contentPreview = clipboard.content?.substring(0, 80) || '';
                const fileInfo = (clipboard.files?.length || 0) > 0
                    ? `📁 ${clipboard.files.length} file(s)`
                    : '';

                const payload = JSON.stringify({
                    title: '📋 New Clipboard Received!',
                    body: contentPreview || fileInfo || 'New clipboard',
                    data: {
                        clipboardId,
                        url: `/clipboard/${clipboardId}`
                    }
                });

                await webpush.sendNotification(
                    {
                        endpoint: device.pushSubscription.endpoint,
                        keys: device.pushSubscription.keys
                    },
                    payload
                );

                notificationSent = true;
            } catch (pushError: any) {
                console.error('Push notification failed:', pushError);
                // If push subscription is invalid, remove it
                if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                    device.pushSubscription = undefined;
                    await device.save();
                }
            }
        }

        return NextResponse.json({
            success: true,
            clipboardId,
            notificationSent,
            message: notificationSent
                ? 'Clipboard created and notification sent!'
                : 'Clipboard created! Open the app on your device to see it.'
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
