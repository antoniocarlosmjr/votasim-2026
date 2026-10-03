# VotaSim 2026 — V3.1

Esta versão já contém os JSONs gerados a partir do arquivo `consulta_cand_2026.zip` fornecido pelo usuário em 03/10/2026.

## Publicação
Não é necessário executar Python para esta versão.
Substitua o conteúdo do repositório pelos arquivos deste pacote e faça commit/push na branch `main`.

## Estrutura
- `index.html`
- `assets/app.css`
- `assets/app.js`
- `data/AC.json` ... `data/TO.json`
- `data/BR.json` para Presidência
- `tools/import_tse.py` mantido apenas para futuras atualizações dos dados

## Observação
As fotos não estão incluídas neste pacote porque o ZIP de candidaturas contém CSVs, não os arquivos de fotografias. A interface já possui suporte ao campo `foto` para uma próxima atualização.
