import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';

export const runtime = 'nodejs';

// GET - Get device by receive code
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const receiveCode = searchParams.get('receiveCode')?.trim();

        if (!receiveCode) {
            return NextResponse.json({ success: false, error: 'Receive code required' }, { status: 400 });
        }

        // Case-insensitive search
        const device = await Device.findOne({
            receiveCode: { $regex: new RegExp(`^${receiveCode}$`, 'i') }
        });

        if (!device) {
            return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        // Update last seen
        device.lastSeen = new Date();
        await device.save();

        return NextResponse.json({
            success: true,
            device: {
                receiveCode: device.receiveCode,
                deviceName: device.deviceName,
                hasPush: !!device.pushSubscription?.endpoint,
                createdAt: device.createdAt
            }
        });
    } catch (error) {
        console.error('Error getting device:', error);
        return NextResponse.json({ success: false, error: 'Failed to get device info' }, { status: 500 });
    }
}

// POST - Register a new device with receive code
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { receiveCode, deviceName, pushSubscription } = body;

        if (!receiveCode) {
            return NextResponse.json(
                { success: false, error: 'Receive code is required' },
                { status: 400 }
            );
        }

        // Clean the code but preserve case
        const cleanCode = receiveCode.trim().replace(/[^a-zA-Z0-9-_]/g, '');

        // Validate receive code
        if (cleanCode.length < 3) {
            return NextResponse.json(
                { success: false, error: 'Receive code must be at least 3 characters' },
                { status: 400 }
            );
        }

        if (cleanCode.length > 30) {
            return NextResponse.json(
                { success: false, error: 'Receive code must be 30 characters or less' },
                { status: 400 }
            );
        }

        // Check if code is already taken (case-insensitive check)
        const existingDevice = await Device.findOne({
            receiveCode: { $regex: new RegExp(`^${cleanCode}$`, 'i') }
        });

        if (existingDevice) {
            return NextResponse.json(
                { success: false, error: 'This receive code is already taken. Please choose a different one.' },
                { status: 409 }
            );
        }

        // Create new device
        const device = new Device({
            receiveCode: cleanCode,
            deviceName: deviceName || 'My Device',
            pushSubscription: pushSubscription || undefined,
            lastSeen: new Date(),
            createdAt: new Date()
        });

        await device.save();

        return NextResponse.json({
            success: true,
            device: {
                receiveCode: device.receiveCode,
                deviceName: device.deviceName,
                createdAt: device.createdAt
            }
        });
    } catch (error: any) {
        console.error('Error registering device:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'This receive code is already taken. Please choose a different one.' },
                { status: 409 }
            );
        }

        return NextResponse.json({ success: false, error: 'Failed to register device' }, { status: 500 });
    }
}

// PUT - Update device settings (name, push subscription)
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { receiveCode, deviceName, pushSubscription } = body;

        if (!receiveCode) {
            return NextResponse.json({ success: false, error: 'Receive code required' }, { status: 400 });
        }

        // Case-insensitive search
        const cleanCode = receiveCode.trim();
        const device = await Device.findOne({
            receiveCode: { $regex: new RegExp(`^${cleanCode}$`, 'i') }
        });

        if (!device) {
            return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        // Update fields
        if (deviceName) device.deviceName = deviceName;
        if (pushSubscription) device.pushSubscription = pushSubscription;
        device.lastSeen = new Date();

        await device.save();

        return NextResponse.json({
            success: true,
            device: {
                receiveCode: device.receiveCode,
                deviceName: device.deviceName,
                hasPush: !!device.pushSubscription?.endpoint
            }
        });
    } catch (error) {
        console.error('Error updating device:', error);
        return NextResponse.json({ success: false, error: 'Failed to update device' }, { status: 500 });
    }
}

// DELETE - Unregister a device
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const receiveCode = searchParams.get('receiveCode')?.trim();

        if (!receiveCode) {
            return NextResponse.json({ success: false, error: 'Receive code required' }, { status: 400 });
        }

        // Case-insensitive delete
        await Device.deleteOne({
            receiveCode: { $regex: new RegExp(`^${receiveCode}$`, 'i') }
        });

        return NextResponse.json({ success: true, message: 'Device unregistered' });
    } catch (error) {
        console.error('Error deleting device:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete device' }, { status: 500 });
    }
}
