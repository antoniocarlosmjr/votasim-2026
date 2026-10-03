# VotaSim 2026 — V2

Protótipo independente e educativo de uma experiência de votação.

## O que mudou na V2
- sequência de seis painéis;
- senador corrigido para 3 dígitos;
- interface responsiva inspirada no fluxo da urna, sem se apresentar como produto oficial;
- BRANCO, CORRIGE e CONFIRMA;
- voto nominal, voto de legenda (cargos proporcionais) e voto nulo;
- breve período de conferência antes de liberar CONFIRMA;
- bloqueio de repetição da mesma candidatura nas duas vagas de Senado;
- tela final FIM;
- nenhuma persistência ou transmissão de votos;
- candidatos ainda fictícios.

## Publicação
Substitua o `index.html` da raiz do repositório pelo arquivo desta pasta e faça commit/push na branch `main`.
Se o Cloudflare estiver integrado ao repositório, o deploy será disparado a partir do push.

## Próxima etapa
Trocar os mocks por uma camada de dados oficiais públicos de candidaturas de 2026, separada por UF.
