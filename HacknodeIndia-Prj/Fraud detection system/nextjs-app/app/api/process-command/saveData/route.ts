import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { AccessLog, BranchMetrics } from '../../../types'; // adjust path as needed

export async function POST(req: NextRequest) {
  try {
    const { accessLogs, metrics }: { accessLogs: AccessLog[]; metrics: BranchMetrics } = await req.json();

    const dataFolder = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

    // timestamp for filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 1️⃣ Save all access logs
    const accessLogsCsv = createObjectCsvWriter({
      path: path.join(dataFolder, `accessLogs_${timestamp}.csv`),
      header: [
        { id: 'user', title: 'User' },
        { id: 'branch', title: 'Branch' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'purpose', title: 'Purpose' },
        { id: 'suspicious', title: 'Suspicious' },
      ],
    });
    await accessLogsCsv.writeRecords(accessLogs);

    // 2️⃣ Save suspicious attempts separately
    const suspiciousLogs = accessLogs.filter((log: AccessLog) => log.suspicious);
    const suspiciousCsv = createObjectCsvWriter({
      path: path.join(dataFolder, `suspiciousAttempts_${timestamp}.csv`),
      header: [
        { id: 'user', title: 'User' },
        { id: 'branch', title: 'Branch' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'purpose', title: 'Purpose' },
      ],
    });
    await suspiciousCsv.writeRecords(suspiciousLogs);

    // 3️⃣ Save branch activity
    const branchActivityCsv = createObjectCsvWriter({
      path: path.join(dataFolder, `branchActivity_${timestamp}.csv`),
      header: [
        { id: 'branch', title: 'Branch' },
        { id: 'accesses', title: 'Accesses' },
      ],
    });
    const branchRecords = Object.entries(metrics.branchActivity).map(([branch, accesses]) => ({
      branch,
      accesses,
    }));
    await branchActivityCsv.writeRecords(branchRecords);

    // 4️⃣ Save metrics summary
    const metricsCsv = createObjectCsvWriter({
      path: path.join(dataFolder, `metricsSummary_${timestamp}.csv`),
      header: [
        { id: 'totalAccesses', title: 'Total Accesses' },
        { id: 'suspiciousAttempts', title: 'Suspicious Attempts' },
        { id: 'activeUsers', title: 'Active Users' },
      ],
    });
    await metricsCsv.writeRecords([{
      totalAccesses: metrics.totalAccesses,
      suspiciousAttempts: metrics.suspiciousAttempts,
      activeUsers: metrics.activeUsers,
    }]);

    return NextResponse.json({ success: true, message: 'All CSV files saved successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error saving CSV files' }, { status: 500 });
  }
}
