# braz. — Portfolio

Base do portfólio profissional de João Gabriel Lira Lemes Braz, desenvolvedor de software, suporte técnico e estudante de Engenharia de Software na UniRV.

## Estado do projeto

Fase 8.5: motion design e experiência visual, com hero revelado por linhas, intro `braz.` uma vez por sessão, luz ambiente, grain leve, números editoriais grandes, progresso de rolagem e navegação da seção atual. Conteúdo profissional, seções, SEO e identidade foram preservados. Nenhum deploy ou alteração de repositório remoto foi realizado.

Seções: Sobre, Experiência, Stack, Projetos, Formação e Contato, além de hero, navbar e footer.

## Tecnologias

- HTML5 semântico.
- CSS3 com variáveis, Grid, Flexbox e abordagem mobile-first.
- JavaScript puro (ES6+), para navegação, estado do header, fallback das screenshots e revelação progressiva com IntersectionObserver nativo.

Sem frameworks ou etapa de build. Three.js r170 é carregado sob demanda para o Hero. A tipografia usa Inter se instalada, com fontes de sistema como fallback.

## Executar localmente

Sirva via HTTP para carregar os módulos JavaScript. Se Python estiver instalado, execute na raiz:

```sh
python -m http.server 8000
```

Acesse `http://localhost:8000`. Encerre o servidor com `Ctrl+C`.

## Estrutura

```text
.
├── index.html
├── css/
│   ├── style.css          # Tokens, base e componentes
│   ├── responsive.css     # Adaptações por largura
│   └── animations.css     # Interações e movimento reduzido
├── js/
│   ├── main.js
│   └── particles.js       # Campo ambiental em Canvas 2D
├── assets/
│   ├── images/
│   │   └── projects/
│   ├── icons/
│   │   └── favicon.svg
│   └── documents/
├── favicon.ico
├── prompt.txt
├── README.md
└── .gitignore
```

Os arquivos `.gitkeep` preservam diretórios vazios no Git. Imagens de projetos e documentos serão adicionados posteriormente. Prefira imagens WebP ou AVIF com dimensões explícitas e tamanho adequado à apresentação.

## Convenções

As cores, espaçamentos, raios, fontes e largura do container são definidos em `:root` no `style.css`. A numeração editorial usa `01 / Sobre`, `02 / Experiência`, `03 / Stack`, `04 / Projetos`, `05 / Formação` e `06 / Contato`. Navbar e footer levam aos respectivos IDs. Os IDs `cursos` e `conquistas` identificam blocos internos da Formação; `top` está no início da página para o retorno ao topo.

O HTML inclui link de salto, foco visível, títulos hierárquicos e identificação de links que abrem outra aba. Animações e rolagem suave respeitam a preferência por movimento reduzido. O menu mobile fecha com Escape ou seleção de link, controla o foco por teclado e bloqueia a rolagem de fundo.

O hero e a seção Sobre não utilizam fotos pessoais. O currículo em `assets/documents/curriculo-joao-gabriel.pdf` está disponível para download na navbar, no hero e no contato.

## Ativar canais de contato

O GitHub aponta para `https://github.com/brazk04`. O LinkedIn está preparado em um comentário `TODO: adicionar URL do LinkedIn`: substitua `URL_LINKEDIN` pela URL real e descomente o link.

O CTA final leva ao GitHub enquanto o e-mail profissional não foi fornecido. No comentário `TODO: adicionar e-mail profissional`, há instruções para substituí-lo por um link `mailto:` com o endereço real e o texto Entrar em contato. Remova a mensagem de disponibilidade ao ativar esse link. Não há controles falsos, formulário, serviço de envio ou endereço fictício.

A classe reutilizável `.reveal` anima elementos uma única vez quando entram no viewport. Sem JavaScript, sem suporte a IntersectionObserver ou com movimento reduzido, o conteúdo permanece visível. Os textos e as experiências estão no HTML, sem renderização por JavaScript.

## Movimento e interações

Os tokens `--duration-fast`, `--duration-normal`, `--duration-slow`, `--ease-out` e `--ease-smooth` centralizam tempos e curvas no CSS. As variações `data-reveal="up|left|right|scale"` compartilham o IntersectionObserver, com stagger limitado a 180ms. A intro dura até 1,4s, não intercepta cliques e é encerrada ao interagir; `sessionStorage` evita repetições. O único text scramble dura até 480ms e possui texto acessível estável.

Spotlight, parallax, luz dos CTAs, magnetismo de até 4px e previews de projetos são habilitados apenas em desktop com ponteiro fino e hover. Um ciclo compartilhado de `requestAnimationFrame` agrega as atualizações, para quando a interpolação estabiliza e é cancelado quando a aba fica oculta. A luz move um gradiente estático com transformações. Touch mantém tipografia, textura e reveal, sem efeitos de mouse.

Os projetos agora usam galerias com imagens reais, tilt restrito à principal e visualização ampliada. O ponto da logo na navbar possui um easter egg: cinco cliques rápidos acionam um pulso discreto, sem áudio nem alteração de conteúdo.

`prefers-reduced-motion` desativa intro, scramble, magnetismo, parallax, movimento de mouse, transições e rolagem suave. A troca dessa preferência durante a sessão cancela os efeitos e revela o conteúdo imediatamente. A fase 8.6 acrescenta WebGL apenas ao Hero.

## Campo de partículas

O canvas global em `js/particles.js` usa somente Canvas 2D e JavaScript nativo. Pontos de 0,6–2,2px têm profundidade, deriva multidirecional e distribuição aproximada de 80% neutros / 20% violetas. A densidade depende da viewport: 15–30 no mobile, 30–50 no tablet, 50–80 no notebook e 70–110 em telas grandes. O DPR é limitado a 2.

O ponteiro fino gera repulsão em um raio de 160px, com deslocamento de poucos pixels, coordenadas interpoladas e aumento discreto de luminosidade junto ao spotlight. A rolagem acrescenta parallax limitado a 10px; a intensidade muda suavemente entre seções. As letras de fundo e a assinatura gigante continuam presentes, com o conteúdo acima das partículas. Não há linhas de conexão, glow pesado ou bibliotecas externas.

Este campo possui um ciclo contínuo próprio de `requestAnimationFrame`, diferente do ciclo de interações que para ao estabilizar. A aba oculta pausa o campo; `prefers-reduced-motion` oculta o canvas e interrompe a animação. Touch recebe somente deriva ambiental mais lenta, sem reação ao cursor. Frames persistentemente lentos reduzem a densidade progressivamente, até 45% da quantidade inicial, sem mudar o conteúdo.

Verificação adicional em Chrome headless: partículas, cores, tamanhos, reação ao mouse, DPR 3 limitado a 2, resize de 320 a 1920px sem overflow ou canvas duplicado, cliques livres, ponteiro coarse, alternância de movimento reduzido e pausa/retomada por visibilidade. A redução adaptativa foi exercitada com intervalos de frame artificialmente ampliados; isso não é um benchmark de FPS. Capturas desktop, mobile e contato foram revisadas, sem exceções JavaScript nos testes.

## Atualizar projetos

Os projetos são artigos estáticos no `index.html`. Para adicionar um trabalho, reutilize um `article.project-row` com título e ID únicos, categoria, descrição, lista de tecnologias, preview e links reais.

As galerias usam os PNGs originais nas pastas `assets/images/projects/nexa/`, `morfy/` e `commit-zero/`. Os nomes são preservados. Para adicionar uma imagem, confirme seu caminho real e inclua um link `.project-thumbnail` no HTML com `href`, `data-image-alt`, `data-width` e `data-height`, além da miniatura com `loading="lazy"` e `decoding="async"`. O navegador não lista diretórios. A principal usa dimensões reais, altura limitada e `object-fit: contain`, sem cortar a interface. Sem JavaScript, os links abrem os PNGs diretamente.

Os links individuais estão comentados junto a cada projeto com `TODO` e nomes fáceis de localizar, como `URL_PUBLICA_NEXA` e `URL_REPOSITORIO_NEXA`. Substitua esses valores pelas URLs reais e remova os comentários ao ativar os links. Não há destinos fictícios ativos. O link geral leva a `https://github.com/brazk04`.

## Versionamento e hospedagem

O projeto está preparado para Git por meio do `.gitignore`. Para iniciar o versionamento local, execute `git init` na raiz e revise os arquivos antes do primeiro commit.

A hospedagem futura será na **Vercel**, como projeto estático, sem comando de build e com a raiz como diretório de publicação. Nenhuma publicação foi realizada nesta fase.

GitHub: [brazk04](https://github.com/brazk04).

## Antes da publicação

- Definir o domínio e ativar canonical e `og:url` com a URL absoluta real.
- Adicionar `assets/images/og-cover.webp` e ativar `og:image` e `twitter:image` com URLs absolutas reais. Não há imagem social fictícia.
- Adicionar e-mail, LinkedIn e URLs dos projetos quando disponíveis.
- Manter as galerias sincronizadas com os arquivos reais das pastas de projetos.

O favicon SVG já utiliza a identidade `b.` nas cores do site, com ICO como fallback. A fonte utiliza a stack do sistema, sem download externo. Não foi adicionado manifest, pois esta página estática não precisa de instalação ou funcionalidades PWA.

## Verificações

Revisão em Chrome headless nas larguras 1920, 1440, 1366, 1280, 1024, 768, 480, 430, 390, 375 e 320px: sem overflow horizontal ou conteúdo cortado nos títulos e listas de tecnologias. Na fase 8.5 foram verificados intro por sessão, conclusão do scramble, mouse, magnetismo, touch, resize, scroll progress, indicador da seção atual, reveals, ausência de preview sem screenshots e o easter egg. Foram revisitadas todas as seções e conferidas capturas desktop e mobile. Redução de movimento foi testada tanto na entrada quanto durante a sessão, assim como conteúdo sem JavaScript. Não houve exceções JavaScript ou respostas de recurso com erro nesses testes.

Menu, ciclo de foco, teclado nativo, skip link, offsets da navbar e PDF foram verificados na fase 8. Não foi feita medição de FPS ou benchmark em hardware móvel real; o objetivo de fluidez não representa garantia universal de 60fps.

Lighthouse não está instalado no ambiente e não foi executado; nenhuma pontuação é presumida. Execute a auditoria nas quatro categorias no ambiente de publicação. Os metadados dependentes de domínio e imagem social devem ser concluídos após esses dados serem definidos.

## Experiência 3D — fase 8.6

`js/three-scene.js` e `css/three.css` isolam o Data Core e as interações de profundidade. O núcleo procedural reúne sólido translúcido, wireframe, pontos internos violetas, pontos de superfície, partículas externas e anéis inclinados. Materiais básicos, câmera de 38 graus e transparência mantêm o objeto discreto. Texto e links ficam acima do canvas; as partículas Canvas 2D foram preservadas.

Three.js **0.170.0** é importado dinamicamente pelo jsDelivr apenas quando o Hero está visível em telas a partir de 768px e WebGL2 está disponível. O download de uma cópia local foi bloqueado pela rede deste ambiente. Não há npm ou build. Referência: [documentação oficial](https://threejs.org/docs/).

A animação usa tempo decorrido, interpolação suave, hover de 1,2x, pulso de 0,75% e entrada de 800ms após a intro. A saída por scroll reduz escala e opacidade. IntersectionObserver e Visibility API pausam os frames quando o Hero ou a aba ficam ocultos. ResizeObserver atualiza câmera e canvas; a troca para mobile descarta geometria, materiais, listeners e contexto. Perda de WebGL revela o fallback CSS.

Abaixo de 768px, não há carregamento de Three.js: permanece o ambiente 2D. Tablet e hardware limitado recebem menos pontos, um anel e DPR máximo de 1; desktop usa no máximo 1,5. Frames persistentemente lentos reduzem DPR e partículas externas. Movimento reduzido exibe o Core estático, sem tracking, pulso ou parallax, inclusive ao mudar a preferência durante a sessão. Sem WebGL ou rede, uma composição CSS abstrata mantém o layout sem mensagens de erro.

Nexa recebe tilt de até 4 graus, outros previews até 3, Campus Party até 2 e assinatura final até 0,8. Ao retirar o cursor, os elementos retornam suavemente. Touch e movimento reduzido desativam tilt; a stack recebe apenas escala de 1,03 no hover. Placeholders também recebem tilt enquanto screenshots reais não estão disponíveis.

Verificações desta fase: `node --check` passou nos três arquivos JavaScript. Chrome e Edge headless verificaram layout sem overflow, fallback CSS e movimento reduzido em larguras efetivas de aproximadamente 1440, 750 e 500px, sem exceções JavaScript. O headless impôs largura mínima e não validou 390px reais. Os testes usaram GPU desativada: não comprovam renderização WebGL, tracking ou FPS. Firefox não está instalado. Ainda devem ser validados WebGL em GPU real, mouse rápido/lento, resize durante animação, pausa/retomada por scroll e troca de aba, tablet e celular reais. Não há garantia medida de 60 FPS.

## Galerias PNG dos projetos

Foram encontrados e revisados visualmente nove arquivos, sem renomear, converter ou modificar os PNGs:

- Nexa: `chat.png` (principal, 1440×960), `logocomfundo.png` e `meeting.png`.
- Morfy: `01-homepage.png` (principal, 780×1688), `02-conversion-result.png`, `03-batch.png` e `ChatGPT Image 12_09_2026, 15_17_09.png`.
- Commit Zero: `1788501364116 (1).png` (principal, 768×768) e `ChatGPT Image 12_09_2026, 20_44_53.png`.

Nexa mostra uma interface ampla; Morfy mostra sua página inicial, pois as screenshots disponíveis são verticais; Commit Zero usa a marca quadrada, com a apresentação vertical na galeria. Todos os arquivos têm links reais no HTML e estão acessíveis por miniaturas e pelo mesmo lightbox reutilizável. As miniaturas incluem a imagem principal para permitir seu retorno. Não existe descoberta de arquivos em runtime.

`js/project-gallery.js` cuida da seleção, fade, estado ativo, lightbox com dialog nativo, contador, setas, Escape, fechamento pelo fundo, bloqueio de scroll e foco. O tilt e o spotlight pertencem somente à imagem principal em desktop com ponteiro fino; miniaturas ficam estáveis. A preferência por movimento reduzido e touch desativam tilt. `css/project-gallery.css` organiza Nexa em aproximadamente 55% de imagem, alterna Morfy para imagem à esquerda no desktop e mantém Commit Zero com imagem à direita. No mobile, miniaturas rolam horizontalmente e controles possuem alvos de pelo menos 48px.

A imagem principal faz fade antes de trocar e retorna ao estado visível após carregar. Falha de carregamento mostra o fallback tipográfico; o lightbox mantém seus controles e mostra uma mensagem de indisponibilidade. Cliques rápidos cancelam a troca pendente anterior. Os PNGs mantêm qualidade e nomes originais, com carregamento lazy e decoding assíncrono.

Validação das galerias em Chrome e Edge headless via DevTools: os nove PNGs carregaram com HTTP 200; todas as miniaturas trocaram para seus arquivos correspondentes; lightbox abriu a imagem selecionada, navegou pelas setas e pelo teclado, fechou por Escape, botão e fundo e liberou o scroll. Foram exercitados tilt com ponteiro, retorno ao sair, ausência de tilt em touch, movimento reduzido, cliques rápidos e fallback simulando imagem bloqueada. Emulação de viewport em 1440, 1024, 768, 390 e 320px passou sem overflow horizontal. Capturas desktop, mobile e lightbox foram revisadas. Nenhuma exceção JavaScript foi registrada. Firefox e dispositivos físicos não foram testados.
