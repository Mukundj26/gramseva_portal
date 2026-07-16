import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'src/firebase/db_simulator.json');

// Helper to load db from file or return null if not exists
function loadDbFromFile() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading simulator db file:', e);
  }
  return null;
}

// Helper to save db to file
function saveDbToFile(data: any) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing simulator db file:', e);
  }
}

export async function GET() {
  const dbData = loadDbFromFile();
  if (dbData) {
    return NextResponse.json(dbData);
  }
  return NextResponse.json({ initialized: false });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    saveDbToFile(data);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
