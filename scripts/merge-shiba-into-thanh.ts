// One-off: merge member "Shiba" into "Thành" in Firestore.
//   npx tsx scripts/merge-shiba-into-thanh.ts <backup.json>           dry run: backs up, prints what would change
//   npx tsx scripts/merge-shiba-into-thanh.ts <backup.json> --apply   writes the changes
// Safe to run twice: a second run finds nothing left to change.
import 'dotenv/config';
import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Movie, WeekendSession } from '../src/types/cinema.ts';
import { mergeMovie, mergeSession } from '../src/utils/mergeMember.ts';

const FROM = 'Shiba';
const TO = 'Thành';
const [backupPath, flag] = process.argv.slice(2);
if (!backupPath) throw new Error('Usage: merge-shiba-into-thanh.ts <backup.json> [--apply]');
const apply = flag === '--apply';

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) });
const db = getFirestore();

const [movies, sessions, prophecies] = await Promise.all(['movies', 'sessions', 'prophecies'].map((c) => db.collection(c).get()));
fs.writeFileSync(backupPath, JSON.stringify(Object.fromEntries([['movies', movies], ['sessions', sessions], ['prophecies', prophecies]].map(([k, s]: any) => [k, s.docs.map((d: any) => ({ id: d.id, ...d.data() }))])), null, 2));
console.log(`Backup written to ${backupPath}`);

const writes: { ref: FirebaseFirestore.DocumentReference; data: Record<string, unknown>; what: string }[] = [];
const keep = (d: FirebaseFirestore.QueryDocumentSnapshot, next: Record<string, unknown>, what: string) => {
  if (JSON.stringify(next) !== JSON.stringify(d.data())) writes.push({ ref: d.ref, data: next, what });
};
movies.docs.forEach((d) => keep(d, { ...mergeMovie(d.data() as Movie, FROM, TO) }, `movie ${d.get('title')}`));
sessions.docs.forEach((d) => keep(d, { ...mergeSession(d.data() as WeekendSession, FROM, TO) }, `session ${d.get('title')}`));
prophecies.docs.forEach((d) => d.get('member') === FROM && keep(d, { ...d.data(), member: TO }, `prophecy ${d.id}`));

writes.forEach((w) => console.log(`${apply ? 'update' : 'would update'}: ${w.what}`));
console.log(`${writes.length} document(s) ${apply ? 'updated' : 'to update (dry run, pass --apply to write)'}`);
if (apply) {
  const batch = db.batch(); // far below the 500-write batch limit for a club's data
  writes.forEach((w) => batch.set(w.ref, w.data));
  await batch.commit();
}
