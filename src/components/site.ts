import { profile, type Profile } from "../data/profile.ts";

type PageKey =
  | "home"
  | "sobre"
  | "areas"
  | "congressos"
  | "livro"
  | "publicacoes"
  | "destaques"
  | "marcacao";

type LegalKey = "privacidade" | "cookies" | "termos";

type Feature = Profile["externalFeatures"][number];
type Publication = Profile["publications"][number];

const navItems: Array<{ key: PageKey; label: string; href: string }> = [
  { key: "home", label: "Início", href: "index.html" },
  { key: "sobre", label: "Sobre Mim", href: "sobre.html" },
  { key: "areas", label: "Áreas de Atuação", href: "areas.html" },
  { key: "congressos", label: "Congressos e Eventos", href: "congressos-eventos.html" },
  { key: "publicacoes", label: "Publicações", href: "publicacoes.html" },
  { key: "destaques", label: "Destaques", href: "destaques.html" }
];

const legalPages: Record<LegalKey, { title: string; text: string }> = {
  privacidade: {
    title: "Política de Privacidade",
    text:
      "Antes da publicação, esta política deve ser adaptada ao domínio final, formulários, ferramentas de analytics, cookies e eventuais integrações externas."
  },
  cookies: {
    title: "Política de Cookies",
    text:
      "Antes da publicação, deve ser confirmada a utilização real de cookies, pixels, analytics ou embeds de terceiros."
  },
  termos: {
    title: "Termos de Utilização",
    text:
      "Antes da publicação, os termos devem ser revistos para refletir o uso informativo do site, limites de responsabilidade e propriedade intelectual."
  }
};

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidUrl(url: string | undefined): boolean {
  return Boolean(url && /^https?:\/\//.test(url));
}

function externalLink(url: string | undefined, label: string, className = "text-link"): string {
  if (!isValidUrl(url)) return "";
  return `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function pageTitle(title: string, p: Profile): string {
  return title === p.name ? p.seo.title : `${title} — ${p.name}`;
}

function renderJsonLd(p: Profile): string {
  const sameAs = [
    p.links.cuf,
    p.links.instagram,
    p.links.linkedin,
    p.links.wook,
    p.links.applePodcast,
    p.links.spotifyPodcast
  ].filter(isValidUrl);

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Person", "Physician"],
          name: p.shortName,
          honorificPrefix: "Dra.",
          jobTitle: "Médica especialista em Endocrinologia, Diabetes e Metabolismo",
          medicalSpecialty: "Endocrinologia",
          worksFor: {
            "@type": "MedicalOrganization",
            name: p.mainUnit,
            address: {
              "@type": "PostalAddress",
              addressLocality: p.location,
              addressCountry: "PT"
            }
          },
          url: p.links.cuf,
          sameAs
        },
        {
          "@type": "Book",
          name: p.book.title,
          alternateName: p.book.subtitle,
          author: {
            "@type": "Person",
            name: p.book.author
          },
          publisher: {
            "@type": "Organization",
            name: p.book.publisher
          },
          isbn: p.book.isbn,
          inLanguage: "pt-PT",
          datePublished: p.book.releaseDate,
          url: p.book.purchaseUrl
        },
        {
          "@type": "WebSite",
          name: `${p.name} — ${p.specialty}`,
          inLanguage: "pt-PT",
          description: p.seo.description
        }
      ]
    },
    null,
    2
  );
}

function renderHead(title: string, description: string, p: Profile): string {
  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle(title, p))}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(p.seo.keywords.join(", "))}">
    <!-- VALIDAR ANTES DE PUBLICAR: inserir domínio final para canonical. -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(pageTitle(title, p))}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="/${escapeHtml(p.images.og)}">
    <meta property="og:locale" content="pt_PT">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#f7f2ec">
    <link rel="preload" as="image" href="${escapeHtml(p.images.portrait)}">
    <link rel="stylesheet" href="styles.css">
    <script type="application/ld+json">${renderJsonLd(p)}</script>
  `;
}

function renderTopbar(p: Profile): string {
  return `
    <div class="topbar">
      <div class="container topbar-inner">
        <span>${escapeHtml(p.mainUnit)}</span>
        <span>Marcação através da CUF</span>
      </div>
    </div>
  `;
}

function renderHeader(active: PageKey, p: Profile): string {
  const links = navItems
    .map(
      (item) =>
        `<a href="${item.href}"${item.key === active ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`
    )
    .join("");

  return `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="${escapeHtml(p.name)}">
          <span>${escapeHtml(p.name)}</span>
          <small>${escapeHtml(p.specialty)}</small>
        </a>
        <nav class="site-nav" id="site-nav" aria-label="Navegação principal">
          ${links}
        </nav>
        <div class="header-actions">
          <a class="button button-primary button-small" href="marcacao.html">Marcar consulta</a>
          <button class="nav-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="site-nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderFooter(p: Profile): string {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h2>${escapeHtml(p.name)}</h2>
          <p>${escapeHtml(p.specialty)}</p>
          <p class="footer-note">${escapeHtml(p.medicalDisclaimer)}</p>
        </div>
        <nav aria-label="Navegação de rodapé">
          ${navItems.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join("")}
          <a href="livro.html">Livro</a>
          <a href="marcacao.html">Marcar consulta</a>
        </nav>
        <div class="legal-links">
          <a href="privacidade.html">Política de Privacidade</a>
          <a href="cookies.html">Política de Cookies</a>
          <a href="termos.html">Termos de Utilização</a>
        </div>
      </div>
      <div class="container copyright">© 2026 Dra. Inês Sapinho. Todos os direitos reservados.</div>
    </footer>
  `;
}

function layout(page: {
  title: string;
  description: string;
  active: PageKey;
  body: string;
  p?: Profile;
}): string {
  const p = page.p ?? profile;
  return `<!doctype html>
<html lang="pt-PT">
  <head>
    ${renderHead(page.title, page.description, p)}
  </head>
  <body class="page-shell">
    <a class="skip-link" href="#main">Saltar para o conteúdo</a>
    ${renderTopbar(p)}
    ${renderHeader(page.active, p)}
    <main id="main" class="page-transition">
      ${page.body}
    </main>
    ${renderFooter(p)}
    <script src="script.js" defer></script>
  </body>
</html>
`;
}

function sectionIntro(kicker: string, title: string, text?: string): string {
  return `
    <div class="section-intro reveal">
      <p class="kicker">${escapeHtml(kicker)}</p>
      <h2>${escapeHtml(title)}</h2>
      ${text ? `<p>${escapeHtml(text)}</p>` : ""}
    </div>
  `;
}

function renderPageHero(args: {
  kicker: string;
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
  aside?: string;
}): string {
  return `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="page-hero-copy reveal">
          <p class="kicker">${escapeHtml(args.kicker)}</p>
          <h1>${escapeHtml(args.title)}</h1>
          <p>${escapeHtml(args.text)}</p>
        </div>
        ${
          args.image
            ? `<figure class="page-hero-image reveal"><img src="${escapeHtml(args.image)}" alt="${escapeHtml(
                args.imageAlt ?? ""
              )}" loading="eager"></figure>`
            : args.aside ?? ""
        }
      </div>
    </section>
  `;
}

function renderFeatureImage(item: Feature): string {
  if (item.image) {
    return `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">`;
  }
  return `<div class="source-mark"><span>${escapeHtml(item.source)}</span></div>`;
}

function renderFeatureCard(item: Feature): string {
  const meta = [item.source, item.type, item.year, item.topic].filter(Boolean).join(" · ");
  return `
    <article class="feature-card reveal">
      <a class="feature-image" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
        ${renderFeatureImage(item)}
      </a>
      <div class="feature-body">
        <span class="label">${escapeHtml(meta)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
        ${externalLink(item.url, "Abrir conteúdo", "text-link")}
      </div>
    </article>
  `;
}

function renderAreaCard(area: Profile["areas"][number], link = false): string {
  const href = `areas.html#${area.id ?? area.title.toLowerCase().replaceAll(" ", "-")}`;
  return `
    <article class="content-card reveal"${area.id ? ` id="${escapeHtml(area.id)}"` : ""}>
      <h3>${escapeHtml(area.title)}</h3>
      <p>${escapeHtml(area.text)}</p>
      ${link ? `<a class="text-link" href="${href}">Conhecer área</a>` : ""}
    </article>
  `;
}

function renderPublication(item: Publication): string {
  return `
    <article class="publication-item reveal">
      <time>${escapeHtml(item.year)}</time>
      <div>
        <span class="label">${escapeHtml(item.type)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="authors">${escapeHtml(item.authors)}</p>
        <p>${escapeHtml(item.summary)}</p>
        <p class="area">${escapeHtml(item.area)}</p>
      </div>
      ${externalLink(item.url, "Ver publicação", "text-link")}
    </article>
  `;
}

function renderAppointmentPanel(p: Profile): string {
  return `
    <aside class="appointment-card reveal">
      <p class="kicker">Marcação</p>
      <h2>Consulta presencial e teleconsulta</h2>
      <dl>
        <dt>Unidade</dt>
        <dd>${escapeHtml(p.mainUnit)}</dd>
        <dt>Consultas</dt>
        <dd>Endocrinologia, Diabetes, Tiroide e Menopausa</dd>
        <dt>Disponibilidade</dt>
        <dd>Atualizada no site oficial da CUF</dd>
      </dl>
      ${externalLink(p.links.cuf, "Ver disponibilidade CUF", "button button-primary")}
    </aside>
  `;
}

function renderHome(p: Profile): string {
  const featuredAreas = p.areas.slice(0, 6).map((area) => renderAreaCard(area, true)).join("");
  const features = p.externalFeatures.slice(0, 3).map(renderFeatureCard).join("");

  return layout({
    title: p.name,
    description: p.seo.description,
    active: "home",
    p,
    body: `
      <section class="home-hero">
        <div class="container home-hero-grid">
          <div class="hero-card reveal">
            <p class="kicker">${escapeHtml(p.eyebrow)}</p>
            <h1>${escapeHtml(p.name)}</h1>
            <p class="hero-lead">${escapeHtml(p.tagline)}</p>
            <p>${escapeHtml(p.intro)}</p>
            <div class="hero-actions">
              <a class="button button-primary" href="marcacao.html">Marcar consulta</a>
              <a class="button button-secondary" href="sobre.html">Conhecer percurso clínico</a>
            </div>
          </div>
          <figure class="hero-portrait reveal">
            <img src="${escapeHtml(p.images.portrait)}" alt="Retrato profissional da Dra. Inês Sapinho" width="600" height="600">
          </figure>
          ${renderAppointmentPanel(p)}
        </div>
      </section>

      <section class="section home-intro">
        <div class="container split-grid">
          <div class="reveal">
            ${sectionIntro("Sobre Mim", "Endocrinologia com presença clínica e literacia em saúde")}
            <p>${escapeHtml(p.about[0])}</p>
            <p>${escapeHtml(p.about[1])}</p>
            <a class="text-link" href="sobre.html">Ler percurso completo</a>
          </div>
          <div class="metric-panel reveal">
            <span>OM ${escapeHtml(p.orderNumber)}</span>
            <span>${escapeHtml(p.mainUnit)}</span>
            <span>Português e Inglês</span>
          </div>
        </div>
      </section>

      <section class="section section-muted">
        <div class="container">
          ${sectionIntro("Áreas de atuação", "Acompanhamento em doenças hormonais e metabólicas")}
          <div class="cards-grid cards-grid-3">
            ${featuredAreas}
          </div>
          <div class="center-action reveal">
            <a class="button button-secondary" href="areas.html">Ver todas as áreas</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionIntro("Destaques", "Media, livro e literacia em saúde")}
          <div class="feature-grid">
            ${features}
          </div>
          <div class="center-action reveal">
            <a class="button button-secondary" href="destaques.html">Ver todos os destaques</a>
          </div>
        </div>
      </section>

      <section class="section cta-section">
        <div class="container cta-box reveal">
          <div>
            <p class="kicker">CUF</p>
            <h2>Marcação através dos canais oficiais</h2>
            <p>A disponibilidade, horários, acordos e condições de marcação devem ser confirmados diretamente no site oficial da CUF.</p>
          </div>
          <a class="button button-primary" href="marcacao.html">Marcar consulta</a>
        </div>
      </section>
    `
  });
}

function renderAboutPage(p: Profile): string {
  const facts = p.quickFacts
    .map(([label, value]) => `<dl><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></dl>`)
    .join("");
  const mission = p.mission.cards
    .map(
      (item, index) => `
        <article class="principle-card reveal">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");

  return layout({
    title: "Sobre Mim",
    description: "Percurso clínico, dados profissionais e missão clínica da Dra. Inês Sapinho.",
    active: "sobre",
    p,
    body: `
      ${renderPageHero({
        kicker: "Sobre Mim",
        title: p.name,
        text: "Percurso clínico, prática assistencial e comunicação médica clara em Endocrinologia.",
        image: p.images.editorial,
        imageAlt: "Retrato editorial da Dra. Inês Sapinho"
      })}
      <section class="section">
        <div class="container split-grid">
          <div class="copy-stack reveal">
            ${p.about.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
          </div>
          <aside class="fact-panel reveal">
            <h2>Dados rápidos</h2>
            ${facts}
          </aside>
        </div>
      </section>
      <section class="section section-muted">
        <div class="container">
          ${sectionIntro("Missão clínica", "Rigor, clareza e acompanhamento individualizado", p.mission.intro)}
          <div class="cards-grid cards-grid-3">${mission}</div>
        </div>
      </section>
    `
  });
}

function renderAreasPage(p: Profile): string {
  return layout({
    title: "Áreas de Atuação",
    description: "Áreas clínicas acompanhadas em consulta de Endocrinologia, Diabetes e Metabolismo.",
    active: "areas",
    p,
    body: `
      ${renderPageHero({
        kicker: "Áreas de atuação",
        title: "Endocrinologia, Diabetes e Metabolismo",
        text: "Avaliação de alterações hormonais e metabólicas com impacto na saúde geral, no peso, na glicose, na função tiroideia, na saúde da mulher e noutras dimensões clínicas.",
        image: p.images.portrait,
        imageAlt: "Dra. Inês Sapinho"
      })}
      <section class="section">
        <div class="container">
          <div class="cards-grid cards-grid-3">
            ${p.areas.map((area) => renderAreaCard(area)).join("")}
          </div>
          <p class="medical-note reveal">Esta informação é geral e não substitui consulta médica individualizada.</p>
        </div>
      </section>
      <section class="section section-muted">
        <div class="container narrow">
          ${sectionIntro("Quando marcar", "Sinais e contextos que podem justificar avaliação")}
          <div class="faq-list">
            ${p.whenToBook
              .map(
                (item, index) => `
                  <article class="faq-item reveal">
                    <button type="button" aria-expanded="${index === 0}" aria-controls="when-${index}">
                      <span>${escapeHtml(item.title)}</span><span aria-hidden="true"></span>
                    </button>
                    <div class="faq-answer" id="when-${index}"${index === 0 ? "" : " hidden"}>
                      <p>${escapeHtml(item.text)}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `
  });
}

function renderCongressPage(p: Profile): string {
  const timeline = p.education
    .map(
      (item) => `
        <article class="timeline-item reveal">
          <time>${escapeHtml(item.year)}</time>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            ${item.institution ? `<p>${escapeHtml(item.institution)}</p>` : ""}
          </div>
        </article>
      `
    )
    .join("");
  const certificates = p.certificates
    .map(
      (item) => `
        <article class="certificate-card reveal">
          <figure><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy"></figure>
          <div>
            <span class="label">${escapeHtml(item.institution)} · ${escapeHtml(item.year)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.meta)}</p>
          </div>
        </article>
      `
    )
    .join("");
  const societies = p.societies
    .map(
      (item) => `
        <article class="society-item reveal">
          <span>${escapeHtml(item.label)}</span>
          <h3>${escapeHtml(item.title)}</h3>
        </article>
      `
    )
    .join("");

  return layout({
    title: "Congressos e Eventos",
    description: "Formação, congressos, eventos e certificados da Dra. Inês Sapinho.",
    active: "congressos",
    p,
    body: `
      ${renderPageHero({
        kicker: "Congressos e Eventos",
        title: "Formação contínua e atualização científica",
        text: "Percurso académico, formação complementar, sociedades científicas e certificados relevantes.",
        image: "images/certificados/stanford-menopause-healthy-aging.jpg",
        imageAlt: "Certificado Stanford Medicine"
      })}
      <section class="section">
        <div class="container">
          ${sectionIntro("Percurso", "Formação académica e percurso profissional")}
          <div class="timeline">${timeline}</div>
          <p class="medical-note reveal">Datas, cargos atuais e formulações finais devem ser confirmados com a médica antes da publicação.</p>
        </div>
      </section>
      <section class="section section-muted">
        <div class="container">
          ${sectionIntro("Certificados", "Formação internacional e liderança em saúde")}
          <div class="certificate-grid">${certificates}</div>
        </div>
      </section>
      <section class="section">
        <div class="container narrow">
          ${sectionIntro("Sociedades científicas", "Grupos de estudo e atualização contínua")}
          <div class="society-list">${societies}</div>
        </div>
      </section>
    `
  });
}

function renderBookPage(p: Profile): string {
  const details = [
    ["Autora", p.book.author],
    ["Editora", p.book.publisher],
    ["Lançamento", p.book.releaseDate],
    ["Idioma", p.book.language],
    ["ISBN", p.book.isbn],
    ["Páginas", String(p.book.pages)],
    ["Dimensões", p.book.dimensions],
    ["Tema", p.book.theme]
  ]
    .map(([label, value]) => `<dl><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></dl>`)
    .join("");

  return layout({
    title: p.book.title,
    description: "Livro Os Segredos da Sua Tiroide, de Inês Sapinho.",
    active: "destaques",
    p,
    body: `
      <section class="book-hero">
        <div class="container book-grid">
          <figure class="book-cover reveal">
            <img src="${escapeHtml(p.book.coverImage)}" alt="Capa do livro Os Segredos da Sua Tiroide" loading="eager">
          </figure>
          <div class="book-copy reveal">
            <p class="kicker">Livro</p>
            <h1>${escapeHtml(p.book.title)}</h1>
            <p class="book-subtitle">${escapeHtml(p.book.subtitle)}</p>
            <p>${escapeHtml(p.book.description)}</p>
            <div class="book-details">${details}</div>
            <div class="hero-actions">
              ${externalLink(p.book.purchaseUrl, "Comprar na WOOK", "button button-primary")}
              <a class="button button-secondary" href="areas.html#tiroide">Saber mais sobre tiroide</a>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${sectionIntro("Destaques do livro", "Conteúdos relacionados")}
          <div class="feature-grid">
            ${p.externalFeatures
              .filter((item) => item.topic === "Tiroide")
              .map(renderFeatureCard)
              .join("")}
          </div>
        </div>
      </section>
    `
  });
}

function renderPublicationsPage(p: Profile): string {
  return layout({
    title: "Publicações",
    description: "Publicações científicas e trabalhos académicos da Dra. Inês Sapinho.",
    active: "publicacoes",
    p,
    body: `
      ${renderPageHero({
        kicker: "Publicações",
        title: "Atividade científica",
        text: "Trabalhos científicos, casos clínicos, revisões e capítulos integrados no percurso clínico e académico.",
        aside: renderAppointmentPanel(p)
      })}
      <section class="section">
        <div class="container">
          <div class="publication-list">${p.publications.map(renderPublication).join("")}</div>
          <p class="medical-note reveal">Lista inicial a confirmar com a médica. Idealmente, cada publicação deve apontar para DOI, PubMed, revista científica ou PDF oficial.</p>
        </div>
      </section>
    `
  });
}

function renderHighlightsPage(p: Profile): string {
  const bookFeature = `
    <article class="feature-card feature-card-book reveal">
      <a class="feature-image" href="livro.html">
        <img src="${escapeHtml(p.book.coverImage)}" alt="Capa do livro Os Segredos da Sua Tiroide" loading="lazy">
      </a>
      <div class="feature-body">
        <span class="label">Livro · Manuscrito Editora</span>
        <h3>${escapeHtml(p.book.title)}</h3>
        <p>${escapeHtml(p.book.description)}</p>
        <a class="text-link" href="livro.html">Ver livro</a>
      </div>
    </article>
  `;

  return layout({
    title: "Destaques",
    description: "Destaques, entrevistas, artigos, televisão, podcast e livro da Dra. Inês Sapinho.",
    active: "destaques",
    p,
    body: `
      ${renderPageHero({
        kicker: "Destaques",
        title: "Media, livro e literacia em saúde",
        text: "Conteúdos públicos de divulgação médica, entrevistas, artigos, podcast e livro.",
        image: p.images.editorial,
        imageAlt: "Dra. Inês Sapinho"
      })}
      <section class="section">
        <div class="container">
          ${sectionIntro("Conteúdos públicos", "Artigos, entrevistas e participação em media")}
          <div class="feature-grid">
            ${bookFeature}
            ${p.externalFeatures.map(renderFeatureCard).join("")}
          </div>
          <p class="medical-note reveal">Links e datas devem ser confirmados antes da publicação final. Conteúdos externos abrem no respetivo site original.</p>
        </div>
      </section>
    `
  });
}

function renderAppointmentPage(p: Profile): string {
  return layout({
    title: "Marcação de consulta",
    description: "Marcação de consulta da Dra. Inês Sapinho através da CUF.",
    active: "marcacao",
    p,
    body: `
      ${renderPageHero({
        kicker: "Marcação",
        title: "Consulta presencial e teleconsulta através da CUF",
        text: "As marcações devem ser realizadas através dos canais oficiais da CUF, onde é possível consultar disponibilidade, unidades, acordos, horários e opções de teleconsulta.",
        image: p.images.portrait,
        imageAlt: "Dra. Inês Sapinho"
      })}
      <section class="section">
        <div class="container split-grid">
          ${renderAppointmentPanel(p)}
          <div class="copy-stack reveal">
            <h2>Informação prática</h2>
            <p>A Dra. Inês Sapinho desenvolve atividade clínica no Hospital CUF Descobertas — Lisboa, com marcação presencial e teleconsulta através dos canais oficiais CUF.</p>
            <p>A disponibilidade, horários, acordos e condições de marcação podem variar e devem ser confirmados diretamente no site oficial da CUF.</p>
            <div class="hero-actions">
              ${externalLink(p.links.cuf, "Marcar consulta na CUF", "button button-primary")}
              ${externalLink(p.links.cuf, "Ver perfil CUF", "button button-secondary")}
            </div>
          </div>
        </div>
      </section>
      <section class="section section-muted">
        <div class="container narrow">
          ${sectionIntro("Perguntas frequentes", "Antes de marcar consulta")}
          <div class="faq-list">
            ${p.faq
              .slice(0, 6)
              .map(
                (item, index) => `
                  <article class="faq-item reveal">
                    <button type="button" aria-expanded="${index === 0}" aria-controls="faq-${index}">
                      <span>${escapeHtml(item.question)}</span><span aria-hidden="true"></span>
                    </button>
                    <div class="faq-answer" id="faq-${index}"${index === 0 ? "" : " hidden"}>
                      <p>${escapeHtml(item.answer)}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
          <p class="medical-note reveal">${escapeHtml(p.medicalDisclaimer)}</p>
        </div>
      </section>
    `
  });
}

export function renderSitePages(p: Profile = profile): Record<string, string> {
  return {
    "index.html": renderHome(p),
    "sobre.html": renderAboutPage(p),
    "areas.html": renderAreasPage(p),
    "congressos-eventos.html": renderCongressPage(p),
    "livro.html": renderBookPage(p),
    "publicacoes.html": renderPublicationsPage(p),
    "destaques.html": renderHighlightsPage(p),
    "marcacao.html": renderAppointmentPage(p)
  };
}

export function renderPage(p: Profile = profile): string {
  return renderHome(p);
}

export function renderLegalPage(page: LegalKey, p: Profile = profile): string {
  const content = legalPages[page];
  return `<!doctype html>
<html lang="pt-PT">
  <head>
    ${renderHead(content.title, content.text, p)}
    <meta name="robots" content="noindex">
  </head>
  <body class="page-shell">
    <a class="skip-link" href="#main">Saltar para o conteúdo</a>
    ${renderTopbar(p)}
    ${renderHeader("home", p)}
    <main id="main" class="page-transition">
      ${renderPageHero({
        kicker: "Legal",
        title: content.title,
        text: content.text
      })}
      <section class="section">
        <div class="container narrow copy-stack">
          <p>${escapeHtml(p.medicalDisclaimer)}</p>
          <a class="button button-secondary" href="index.html">Voltar ao site</a>
        </div>
      </section>
    </main>
    ${renderFooter(p)}
    <script src="script.js" defer></script>
  </body>
</html>
`;
}
