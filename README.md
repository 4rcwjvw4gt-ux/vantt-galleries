# VANTT GALLERIES

Aplicação Next.js preparada para Vercel + Supabase.

- /login: acesso privado VANTT
- /admin: gestão de álbuns e upload
- /g/SLUG: galeria pública
- Supabase Database para dados
- Supabase Storage para fotografias

## Configuração
1. Criar projeto no Supabase.
2. Executar supabase.sql no SQL Editor.
3. Criar um utilizador em Authentication > Users.
4. Adicionar no Vercel NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
5. Fazer redeploy.

O Vercel não é usado para armazenamento persistente de fotografias.