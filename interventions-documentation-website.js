const navItems = [
  { id: "info", label: "Info", href:"info.html"},
  { id: "questions", label: "Questions", href: "questions.html" },
  { id: "interventions", label: "Interventions", href: "interventions.html" }
];

function renderSiteHeader() {
  const header = document.getElementById("site-header");
  const currentPage = document.body.dataset.page;

  if (!header) {
    return;
  }

  const title = document.createElement("h1");
  const homeLink = document.createElement("a");
  homeLink.href = "index.html";
  homeLink.textContent = "Interventions for a Design Practice";

  title.appendChild(homeLink);

  const nav = document.createElement("nav");

  navItems.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;

    if (item.id === currentPage) {
      link.classList.add("active");
    }

    nav.appendChild(link);
  });

  header.appendChild(title);
  header.appendChild(nav);
}


document.addEventListener("DOMContentLoaded", async () => {

  renderSiteHeader();

  const container = document.getElementById("arena-content");
  const slug = document.body.dataset.arenaChannel;

  if (!container || !slug) {
    return;
  }

  container.innerHTML = "<p>Loading content...</p>";

  try {
    const channel = await fetchChannel(slug);
    renderChannel(channel, container);
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Content unavailable right now.</p>";
  }
});

async function fetchChannel(slug) {
  const url = `https://api.are.na/v2/channels/${slug}?t=${Date.now()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Are.na request failed: ${response.status}`);
  }

  return response.json();
}

function renderChannel(channel, container) {
  console.log("Loaded Are.na channel:", channel.title);
  console.table(
    (channel.contents || []).map((block, index) => ({
      index,
      class: block.class,
      title: block.title || "",
      content: block.content || "",
    }))
  );
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = channel.title;
  container.appendChild(title);

  if (!channel.contents || channel.contents.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No content yet.";
    container.appendChild(empty);
    return;
  }

  [...channel.contents].reverse().forEach((block) => {   
    const element = renderBlock(block);

    if (element) {
      container.appendChild(element);
    }
  });
}

function renderBlock(block) {
  console.log("Rendering block:", {
    class: block.class,
    title: block.title || "",
    content: block.content || "",
  });

  switch (block.class) {
    case "Text":
      return renderTextBlock(block);
    case "Image":
      return renderImageBlock(block);
    case "Media":
      return renderMediaBlock(block);
    default:
      return null;
  }
}

function renderTextBlock(block) {
  const section = document.createElement("section");
  section.className = "arena-text";

  const text = (block.content || "").trim();

  if (text === "01: Establish a ritual.") {
    const link = document.createElement("a");
    link.href = "intervention-01.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

  if (text === "Commission a piece of art or design.") {
    const link = document.createElement("a");
    link.href = "intervention-02.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Publish something that you've made.") {
    const link = document.createElement("a");
    link.href = "intervention-03.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Design something for a non-human.") {
    const link = document.createElement("a");
    link.href = "intervention-04.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Offer a creative service to someone else.") {
    const link = document.createElement("a");
    link.href = "intervention-05.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Make something with your hands.") {
    const link = document.createElement("a");
    link.href = "intervention-06.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Replicate something.") {
    const link = document.createElement("a");
    link.href = "intervention-07.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Take something apart. Put it back together.") {
    const link = document.createElement("a");
    link.href = "intervention-08.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Search for and acquire something that you like.") {
    const link = document.createElement("a");
    link.href = "intervention-09.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }

    if (text === "Make least three drafts of something.") {
    const link = document.createElement("a");
    link.href = "intervention-10.html";
    link.textContent = text;
    section.appendChild(link);
    return section;
  }
  
  const paragraph = document.createElement("div");
  paragraph.textContent = block.content || "";
  section.appendChild(paragraph);

  return section;
}

function renderImageBlock(block) {
  const figure = document.createElement("figure");
  figure.className = "arena-image";

  const img = document.createElement("img");
  img.src = block.image?.display?.url || block.image?.original?.url || "";
  img.alt = block.title || "";

  figure.appendChild(img);

  if (block.title) {
    const caption = document.createElement("figcaption");
    caption.textContent = block.title;
    figure.appendChild(caption);
  }

  return figure;
}

function renderMediaBlock(block) {
  const wrapper = document.createElement("section");
  wrapper.className = "arena-media";

  if (block.embed?.html) {
    wrapper.innerHTML = block.embed.html;
    return wrapper;
  }

  if (block.source?.url) {
    const link = document.createElement("a");
    link.href = block.source.url;
    link.textContent = block.title || "Open media";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    wrapper.appendChild(link);
    return wrapper;
  }

  return null;
}
