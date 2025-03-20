import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'users.txt');

// ✅ Function to read data safely
const readFileData = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', 'utf-8'); // Ensure file exists
    return [];
  }
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8').trim();
    return fileData ? fileData.split('\n').map(line => JSON.parse(line)) : [];
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

// ✅ Function to write data safely
const writeFileData = (entries) => {
  try {
    fs.writeFileSync(filePath, entries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
  } catch (error) {
    console.error("Error writing to file:", error);
    throw new Error("Failed to save data");
  }
};

// ✅ Function to handle saving tax data
const saveData = async (newEntry) => {
  let entries = readFileData();
  const index = entries.findIndex(entry => entry.taxCode === newEntry.taxCode);

  if (index !== -1) {
    if (newEntry.isEditing) {
      entries[index] = newEntry;
    } else {
      return { success: false, message: 'Tax entry already exists. Please edit instead!' };
    }
  } else {
    entries.push(newEntry);
  }

  writeFileData(entries);
  return { success: true, message: 'Tax Details Successfully Saved!' };
};

// ✅ GET request to fetch all tax entries
export async function GET() {
  try {
    const entries = readFileData();
    return new Response(JSON.stringify(entries), { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ success: false, message: 'Error fetching data' }), { status: 500 });
  }
}

// ✅ POST request that calls saveData function
export async function POST(req) {
  try {
    const newEntry = await req.json();
    console.log("Received Data:", newEntry); // Debugging output

    const result = await saveData(newEntry);

    if (result.success) {
      return new Response(JSON.stringify(result), { status: 200 });
    } 
    else {
      return new Response(JSON.stringify(result), { status: 400 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error!' }), { status: 500 });
  }
}

