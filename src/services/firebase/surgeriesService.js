import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';
import { createAssistPost, updateAssistPost, deleteAssistPost } from './assistService';

/**
 * Busca agendamentos cirúrgicos com filtros opcionais
 */
export const getSurgeries = async (filters = {}) => {
  if (USE_MOCK) {
    if (mockFirestore.getSurgeries) {
      return mockFirestore.getSurgeries(filters);
    }
    return [];
  }

  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);

  try {
    const snap = await getDocs(collection(db, 'surgeries'));
    if (snap.empty) {
      if (mockFirestore.getSurgeries) {
        return mockFirestore.getSurgeries(filters);
      }
      return [];
    }

    let items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtro por Unidade se aplicável
    if (filters.unitId && filters.unitId !== 'all') {
      items = items.filter(item => !item.unitId || item.unitId === 'all' || item.unitId === filters.unitId);
    }

    // Ordenação cronológica: data e depois horário
    items.sort((a, b) => {
      const compDate = (a.date || '').localeCompare(b.date || '');
      if (compDate !== 0) return compDate;
      return (a.time || '').localeCompare(b.time || '');
    });

    return items;
  } catch (err) {
    console.warn('Falha na busca remota de surgeries, utilizando fallback local:', err);
    if (mockFirestore.getSurgeries) return mockFirestore.getSurgeries(filters);
    return [];
  }
};

/**
 * Formata mensagem de comunicado para publicação automática no Mural
 */
const formatSurgeryMuralContent = (data) => {
  const dateParts = (data.date || '').split('-');
  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : (data.date || '--');

  const lines = [
    `📅 Data: ${formattedDate} às ${data.time || '08:00'}`,
    `🏥 Local: ${data.hospital || 'Hospital Regional'}`,
    `👨‍⚕️ Cirurgião: ${data.surgeon || 'Corpo Clínico'}`,
    `💉 Anestesista: ${data.anesthesiologist || 'Sem Agenda'}`,
    `🩺 Procedimento: ${data.procedure || 'Cirurgia Geral'}`,
    `🎯 Motivo: ${data.indication || data.motive || 'Acesso Vascular'}`
  ];

  if (data.antibiotic && data.antibiotic.trim()) {
    lines.push(`💊 ATB Profilático: ${data.antibiotic.trim()}`);
  }

  if (data.observations && data.observations.trim()) {
    lines.push(`📝 Observação: ${data.observations.trim()}`);
  }

  if (data.status) {
    lines.push(`📌 Situação: ${data.status}`);
  }

  return lines.join('\n');
};

/**
 * Cria um novo agendamento cirúrgico e publica automaticamente no Mural
 */
export const createSurgery = async (surgeryData, currentUser) => {
  const isUrgency = surgeryData.isUrgency || 
    (surgeryData.patientName || '').toUpperCase().includes('URGENCIA') ||
    (surgeryData.patientName || '').toUpperCase().includes('URGÊNCIA') ||
    (surgeryData.procedure || '').toUpperCase().includes('URGENCIA') ||
    surgeryData.status === 'Urgência';

  const newSurgery = {
    ...surgeryData,
    isUrgency: !!isUrgency,
    status: surgeryData.status || (isUrgency ? 'Urgência' : 'Agendado'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let savedItem = null;

  if (USE_MOCK) {
    if (mockFirestore.createSurgery) {
      savedItem = await mockFirestore.createSurgery(newSurgery);
    } else {
      savedItem = { id: 'surg-' + Date.now(), ...newSurgery };
    }
  } else {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'surgeries'), newSurgery);
    savedItem = { id: docRef.id, ...newSurgery };
  }

  // Publicação Automática no Mural (assist_posts)
  if (surgeryData.postToMural !== false) {
    try {
      const patientNameClean = savedItem.patientName || 'Paciente';
      const urgencyLevel = isUrgency ? 'Urgente' : (savedItem.observations ? 'Atenção' : 'Informativo');

      const muralPostPayload = {
        title: `Cirurgia: ${savedItem.procedure || 'Agendamento'} — ${patientNameClean}`,
        message: formatSurgeryMuralContent(savedItem),
        category: 'Cirurgias',
        urgency: urgencyLevel,
        patientId: savedItem.patientId || null,
        patientName: patientNameClean,
        room: savedItem.hospital || 'Centro Cirúrgico',
        shift: savedItem.time || '1º Turno',
        source: 'surgery_schedule',
        surgeryId: savedItem.id,
        unitId: savedItem.unitId || 'betim',
        unit: savedItem.unitId === 'taguatinga' ? 'Taguatinga' : 'Betim',
        status: 'published',
        author: currentUser?.name || 'Agendamento Cirúrgico',
        authorEmail: currentUser?.email || '',
        authorId: currentUser?.uid || currentUser?.id || '',
        authorRole: currentUser?.role || 'Cirurgias',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readBy: []
      };

      const createdMuralPost = await createAssistPost(muralPostPayload);
      if (createdMuralPost && createdMuralPost.id) {
        savedItem.muralPostId = createdMuralPost.id;
        // Atualiza a referência do post no agendamento
        if (!USE_MOCK) {
          const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          await updateDoc(doc(db, 'surgeries', savedItem.id), { muralPostId: createdMuralPost.id });
        }
      }
    } catch (muralErr) {
      console.error('Erro ao publicar cirurgia no mural:', muralErr);
    }
  }

  return savedItem;
};

/**
 * Atualiza um agendamento cirúrgico e sincroniza o Mural
 */
export const updateSurgery = async (id, surgeryData, currentUser) => {
  const isUrgency = surgeryData.isUrgency || 
    (surgeryData.patientName || '').toUpperCase().includes('URGENCIA') ||
    (surgeryData.patientName || '').toUpperCase().includes('URGÊNCIA') ||
    (surgeryData.procedure || '').toUpperCase().includes('URGENCIA') ||
    surgeryData.status === 'Urgência';

  const updatedPayload = {
    ...surgeryData,
    isUrgency: !!isUrgency,
    updatedAt: new Date().toISOString()
  };

  let savedItem = null;

  if (USE_MOCK) {
    if (mockFirestore.updateSurgery) {
      savedItem = await mockFirestore.updateSurgery(id, updatedPayload);
    } else {
      savedItem = { id, ...updatedPayload };
    }
  } else {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'surgeries', id), updatedPayload);
    savedItem = { id, ...updatedPayload };
  }

  // Sincroniza o Mural se houver vínculo
  if (savedItem.muralPostId) {
    try {
      const patientNameClean = savedItem.patientName || 'Paciente';
      const urgencyLevel = isUrgency ? 'Urgente' : (savedItem.observations ? 'Atenção' : 'Informativo');

      await updateAssistPost(savedItem.muralPostId, {
        title: `Cirurgia: ${savedItem.procedure || 'Agendamento'} — ${patientNameClean}`,
        message: formatSurgeryMuralContent(savedItem),
        category: 'Cirurgias',
        urgency: urgencyLevel,
        patientName: patientNameClean,
        patientId: savedItem.patientId || null,
        room: savedItem.hospital || 'Centro Cirúrgico',
        shift: savedItem.time || '1º Turno',
        status: 'published'
      });
    } catch (syncErr) {
      console.warn('Não foi possível sincronizar post existente do mural:', syncErr);
    }
  }

  return savedItem;
};

/**
 * Remove um agendamento cirúrgico e opcionalmente limpa o post do mural
 */
export const deleteSurgery = async (id, muralPostId = null) => {
  if (USE_MOCK) {
    if (mockFirestore.deleteSurgery) {
      await mockFirestore.deleteSurgery(id);
    }
  } else {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'surgeries', id));
  }

  if (muralPostId) {
    try {
      await deleteAssistPost(muralPostId);
    } catch (mErr) {
      console.warn('Post do mural já removido ou inacessível:', mErr);
    }
  }

  return true;
};

/**
 * Bloqueia ou desbloqueia um dia específico com justificativa (Feriado, Manutenção)
 */
export const toggleSurgeryBlock = async (blockData) => {
  if (USE_MOCK) {
    if (mockFirestore.toggleSurgeryBlock) {
      return mockFirestore.toggleSurgeryBlock(blockData);
    }
    return blockData;
  }

  const { getFirestore, collection, addDoc, doc, deleteDoc, getDocs, query, where } = await import('firebase/firestore');
  const db = getFirestore(app);

  // Verifica se já existe bloqueio para esta data
  const q = query(
    collection(db, 'surgery_blocks'),
    where('date', '==', blockData.date)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Se já existia e não passou novo motivo, remove (desbloqueia)
    if (!blockData.reason) {
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'surgery_blocks', d.id));
      }
      return { unblocked: true, date: blockData.date };
    } else {
      // Atualiza motivo
      const targetDoc = snap.docs[0];
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'surgery_blocks', targetDoc.id), {
        reason: blockData.reason,
        updatedAt: new Date().toISOString()
      });
      return { id: targetDoc.id, ...blockData };
    }
  } else {
    // Cria novo bloqueio
    const docRef = await addDoc(collection(db, 'surgery_blocks'), {
      ...blockData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...blockData };
  }
};

/**
 * Busca todos os bloqueios de dias cirúrgicos
 */
export const getSurgeryBlocks = async () => {
  if (USE_MOCK) {
    if (mockFirestore.getSurgeryBlocks) {
      return mockFirestore.getSurgeryBlocks();
    }
    return [];
  }

  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);

  try {
    const snap = await getDocs(collection(db, 'surgery_blocks'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Falha na busca de surgery_blocks:', err);
    if (mockFirestore.getSurgeryBlocks) return mockFirestore.getSurgeryBlocks();
    return [];
  }
};
