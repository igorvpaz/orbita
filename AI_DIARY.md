# Diário de IA

Registrar 3 a 5 erros **reais** encontrados durante a execução. Não completar com casos inventados.

## Caso 1 — 2026-11-01 / implementação assistida

- Objetivo: instalar dependências e gerar lockfile para validar a base.
- Resultado equivocado: a primeira tentativa de `pnpm install` usou o store padrão fora da área gravável e falhou com `EPERM` ao criar symlink.
- Diagnóstico: erro do comando mostrou o caminho do store global sob `AppData`.
- Mudança: executar `pnpm` com `--store-dir .pnpm-store` dentro do repositório; a `.pnpm-store` é ignorada pelo Git.
- Evidência: instalação concluída com `--store-dir .pnpm-store`; `pnpm-lock.yaml` gerado e instalação congelada passou.
- Aprendizado: definir explicitamente o store em ambientes com filesystem restrito.

## Caso 2 — 2026-11-01 / build Next.js

- Objetivo: gerar o build standalone da aplicação.
- Resultado equivocado da IA: o script inicial usou o build padrão do Next 16, que falhou com pânico do Turbopack ao criar o processo PostCSS neste ambiente Windows restrito.
- Diagnóstico: `next build` falhou em `globals.css`; `next build --webpack` compilou e gerou páginas, mas o rastreamento standalone precisou de permissão de symlink fora do sandbox.
- Mudança: fixei `next build --webpack` no script e rodei o build com a permissão de symlink concedida pelo ambiente.
- Evidência: build terminou com as rotas `/` e `/api/health` geradas.
- Aprendizado: validar o build standalone no ambiente real de CI/Docker; erro de criação de processo local não prova falha do código.

## Caso 3 — 2026-11-01 / geração de rotas Next.js

- Objetivo: compilar o produto completo depois dos endpoints de parceiros.
- Resultado equivocado da IA: exportei `partnerSchema` diretamente de `app/api/partners/route.ts`.
- Como identifiquei: `next build --webpack` falhou na checagem gerada pelo Next, que só aceita exports especiais de Route Handlers.
- Mudança: tornei o schema privado ao módulo.
- Evidência: build seguinte passou e listou todas as rotas do app.
- Aprendizado: executar build do Next além de `tsc`, pois a checagem de convenção de rotas é gerada durante o build.

## Caso 4 — 2026-11-01 / schema de edição

- Objetivo: permitir arquivar/publicar serviço sem alterar os outros campos.
- Resultado equivocado da IA: `createServiceSchema.partial()` manteve o default `descriptionEn: null`; um PATCH só com status apagaria a tradução inglesa.
- Como identifiquei: teste unitário do PATCH comparou o objeto validado e encontrou o campo extra.
- Mudança: defini `descriptionEn` explicitamente como opcional sem default no schema de edição, como já fiz para `rules`.
- Evidência: `service-schema.test.ts` passou após a correção.
- Aprendizado: defaults em schema de criação precisam ser removidos do schema de atualização parcial.

## Caso 5 — 2026-11-03 / datas da assinatura

- Objetivo: validar a gestão de membros criados diretamente pelo administrador.
- Resultado equivocado da IA: o endpoint de assinatura aceitava apenas datas terminadas em `Z`, enquanto a UI reenviava `starts_at` retornado pelo PostgreSQL com `+00:00`.
- Como identifiquei: o teste integrado remoto criou e editou um membro, mas a desativação de sua assinatura retornou 422 por `startsAt` inválido.
- Mudança: usei `z.iso.datetime({ offset: true })` nas datas da assinatura e adicionei teste de regressão com o formato do banco.
- Evidência: teste unitário passou e a requisição integrada seguinte desativou a assinatura; o catálogo retornou 403 para esse membro.
- Aprendizado: testar valores retornados pelo banco nas operações seguintes, em vez de assumir o mesmo formato ISO produzido pelo navegador.

## Próximas ocorrências

```md
## Caso N — data / ferramenta
- Objetivo e prompt resumido:
- Resultado equivocado da IA:
- Como identifiquei o problema (teste/log/documentação):
- Mudança feita e por quê:
- Evidência de correção:
- Aprendizado:
```
