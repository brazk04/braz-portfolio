# braz. — Portfolio

Portfólio pessoal de João Gabriel Lira Lemes Braz, Desenvolvedor de Software e estudante de Engenharia de Software.

## Online

[Acessar o portfólio](https://braz-portfolio.vercel.app/)

## Sobre o projeto

Site estático com apresentação profissional, experiência, tecnologias, projetos, formação e currículo para download. Inclui partículas, Data Core 3D, galerias e lightbox. O conteúdo permanece acessível sem JavaScript, e as animações respeitam a preferência por movimento reduzido.

## Tecnologias

- HTML5, CSS3 e JavaScript.
- Three.js 0.170.0, carregado sob demanda pelo jsDelivr no Hero em telas compatíveis.
- Canvas API para partículas e IntersectionObserver para revelação progressiva e pausa de animações fora da tela.
- Sem framework, dependências npm ou etapa de build.

## Estrutura

```text
index.html
css/                       # Estilos, responsividade, animações e galerias
js/                        # Navegação, partículas, Three.js e lightbox
assets/icons/              # Favicon SVG
assets/images/projects/    # Screenshots dos projetos
assets/documents/          # Currículo PDF
favicon.ico
vercel.json
```

## Projetos apresentados

- Nexa.
- Morfy.
- Commit Zero.

As galerias utilizam nove PNGs reais, com miniaturas, navegação por teclado e visualização ampliada.

## Executando localmente

Na raiz do projeto, com Python instalado:

```sh
python -m http.server 8000
```

Acesse `http://localhost:8000`. Use HTTP para carregar os módulos JavaScript.

## Deploy

Publicado na Vercel como site estático, com a raiz como diretório de saída. O projeto `braz-portfolio` está conectado ao repositório [brazk04/braz-portfolio](https://github.com/brazk04/braz-portfolio), na branch `main`.

```sh
vercel --prod
```

Canonical, Open Graph e JSON-LD utilizam a URL de produção. Arquivos locais de autenticação, `.env*` e `.vercel/` são ignorados pelo Git. O site não precisa de variáveis de ambiente.

## Autor

João Gabriel Lira Lemes Braz — [GitHub](https://github.com/brazk04).

## Pendências de conteúdo

Adicionar e-mail profissional, LinkedIn e links dos projetos quando fornecidos. A imagem social `assets/images/og-cover.webp` ainda não existe; seus metadados permanecem desativados para evitar links quebrados.
