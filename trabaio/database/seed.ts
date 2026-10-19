import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from '../src/config/database';

async function seed(): Promise<void> {
  const nome = process.env.SEED_ADMIN_NAME || 'Lion-O';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@thundercats.local';
  const senha = process.env.SEED_ADMIN_PASSWORD;

  if (!senha || senha.length < 12) {
    throw new Error('Defina SEED_ADMIN_PASSWORD no .env com pelo menos 12 caracteres.');
  }

  const senhaHash = await bcrypt.hash(senha, 12);
  await db.execute(
    `INSERT INTO usuarios (nome, email, senha_hash, papel)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha_hash = VALUES(senha_hash), papel = 'admin'`,
    [nome, email, senhaHash]
  );
  console.log(`Usuário seed pronto: ${email}`);
}

seed()
  .catch((error: unknown) => {
    console.error('Falha no seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
