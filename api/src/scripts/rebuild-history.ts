import { db } from '../lib/database';
import { generateId, getCurrentTimestamp } from '../utils/database';

async function rebuildHistory() {
  try {
    console.log('Iniciando reconstrução do histórico de provas de vida...');

    const mainDb = db.getMainDb();
    
    // Obter todas as organizações ativas
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as { subdomain: string }[];

    console.log(`Encontradas ${organizations.length} organizações ativas`);

    // Processar cada banco de dados de organização
    for (const org of organizations) {
      console.log(`\nProcessando organização: ${org.subdomain}`);
      
      const orgDb = await db.getOrganizationDb(org.subdomain);

      // Verificar se a tabela de histórico existe
      const tableExists = orgDb.prepare(`
        SELECT COUNT(*) as count FROM sqlite_master 
        WHERE type='table' AND name='proof_of_life_history'
      `).get() as { count: number };

      if (tableExists.count === 0) {
        console.log(`  Tabela proof_of_life_history não existe. Criando...`);
        
        orgDb.exec(`
          CREATE TABLE IF NOT EXISTS proof_of_life_history (
            id TEXT PRIMARY KEY,
            proof_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            event_id TEXT NOT NULL,
            action TEXT NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
            comments TEXT,
            reviewed_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (proof_id) REFERENCES proof_of_life(id),
            FOREIGN KEY (user_id) REFERENCES app_users(id),
            FOREIGN KEY (event_id) REFERENCES events(id),
            FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
          );
        `);
      }

      // Contar registros existentes no histórico
      const historyCount = orgDb.prepare(`
        SELECT COUNT(*) as count FROM proof_of_life_history
      `).get() as { count: number };

      console.log(`  Encontrados ${historyCount.count} registros no histórico`);

      // Buscar todas as provas de vida
      const proofs = orgDb.prepare(`
        SELECT 
          p.id, p.user_id, p.event_id, p.status, p.reviewed_by, p.comments, 
          p.created_at, p.updated_at, p.reviewed_at
        FROM proof_of_life p
      `).all() as any[];

      console.log(`  Encontradas ${proofs.length} provas de vida`);

      // Iniciar transação para reconstrução do histórico
      orgDb.exec('BEGIN TRANSACTION');

      let newEntries = 0;
      const timestamp = getCurrentTimestamp();

      for (const proof of proofs) {
        console.log(`    Processando prova de vida: ${proof.id}, status: ${proof.status}`);
        
        // Verificar se já existe registro para esta prova
        const existingEntries = orgDb.prepare(`
          SELECT COUNT(*) as count FROM proof_of_life_history
          WHERE proof_id = ?
        `).get(proof.id) as { count: number };

        if (existingEntries.count === 0) {
          // Adicionar evento de submissão
          const submissionId = generateId();
          orgDb.prepare(`
            INSERT INTO proof_of_life_history (
              id, proof_id, user_id, event_id, action, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            submissionId,
            proof.id,
            proof.user_id,
            proof.event_id,
            'SUBMITTED',
            proof.created_at || timestamp
          );
          newEntries++;
          
          // Se a prova foi aprovada ou rejeitada, adicionar esse evento também
          if (proof.status === 'APPROVED' || proof.status === 'REJECTED') {
            const reviewId = generateId();
            orgDb.prepare(`
              INSERT INTO proof_of_life_history (
                id, proof_id, user_id, event_id, action, comments, reviewed_by, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              reviewId,
              proof.id,
              proof.user_id,
              proof.event_id,
              proof.status,
              proof.comments || null,
              proof.reviewed_by || null,
              proof.reviewed_at || proof.updated_at || timestamp
            );
            newEntries++;
          }
          
          console.log(`      Adicionados ${existingEntries.count === 0 ? '2' : '1'} registros ao histórico`);
        } else {
          console.log(`      Já existem ${existingEntries.count} registros para esta prova`);
        }
      }

      // Commit das alterações
      orgDb.exec('COMMIT');
      
      console.log(`  Total de novos registros adicionados: ${newEntries}`);
    }

    console.log('\nReconstrução do histórico concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a reconstrução do histórico:', error);
    process.exit(1);
  }
}

// Executar o script
rebuildHistory();
