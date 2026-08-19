/**
 * NexaASSIST - Gravador Firestore de Comunicados
 * Lê os dados processados e sincroniza na coleção 'assist_posts' do Firestore
 */
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  try {
    admin.initializeApp();
  } catch (e) {
    // Já inicializado
  }
  const db = getFirestore();

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'synced_assist_emails.json');
  if (!fs.existsSync(dataPath)) {
    console.log('Nenhum arquivo synced_assist_emails.json encontrado.');
    process.exit(0);
  }

  const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Carregados ${posts.length} comunicado(s) para sincronização no Firestore...`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const post of posts) {
    if (!post.id) continue;
    const docRef = db.collection('assist_posts').doc(post.id);
    const existingSnap = await docRef.get();

    if (!existingSnap.exists) {
      await docRef.set({
        ...post,
        syncedAt: new Date().toISOString()
      });
      addedCount++;
      console.log(` + [NOVO NO FIRESTORE] ${post.id}: ${post.title} (${post.patientName || 'Geral'})`);
    } else {
      // Atualiza campos mantendo status e readBy existentes
      const existingData = existingSnap.data();
      await docRef.set({
        ...post,
        readBy: existingData.readBy || post.readBy || [],
        status: existingData.status || post.status,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      updatedCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`[FIRESTORE NexaASSIST] Sincronização Concluída com Sucesso!`);
  console.log(`- Novos inseridos: ${addedCount}`);
  console.log(`- Atualizados/Verificados: ${updatedCount}`);
  console.log(`- Total no Firestore: ${posts.length}`);
  console.log(`======================================================\n`);

  process.exit(0);
} catch (error) {
  console.error('[ERRO FIRESTORE] Falha ao sincronizar assist_posts:', error);
  process.exit(1);
}
