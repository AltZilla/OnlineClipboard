import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import Clipboard from '@/models/Clipboard';
import webpush from 'web-push';

export const runtime = 'nodejs';

// Initialize web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

console.log('[PUSH DEBUG] VAPID_PUBLIC_KEY configured:', !!VAPID_PUBLIC_KEY, 'length:', VAPID_PUBLIC_KEY.length);
console.log('[PUSH DEBUG] VAPID_PRIVATE_KEY configured:', !!VAPID_PRIVATE_KEY, 'length:', VAPID_PRIVATE_KEY.length);

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    console.log('[PUSH DEBUG] Setting VAPID details...');
    webpush.setVapidDetails(
        'mailto:clipboard@example.com',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
    console.log('[PUSH DEBUG] VAPID details set successfully');
} else {
    console.warn('[PUSH DEBUG] VAPID keys not configured - push notifications will not work!');
}

// POST - Send notification to a device about a new clipboard
export async function POST(request: NextRequest) {
    console.log('[PUSH DEBUG] === Send notification request received ===');

    try {
        await connectDB();

        const body = await request.json();
        const { clipboardId, receiveCode } = body;
        console.log('[PUSH DEBUG] Request body:', { clipboardId, receiveCode });

        if (!clipboardId || !receiveCode) {
            console.log('[PUSH DEBUG] Missing required fields');
            return NextResponse.json(
                { success: false, error: 'Clipboard ID and receive code are required' },
                { status: 400 }
            );
        }

        // Get the target device (case-insensitive)
        const device = await Device.findOne({
            receiveCode: { $regex: new RegExp(`^${receiveCode.trim()}$`, 'i') }
        });
        console.log('[PUSH DEBUG] Device found:', !!device);

        if (!device) {
            console.log('[PUSH DEBUG] Device not found for receive code:', receiveCode);
            return NextResponse.json(
                { success: false, error: 'Device not found with that receive code' },
                { status: 404 }
            );
        }

        console.log('[PUSH DEBUG] Device details:', {
            receiveCode: device.receiveCode,
            deviceName: device.deviceName,
            hasPushSubscription: !!device.pushSubscription,
            hasEndpoint: !!device.pushSubscription?.endpoint,
            hasKeys: !!device.pushSubscription?.keys,
            endpointPreview: device.pushSubscription?.endpoint?.substring(0, 50) + '...'
        });

        // Get clipboard info for the notification
        const clipboard = await Clipboard.findOne({ id: clipboardId });

        if (!clipboard) {
            console.log('[PUSH DEBUG] Clipboard not found:', clipboardId);
            return NextResponse.json(
                { success: false, error: 'Clipboard not found' },
                { status: 404 }
            );
        }

        let notificationSent = false;
        let pushError: any = null;

        // Check all conditions for sending push
        const hasPushSubscription = !!device.pushSubscription?.endpoint;
        const hasVapidKeys = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

        console.log('[PUSH DEBUG] Push conditions:', {
            hasPushSubscription,
            hasVapidKeys,
            canSendPush: hasPushSubscription && hasVapidKeys
        });

        // Try to send push notification if device has subscription
        if (hasPushSubscription && hasVapidKeys) {
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

                console.log('[PUSH DEBUG] Sending push notification with payload:', payload);
                console.log('[PUSH DEBUG] Push subscription endpoint:', device.pushSubscription?.endpoint);

                await webpush.sendNotification(
                    {
                        endpoint: device.pushSubscription!.endpoint,
                        keys: device.pushSubscription!.keys
                    },
                    payload
                );

                notificationSent = true;
                console.log('[PUSH DEBUG] ✅ Push notification sent successfully!');
            } catch (err: any) {
                pushError = err;
                console.error('[PUSH DEBUG] ❌ Push notification failed:', {
                    message: err.message,
                    statusCode: err.statusCode,
                    body: err.body,
                    headers: err.headers
                });

                // If push subscription is invalid, remove it
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log('[PUSH DEBUG] Subscription expired/invalid, removing from device');
                    device.pushSubscription = undefined;
                    await device.save();
                }
            }
        } else {
            console.log('[PUSH DEBUG] Skipping push notification - conditions not met');
        }

        const response = {
            success: true,
            clipboardId,
            notificationSent,
            debug: {
                hasPushSubscription,
                hasVapidKeys,
                pushError: pushError ? { message: pushError.message, statusCode: pushError.statusCode } : null
            },
            message: notificationSent
                ? 'Clipboard created and notification sent!'
                : 'Clipboard created! Open the app on your device to see it.'
        };

        console.log('[PUSH DEBUG] Response:', response);
        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[PUSH DEBUG] Error in send route:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
