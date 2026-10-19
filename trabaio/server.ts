import 'dotenv/config';
import app from './src/app';

const port = Number(process.env.PORT || 3000);
if (!process.env.JWT_SECRET) {
  console.error('Configure JWT_SECRET no arquivo .env antes de iniciar.');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`ThunderCats API rodando em http://localhost:${port}`);
});
