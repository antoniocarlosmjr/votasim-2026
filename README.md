# VotaSim 2026 — V3.3

Simulador independente e educativo da sequência de votação. Não é um serviço do TSE ou da Justiça Eleitoral e não registra, transmite ou contabiliza votos.

## V3.3
- Fotografias carregadas para todas as UFs e Presidência a partir dos pacotes fornecidos do TSE.
- Fotografias agrupadas por UF em `assets/photo-data/*.js` para evitar mais de 20 mil arquivos estáticos no deploy.
- Remoção da informação técnica “Situação na fonte” da tela de votação.
- Aviso em celulares no modo retrato recomendando girar o aparelho; o usuário pode continuar na vertical.
- Layout horizontal otimizado para celular.
- Feedback sonoro gerado pelo navegador para teclas, confirmação e encerramento. Os tons são da simulação e não são gravações oficiais do TSE.

## Teste local
Sirva a pasta por HTTP, por exemplo:

    python3 -m http.server 8000

Depois abra `http://localhost:8000`.
