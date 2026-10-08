# VANTT Galleries

Aplicação funcional para gestão de galerias fotográficas de eventos.

## Requisitos
Node.js 20+

## Instalação
```bash
npm install
npm start
```
Abrir `http://localhost:3000`.

## Login inicial
Email: `admin@vantt.pt`
Password: `vantt2026`

Altera em produção usando `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `SESSION_SECRET`.

## Funcionalidades
- login admin
- clientes e álbuns
- DELUX pré-criado
- criação de álbuns
- upload múltiplo real de JPG/PNG/WEBP
- thumbnails com Sharp
- armazenamento persistente em `data/`
- galerias públicas `/g/:client/:album`
- password por galeria
- download individual do original
- download completo em ZIP
- mobile responsive

## Produção
Para tornar a aplicação pública, colocar este projeto num servidor Node persistente. O disco `data/` precisa de armazenamento persistente. Para escalar, substituir o storage local por S3/Supabase Storage e a sessão em memória por Redis/DB.
