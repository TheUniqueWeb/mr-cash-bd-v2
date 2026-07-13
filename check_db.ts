import 'dotenv/config';
import { db } from './src/db/index';
import { systemSettings } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const settings = await db.select().from(systemSettings).where(eq(systemSettings.id, 'global'));
  console.log(JSON.stringify(settings, null, 2));
  process.exit(0);
}
run();
