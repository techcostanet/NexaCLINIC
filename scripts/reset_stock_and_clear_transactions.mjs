/**
 * NexaSTOCK - Reset de Saldo de Estoque e Limpeza de Movimentações
 * 1. Zera o currentStock de todos os produtos no initialProducts.json e no Firestore (inventory_items).
 * 2. Exclui todos os documentos da coleção stock_transactions no Firestore.
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
      currentStock: 0
    }));
    fs.writeFileSync(initialProductsPath, JSON.stringify(updatedProducts, null, 2), 'utf-8');
    console.log(`[initialProducts.json] Atualizado: ${updatedProducts.length} produtos agora com currentStock = 0.`);
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
      batch.update(doc.ref, { currentStock: 0 });
      count++;
      totalUpdated++;

      if (count === 400) {
        await batch.commit();
        console.log(`Lote de 400 itens de estoque zerados...`);
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
    console.log(`[Firestore] Total de ${totalUpdated} produtos zerados com sucesso no Firestore!`);
  }

  // 3. Excluir todas as movimentações de estoque (stock_transactions)
  console.log('\nBuscando movimentações de estoque no Firestore (stock_transactions)...');
  const txSnap = await db.collection('stock_transactions').get();
  console.log(`Encontrados ${txSnap.size} documentos em stock_transactions.`);

  if (txSnap.size > 0) {
    let batch = db.batch();
    let count = 0;
    let totalDeleted = 0;

    for (const doc of txSnap.docs) {
      batch.delete(doc.ref);
      count++;
      totalDeleted++;

      if (count === 400) {
        await batch.commit();
        console.log(`Lote de 400 movimentações excluídas...`);
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
    console.log(`[Firestore] Total de ${totalDeleted} movimentações de estoque excluídas com sucesso!`);
  }

  console.log('\n======================================================');
  console.log('Operação de Reset de Estoque e Limpeza Concluída!');
  console.log('======================================================');
  process.exit(0);
} catch (error) {
  console.error('Erro na execução do script:', error);
  process.exit(1);
}
