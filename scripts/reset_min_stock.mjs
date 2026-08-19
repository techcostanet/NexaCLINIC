/**
 * NexaSTOCK - Zeração de Estoque Mínimo
 * 1. Define minStock = 0 para todos os produtos no initialProducts.json.
 * 2. Atualiza todos os documentos da coleção inventory_items no Firestore com minStock = 0.
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
    // Already initialized
  }
  const db = getFirestore();

  // 1. Atualizar initialProducts.json
  const initialProductsPath = path.join(__dirname, '..', 'src', 'data', 'initialProducts.json');
  if (fs.existsSync(initialProductsPath)) {
    const raw = fs.readFileSync(initialProductsPath, 'utf-8');
    const products = JSON.parse(raw);
    const updatedProducts = products.map(p => ({
      ...p,
      minStock: 0
    }));
    fs.writeFileSync(initialProductsPath, JSON.stringify(updatedProducts, null, 2), 'utf-8');
    console.log(`[initialProducts.json] Atualizado: ${updatedProducts.length} produtos agora com minStock = 0.`);
  }

  // 2. Atualizar todos os produtos na coleção inventory_items do Firestore
  console.log('Buscando itens de estoque no Firestore (inventory_items)...');
  const itemsSnap = await db.collection('inventory_items').get();
  console.log(`Encontrados ${itemsSnap.size} documentos na coleção inventory_items.`);

  if (itemsSnap.size > 0) {
    let batch = db.batch();
    let count = 0;
    let totalUpdated = 0;

    for (const doc of itemsSnap.docs) {
      batch.update(doc.ref, { minStock: 0 });
      count++;
      totalUpdated++;

      if (count === 400) {
        await batch.commit();
        console.log(`Lote de 400 itens atualizados com minStock = 0...`);
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Lote final de ${count} itens atualizados.`);
    }

    console.log(`Sucesso: ${totalUpdated} itens no Firestore agora têm minStock = 0.`);
  }

  console.log('=== ZERAÇÃO DE ESTOQUE MÍNIMO CONCLUÍDA COM SUCESSO ===');
  process.exit(0);
} catch (error) {
  console.error('Erro ao zerar minStock:', error);
  process.exit(1);
}
