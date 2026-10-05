# 🗳️ VotaSim 2026

Simulador web independente e educativo da sequência de votação das **Eleições 2026 no Brasil**, desenvolvido para permitir que qualquer pessoa pratique a utilização da urna de forma simples, antes do dia da eleição.

> [!IMPORTANT]
> **O VotaSim 2026 é um projeto independente.** Não possui vínculo com o Tribunal Superior Eleitoral (TSE), com a Justiça Eleitoral, partidos políticos ou candidaturas.

## 🎬 Demonstração

<!-- Substitua o trecho abaixo pelo vídeo/GIF ou pelo link do vídeo quando adicioná-lo ao repositório. -->

https://github.com/user-attachments/assets/3a8e4a3d-f85d-4e88-b65b-2e90363db0c0

🌐 **Acesse o simulador:** https://votasim-2026.votasim.workers.dev/

## ✨ O que está implementado

- Fluxo completo da votação de 2026 na ordem utilizada pela urna:
  1. Deputado Federal — 4 dígitos;
  2. Deputado Estadual — 5 dígitos (Deputado Distrital no Distrito Federal);
  3. Senador — primeira escolha — 3 dígitos;
  4. Senador — segunda escolha — 3 dígitos;
  5. Governador — 2 dígitos;
  6. Presidente — 2 dígitos.
- Seleção da UF antes de iniciar a simulação.
- Candidaturas e partidos preparados a partir de dados públicos disponibilizados pelo TSE.
- Fotografias de candidatos para todas as UFs e para a disputa presidencial.
- Identificação de candidato conforme os números são digitados.
- Tratamento de voto em candidato, voto de legenda, voto branco e voto nulo.
- Teclas **BRANCO**, **CORRIGE** e **CONFIRMA**.
- Regra para impedir que a mesma candidatura ao Senado seja considerada duas vezes na mesma simulação.
- Intervalo de conferência antes da confirmação do voto.
- Feedback sonoro nas teclas, entre as etapas da votação e no encerramento.
- Tela final **FIM**, semelhante ao fluxo conhecido da urna.
- Interface responsiva para desktop, tablet e celular.
- Uso em celular tanto na orientação vertical quanto horizontal.
- Layout inspirado na urna eletrônica, sem se apresentar como produto oficial.

## 🔐 Privacidade — nenhum voto é salvo

**O VotaSim não armazena, transmite ou contabiliza os votos e escolhas realizados durante a simulação.**

A interação acontece no próprio navegador. O projeto não possui login, banco de dados de votos ou API para registrar as escolhas feitas na urna simulada. Ao finalizar ou reiniciar a experiência, o VotaSim não mantém um histórico da votação simulada.

O código é aberto justamente para que esse comportamento possa ser inspecionado no repositório.

## 🏗️ Arquitetura

O projeto foi mantido propositalmente simples e majoritariamente estático:

```text
Navegador
   │
   ├── index.html
   ├── assets/app.css
   ├── assets/app.js
   │      │
   │      ├── carrega dados da UF → data/{UF}.json
   │      ├── carrega Presidência → data/BR.json
   │      ├── carrega fotos → assets/photo-data/{UF}.js / BR.js
   │      └── reproduz áudios → assets/audio/
   │
   └── Estado da simulação mantido somente no cliente

GitHub (main)
   │
   ├── GitHub Pages ──────────────► publicação estática
   │
   └── integração Cloudflare ─────► deploy automático ─► produção
                                                    votasim-2026.votasim.workers.dev
```

Não há backend de votação e não existe banco de dados para persistência das escolhas do usuário.

## 📁 Estrutura do projeto

```text
votasim-2026/
├── index.html                  # Entrada da aplicação
├── assets/
│   ├── app.css                 # Layout e responsividade
│   ├── app.js                  # Fluxo e regras da simulação
│   ├── audio/
│   │   ├── confirmacao.mp3
│   │   └── fim.mp3
│   └── photo-data/             # Fotos agrupadas por UF
│       ├── AC.js
│       ├── ...
│       ├── SE.js
│       ├── SP.js
│       └── BR.js
├── data/                       # Dados processados das candidaturas
│   ├── AC.json
│   ├── ...
│   ├── SE.json
│   ├── SP.json
│   └── BR.json
├── tools/
│   └── import_tse.py           # Importador dos dados públicos do TSE
└── README.md
```

As fotografias foram agrupadas por UF em arquivos JavaScript para evitar a publicação de dezenas de milhares de pequenos arquivos estáticos e simplificar o deploy.

## 📊 Dados eleitorais

Os dados utilizados pelo simulador são preparados a partir dos **Dados Abertos do TSE**, incluindo informações de candidaturas, números, partidos, cargos e UFs.

O script `tools/import_tse.py` transforma os arquivos disponibilizados pelo TSE nos JSONs consumidos pela aplicação.

Fontes oficiais de referência:

- [Portal de Dados Abertos do TSE — Candidatos 2026](https://dadosabertos.tse.jus.br/pt_BR/dataset/candidatos-2026)
- [TSE — ordem de votação nas Eleições 2026](https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-conheca-a-ordem-de-votacao-na-urna-eletronica)
- [Simulador de votação da Justiça Eleitoral](https://www.justicaeleitoral.jus.br/simulador-votacao/)

> Os dados exibidos podem mudar conforme a atualização das fontes. Para informações eleitorais oficiais e definitivas, consulte sempre a Justiça Eleitoral.

## 🚀 Infraestrutura e deploy

### GitHub

O GitHub funciona como fonte do projeto e concentra o versionamento do código. A branch `main` representa a versão utilizada para publicação.

O fluxo de atualização é simples:

```text
alteração local
      ↓
git commit
      ↓
git push origin main
      ↓
GitHub
      ├──► GitHub Pages
      └──► Cloudflare → novo deploy de produção
```

### GitHub Pages

Por ser uma aplicação estática, o VotaSim também pode ser servido diretamente pelo **GitHub Pages**. Quando configurado para publicar a branch `main`, alterações enviadas ao repositório passam a compor automaticamente a versão hospedada pelo Pages, sem necessidade de servidor próprio.

O GitHub Pages foi utilizado no processo de publicação do projeto e continua sendo uma alternativa simples de hospedagem/validação do conteúdo estático.

### Cloudflare

A versão pública principal é distribuída pela **Cloudflare**, integrada ao repositório no GitHub.

Quando uma alteração é enviada para a `main`, a integração detecta o novo commit e inicia automaticamente um novo deploy. Dessa forma, não é necessário enviar manualmente os arquivos para o ambiente de produção a cada versão.

**Produção:** https://votasim-2026.votasim.workers.dev/

Esse modelo mantém o fluxo de entrega pequeno: **código → GitHub → deploy automático → Cloudflare**.

## 💻 Executando localmente

Não é necessário instalar framework ou banco de dados. Como os dados são carregados por `fetch`, execute a pasta por um servidor HTTP local em vez de abrir o `index.html` diretamente.

Com Python 3:

```bash
python3 -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Python para processamento/importação dos dados
- JSON para os dados preparados das candidaturas
- Git + GitHub para versionamento
- GitHub Pages para hospedagem estática
- Cloudflare para publicação da versão de produção e deploy integrado ao GitHub

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas. Como o repositório é público, você pode abrir uma **Issue** ou criar um **Pull Request**. Alterações propostas por terceiros não são publicadas automaticamente na branch principal sem que sejam incorporadas ao projeto.

Ao contribuir, mantenha o caráter **independente, educativo e politicamente neutro** do simulador.

## ⚠️ Aviso

Este projeto busca reproduzir a experiência de votação apenas para fins de familiarização e treinamento. Elementos visuais e sonoros são utilizados na simulação, mas o VotaSim **não deve ser confundido com o simulador oficial nem com um sistema da Justiça Eleitoral**.

Para orientações oficiais sobre as Eleições 2026, consulte o [Tribunal Superior Eleitoral](https://www.tse.jus.br/).

---

Desenvolvido por **Antonio Martins**  
GitHub: [@antoniocarlosmjr](https://github.com/antoniocarlosmjr)  
Repositório: [github.com/antoniocarlosmjr/votasim-2026](https://github.com/antoniocarlosmjr/votasim-2026)
