import { profile, type Profile } from "../data/profile.ts";

const navItems = [
  ["Sobre", "#sobre"],
  ["Áreas", "#areas"],
  ["Formação", "#formacao"],
  ["Livro", "#livro"],
  ["Publicações", "#publicacoes"],
  ["FAQ", "#faq"]
] as const;

const legalPages = {
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
} as const;

type MediaTab = Profile["mediaTabs"][number];
type MediaItem = MediaTab["items"][number];

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

function externalAttrs(url: string): string {
  return isValidUrl(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
}

function externalLink(url: string | undefined, label: string, className = ""): string {
  if (!isValidUrl(url)) {
    return "";
  }

  return `<a class="${className}" href="${escapeHtml(url)}"${externalAttrs(url)}>${escapeHtml(label)}</a>`;
}

function sectionHeading(kicker: string, title: string, text?: string): string {
  return `
    <div class="section-heading reveal">
      <p class="kicker">${escapeHtml(kicker)}</p>
      <h2>${escapeHtml(title)}</h2>
      ${text ? `<p>${escapeHtml(text)}</p>` : ""}
    </div>
  `;
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

  const graph = [
    {
      "@type": "Person",
      name: p.shortName,
      honorificPrefix: "Dra.",
      jobTitle: "Médica especialista em Endocrinologia, Diabetes e Metabolismo",
      worksFor: {
        "@type": "MedicalOrganization",
        name: p.mainUnit,
        address: {
          "@type": "PostalAddress",
          addressLocality: p.location,
          addressCountry: "PT"
        }
      },
      sameAs
    },
    {
      "@type": "Physician",
      name: p.name,
      medicalSpecialty: "Endocrinology",
      hospitalAffiliation: {
        "@type": "Hospital",
        name: p.mainUnit
      },
      url: p.links.cuf,
      sameAs
    },
    {
      "@type": "MedicalSpecialty",
      name: "Endocrinologia"
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
  ];

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": graph
    },
    null,
    2
  );
}

function renderHead(p: Profile): string {
  const canonical = isValidUrl(p.seo.canonical)
    ? `<link rel="canonical" href="${escapeHtml(p.seo.canonical)}">`
    : "<!-- VALIDAR ANTES DE PUBLICAR: inserir domínio final para canonical. -->";

  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(p.seo.title)}</title>
    <meta name="description" content="${escapeHtml(p.seo.description)}">
    <meta name="keywords" content="${escapeHtml(p.seo.keywords.join(", "))}">
    ${canonical}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(p.seo.ogTitle)}">
    <meta property="og:description" content="${escapeHtml(p.seo.ogDescription)}">
    <meta property="og:image" content="/${escapeHtml(p.images.og)}">
    <meta property="og:locale" content="pt_PT">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(p.seo.ogTitle)}">
    <meta name="twitter:description" content="${escapeHtml(p.seo.ogDescription)}">
    <meta name="theme-color" content="#f7f5f0">
    <link rel="preload" as="image" href="${escapeHtml(p.images.portrait)}">
    <script>document.documentElement.classList.add("js");</script>
    <link rel="stylesheet" href="styles.css">
    <script type="application/ld+json">${renderJsonLd(p)}</script>
  `;
}

function renderTopBar(p: Profile): string {
  return `
    <div class="topbar">
      <div class="container topbar-inner">
        <span>Endocrinologia · Diabetes · Metabolismo</span>
        <span>Marcação através da CUF</span>
      </div>
    </div>
  `;
}

function homeHref(hash: string, homePrefix = ""): string {
  return `${homePrefix}${hash}`;
}

function renderHeader(p: Profile, homePrefix = ""): string {
  return `
    <header class="site-header" data-header>
      <div class="container header-inner">
        <a class="brand" href="${homeHref("#hero", homePrefix)}" aria-label="${escapeHtml(p.name)}">
          <span>${escapeHtml(p.name)}</span>
          <small>${escapeHtml(p.specialty)}</small>
        </a>
        <nav class="site-nav" id="site-nav" aria-label="Navegação principal">
          ${navItems.map(([label, href]) => `<a href="${homeHref(href, homePrefix)}">${escapeHtml(label)}</a>`).join("")}
        </nav>
        <div class="header-actions">
          ${externalLink(p.links.appointment, "Marcar consulta", "button button-primary button-small")}
          <button class="nav-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="site-nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderHero(p: Profile): string {
  return `
    <section class="hero" id="hero">
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <p class="kicker">${escapeHtml(p.eyebrow)}</p>
          <h1>${escapeHtml(p.name)}</h1>
          <p class="hero-tagline">${escapeHtml(p.tagline)}</p>
          <p class="hero-intro">${escapeHtml(p.intro)}</p>
          <p class="hero-support">${escapeHtml(p.supportingText)}</p>
          <div class="badge-row" aria-label="Áreas de diferenciação">
            ${p.heroBadges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}
          </div>
          <div class="hero-actions">
            ${externalLink(p.links.appointment, "Marcar consulta na CUF", "button button-primary")}
            <a class="button button-secondary" href="#formacao">Conhecer percurso clínico</a>
          </div>
        </div>
        <div class="hero-visual reveal">
          <figure class="portrait-frame">
            <img src="${escapeHtml(p.images.portrait)}" alt="Retrato profissional da Dra. Inês Sapinho" width="600" height="600">
          </figure>
          <aside class="appointment-panel" aria-label="Marcação na CUF">
            <p>Consulta presencial e teleconsulta</p>
            <strong>${escapeHtml(p.mainUnit)}</strong>
            <span>Disponibilidade atualizada no site da CUF</span>
            ${externalLink(p.links.cuf, "Ver disponibilidade CUF", "text-link")}
          </aside>
        </div>
      </div>
    </section>
  `;
}

function renderAbout(p: Profile): string {
  return `
    <section class="section" id="sobre">
      <div class="container about-grid">
        <div class="about-copy reveal">
          ${sectionHeading("Perfil clínico", "Sobre")}
          ${p.about.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
        </div>
        <div class="quick-facts reveal">
          <figure>
            <img src="${escapeHtml(p.images.editorial)}" alt="Dra. Inês Sapinho em retrato editorial" loading="lazy" width="1580" height="1496">
          </figure>
          <div class="fact-list" aria-label="Dados rápidos">
            <h3>Dados rápidos</h3>
            ${p.quickFacts
              .map(
                ([label, value]) => `
                  <dl>
                    <dt>${escapeHtml(label)}</dt>
                    <dd>${escapeHtml(value)}</dd>
                  </dl>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderMission(p: Profile): string {
  return `
    <section class="section section-muted" id="missao">
      <div class="container">
        ${sectionHeading("Abordagem", "Missão clínica", p.mission.intro)}
        <div class="three-grid">
          ${p.mission.cards
            .map(
              (card, index) => `
                <article class="principle-card reveal">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <h3>${escapeHtml(card.title)}</h3>
                  <p>${escapeHtml(card.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderWhenToBook(p: Profile): string {
  return `
    <section class="section" id="quando-marcar">
      <div class="container">
        ${sectionHeading(
          "Consulta",
          "Quando marcar uma consulta de Endocrinologia?",
          "Pode fazer sentido procurar avaliação em Endocrinologia quando existem sintomas, análises ou diagnósticos relacionados com alterações hormonais e metabólicas."
        )}
        <div class="cards-grid cards-grid-3">
          ${p.whenToBook
            .map(
              (item) => `
                <article class="soft-card reveal">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
        <div class="note-row reveal">
          <p>Esta informação é geral e não substitui uma avaliação médica. A necessidade de consulta deve ser enquadrada caso a caso.</p>
          ${externalLink(p.links.cuf, "Ver disponibilidade na CUF", "button button-secondary")}
        </div>
      </div>
    </section>
  `;
}

function renderEndocrinology(p: Profile): string {
  return `
    <section class="section section-split" id="endocrinologia">
      <div class="container split-grid">
        <div class="split-copy reveal">
          <p class="kicker">Especialidade</p>
          <h2>O que é a Endocrinologia?</h2>
          <p>A Endocrinologia é a especialidade médica dedicada ao estudo, diagnóstico e tratamento das doenças do sistema endócrino — o conjunto de glândulas responsáveis pela produção de hormonas. As hormonas regulam funções essenciais como metabolismo, glicose no sangue, peso, crescimento, reprodução, ciclo menstrual, saúde óssea, resposta ao stress e equilíbrio energético.</p>
          <p>Por envolver sistemas com impacto em múltiplos órgãos, a Endocrinologia cruza-se frequentemente com outras áreas médicas, como Medicina Interna, Ginecologia e Obstetrícia, Cardiologia, Cirurgia, Neurocirurgia, Imagiologia, Medicina Nuclear, Nutrição e Enfermagem.</p>
          <p class="medical-note">Esta informação tem caráter geral e não substitui avaliação médica individualizada.</p>
        </div>
        <div class="topic-list reveal" aria-label="Áreas relacionadas com Endocrinologia">
          ${p.endocrinologyCards.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderAreas(p: Profile): string {
  return `
    <section class="section" id="areas">
      <div class="container">
        ${sectionHeading(
          "Prática clínica",
          "Áreas de atuação",
          "A consulta de Endocrinologia permite avaliar alterações hormonais e metabólicas com impacto na saúde geral, no peso, na glicose, na função tiroideia, na saúde da mulher e noutras dimensões clínicas."
        )}
        <div class="cards-grid cards-grid-3">
          ${p.areas
            .map(
              (area) => `
                <article class="area-card reveal"${area.id ? ` id="${escapeHtml(area.id)}"` : ""}>
                  <h3>${escapeHtml(area.title)}</h3>
                  <p>${escapeHtml(area.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
        <p class="medical-note reveal">A linguagem desta secção é prudente por desenho: não promete cura nem resultados e deve ser enquadrada numa avaliação médica.</p>
      </div>
    </section>
  `;
}

function renderEducation(p: Profile): string {
  return `
    <section class="section section-muted" id="formacao">
      <div class="container">
        ${sectionHeading("Percurso", "Formação académica e percurso profissional")}
        <div class="timeline">
          ${p.education
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
            .join("")}
        </div>
        <p class="medical-note reveal">Datas, cargos atuais e formulações finais devem ser confirmados com a médica antes da publicação.</p>
      </div>
    </section>
  `;
}

function renderSocieties(p: Profile): string {
  return `
    <section class="section" id="sociedades">
      <div class="container narrow">
        ${sectionHeading(
          "Atualização científica",
          "Sociedades científicas e grupos de estudo",
          "A participação em sociedades científicas e grupos de estudo contribui para a atualização contínua e para o trabalho colaborativo em áreas específicas da Endocrinologia."
        )}
        <div class="society-list">
          ${p.societies
            .map(
              (item) => `
                <article class="society-item reveal">
                  <span>${escapeHtml(item.label)}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderBook(p: Profile): string {
  const details = [
    ["Autora", p.book.author],
    ["Editora", p.book.publisher],
    ["Lançamento", p.book.releaseDate],
    ["Idioma", p.book.language],
    ["ISBN", p.book.isbn],
    ["Páginas", String(p.book.pages)],
    ["Dimensões", p.book.dimensions],
    ["Tema", p.book.theme]
  ];

  return `
    <section class="section book-section" id="livro">
      <div class="container book-grid">
        <figure class="book-cover reveal">
          <img src="${escapeHtml(p.book.coverImage)}" alt="Capa do livro Os Segredos da Sua Tiroide" loading="lazy" width="522" height="792">
        </figure>
        <div class="book-copy reveal">
          <p class="kicker">Livro</p>
          <h2>${escapeHtml(p.book.title)}</h2>
          <p class="book-subtitle">${escapeHtml(p.book.subtitle)}</p>
          <p>${escapeHtml(p.book.description)}</p>
          <div class="book-details" aria-label="Detalhes do livro">
            ${details
              .map(
                ([label, value]) => `
                  <dl>
                    <dt>${escapeHtml(label)}</dt>
                    <dd>${escapeHtml(value)}</dd>
                  </dl>
                `
              )
              .join("")}
          </div>
          <div class="button-row">
            ${externalLink(p.book.purchaseUrl, "Comprar na WOOK", "button button-primary")}
            <a class="button button-secondary" href="#tiroide">Saber mais sobre tiroide</a>
          </div>
          <p class="medical-note">Usar capa oficial apenas se a médica ou editora fornecer autorização ou imagem validada.</p>
        </div>
      </div>
    </section>
  `;
}

function renderClinicalActivity(p: Profile): string {
  return `
    <section class="section" id="atividade">
      <div class="container">
        ${sectionHeading(
          "CUF",
          "Atividade assistencial",
          "A Dra. Inês Sapinho desenvolve atividade clínica no Hospital CUF Descobertas — Lisboa, com marcação presencial e teleconsulta através dos canais oficiais CUF."
        )}
        <div class="clinical-grid">
          ${p.clinicalActivity
            .map(
              (item) => `
                <article class="clinical-card reveal">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.text)}</p>
                  ${externalLink(p.links.cuf, item.cta, "text-link")}
                </article>
              `
            )
            .join("")}
          <article class="unit-card reveal">
            <h3>Unidades e centros CUF associados</h3>
            <ul>
              ${p.cufUnits.map((unit) => `<li>${escapeHtml(unit)}</li>`).join("")}
            </ul>
          </article>
        </div>
        <p class="medical-note reveal">As marcações, horários, acordos, disponibilidade e condições de teleconsulta devem ser sempre confirmados no site oficial da CUF.</p>
      </div>
    </section>
  `;
}

function renderPublications(p: Profile): string {
  return `
    <section class="section section-muted" id="publicacoes">
      <div class="container">
        ${sectionHeading(
          "Ciência",
          "Publicações científicas",
          "A atividade científica integra o percurso clínico e académico da Dra. Inês Sapinho, com participação em trabalhos apresentados em congressos e publicados em revistas nacionais e internacionais."
        )}
        <div class="publication-list">
          ${p.publications
            .map(
              (item, index) => `
                <article class="publication-item reveal"${index > 3 ? " data-extra-publication hidden" : ""}>
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
              `
            )
            .join("")}
        </div>
        <div class="center-action">
          <button class="button button-secondary" type="button" data-publication-toggle>Ver mais publicações</button>
        </div>
        <p class="medical-note reveal">Lista inicial de publicações a confirmar com a médica. Idealmente, cada publicação deve apontar para DOI, PubMed, revista científica ou PDF oficial.</p>
      </div>
    </section>
  `;
}

function renderMediaItem(item: MediaItem): string {
  return `
    <article class="media-card reveal">
      <span class="label">${escapeHtml(item.meta)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="media-actions">
        ${externalLink(item.url, "Ver conteúdo", "text-link")}
        ${"secondaryUrl" in item && item.secondaryUrl ? externalLink(item.secondaryUrl, "Spotify", "text-link subtle-link") : ""}
      </div>
    </article>
  `;
}

function renderMedia(p: Profile): string {
  return `
    <section class="section" id="media">
      <div class="container">
        ${sectionHeading(
          "Literacia em saúde",
          "Divulgação médica e literacia em saúde",
          "Para além da atividade clínica e científica, a Dra. Inês Sapinho tem participado em conteúdos de divulgação médica sobre Endocrinologia, tiroide, obesidade, menopausa e saúde metabólica."
        )}
        <div class="tabs reveal" data-tabs>
          <div class="tab-list" role="tablist" aria-label="Conteúdos de divulgação médica">
            ${p.mediaTabs
              .map(
                (tab, index) => `
                  <button type="button" role="tab" aria-selected="${index === 0}" aria-controls="panel-${escapeHtml(tab.id)}" id="tab-${escapeHtml(tab.id)}" data-tab="${escapeHtml(tab.id)}">
                    ${escapeHtml(tab.label)}
                  </button>
                `
              )
              .join("")}
          </div>
          ${p.mediaTabs
            .map(
              (tab, index) => `
                <div class="tab-panel" id="panel-${escapeHtml(tab.id)}" role="tabpanel" aria-labelledby="tab-${escapeHtml(tab.id)}"${index === 0 ? "" : " hidden"}>
                  <div class="cards-grid cards-grid-3">
                    ${tab.items.map(renderMediaItem).join("")}
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
        <p class="medical-note reveal">Links e datas devem ser confirmados antes da publicação. Conteúdos sem ligação oficial devem ser publicados apenas depois de confirmação.</p>
      </div>
    </section>
  `;
}

function renderHighlights(p: Profile): string {
  return `
    <section class="section highlights-section" id="destaques">
      <div class="container">
        ${sectionHeading("Destaques", "Destaques")}
        <div class="highlight-grid">
          ${p.highlights
            .map(
              (item) => `
                <article class="highlight-item reveal">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.text)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFaq(p: Profile): string {
  return `
    <section class="section" id="faq">
      <div class="container narrow">
        ${sectionHeading("FAQ", "Perguntas frequentes")}
        <div class="faq-list">
          ${p.faq
            .map(
              (item, index) => `
                <article class="faq-item reveal">
                  <button type="button" aria-expanded="${index === 0}" aria-controls="faq-${index}">
                    <span>${escapeHtml(item.question)}</span>
                    <span aria-hidden="true"></span>
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
  `;
}

function renderAppointment(p: Profile): string {
  return `
    <section class="section appointment-section" id="marcacao">
      <div class="container appointment-box reveal">
        <div>
          <p class="kicker">Marcação de consulta</p>
          <h2>Marcação de consulta</h2>
          <p>As marcações devem ser realizadas através dos canais oficiais da CUF, onde é possível consultar disponibilidade, unidades, acordos, horários e opções de teleconsulta.</p>
          <p class="medical-note">A disponibilidade, horários, acordos e condições de marcação podem variar e devem ser confirmados diretamente no site oficial da CUF.</p>
        </div>
        <div class="appointment-actions">
          ${externalLink(p.links.cuf, "Marcar consulta na CUF", "button button-primary")}
          ${externalLink(p.links.cuf, "Marcar teleconsulta", "button button-secondary")}
          ${externalLink(p.links.cuf, "Ver perfil CUF", "text-link")}
        </div>
      </div>
    </section>
  `;
}

function renderProfessionalLinks(p: Profile): string {
  return `
    <section class="section" id="links">
      <div class="container">
        ${sectionHeading(
          "Canais profissionais",
          "Links profissionais",
          "Acompanhe conteúdos de divulgação médica, atividade científica e informação institucional através dos canais profissionais da Dra. Inês Sapinho."
        )}
        <div class="link-grid">
          ${p.professionalLinks
            .filter((item) => isValidUrl(item.url))
            .map(
              (item) => `
                <article class="professional-link reveal">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.text)}</p>
                  ${externalLink(item.url, "Abrir ligação", "text-link")}
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFooter(p: Profile, homePrefix = ""): string {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h2>${escapeHtml(p.name)}</h2>
          <p>${escapeHtml(p.specialty)}</p>
          <p class="footer-note">${escapeHtml(p.medicalDisclaimer)}</p>
        </div>
        <nav aria-label="Navegação de rodapé">
          ${navItems.map(([label, href]) => `<a href="${homeHref(href, homePrefix)}">${escapeHtml(label)}</a>`).join("")}
          <a href="${homeHref("#marcacao", homePrefix)}">Marcar consulta</a>
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

function renderBody(p: Profile): string {
  return `
    <a class="skip-link" href="#main">Saltar para o conteúdo</a>
    ${renderTopBar(p)}
    ${renderHeader(p)}
    <main id="main">
      ${renderHero(p)}
      ${renderAbout(p)}
      ${renderMission(p)}
      ${renderWhenToBook(p)}
      ${renderEndocrinology(p)}
      ${renderAreas(p)}
      ${renderEducation(p)}
      ${renderSocieties(p)}
      ${renderBook(p)}
      ${renderClinicalActivity(p)}
      ${renderPublications(p)}
      ${renderMedia(p)}
      ${renderHighlights(p)}
      ${renderFaq(p)}
      ${renderAppointment(p)}
      ${renderProfessionalLinks(p)}
    </main>
    ${renderFooter(p)}
    <script src="script.js" defer></script>
  `;
}

export function renderPage(p: Profile = profile): string {
  return `<!doctype html>
<html lang="pt-PT">
  <head>
    ${renderHead(p)}
  </head>
  <body>
    ${renderBody(p)}
  </body>
</html>
`;
}

export function renderLegalPage(page: keyof typeof legalPages, p: Profile = profile): string {
  const content = legalPages[page];
  return `<!doctype html>
<html lang="pt-PT">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(content.title)} — ${escapeHtml(p.name)}</title>
    <meta name="robots" content="noindex">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#main">Saltar para o conteúdo</a>
    ${renderTopBar(p)}
    ${renderHeader(p, "index.html")}
    <main id="main" class="legal-main">
      <section class="section">
        <div class="container narrow legal-page">
          <p class="kicker">Legal</p>
          <h1>${escapeHtml(content.title)}</h1>
          <p>${escapeHtml(content.text)}</p>
          <p>${escapeHtml(p.medicalDisclaimer)}</p>
          <a class="button button-secondary" href="index.html">Voltar ao site</a>
        </div>
      </section>
    </main>
    ${renderFooter(p, "index.html")}
    <script src="script.js" defer></script>
  </body>
</html>
`;
}
