const channelRelationships = new Map();

const navItems = [
  { id: "info", label: "Info", href:"info.html"},
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
  const urlParams = new URLSearchParams(window.location.search);
  const slug = document.body.dataset.arenaChannel || urlParams.get("channel");

  if (slug) {
  document.body.dataset.channel = slug;
  } 

  if (!container || !slug) {
    return;
  }

  container.innerHTML = "<p>Loading content...</p>";

  try {
    const channel = await fetchChannel(slug);

if (document.body.dataset.page === "home") {
  container.classList.add("home-grid");
}

if (document.body.dataset.page === "intervention") {
  container.classList.add("intervention-grid");
}

await renderChannel(channel, container);

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Content unavailable right now.</p>";
  }
});

async function fetchChannel(slug) {
  const url = `https://api.are.na/v2/channels/${slug}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Are.na request failed: ${response.status}`);
  }

  return response.json();
}

async function getConnectedChannelSlug(block) {
  const fullChannel = await fetchChannel(block.slug);
  const connectedChannel = (fullChannel.contents || []).find((contentBlock) => {
    return contentBlock.class === "Channel";
  });
  return connectedChannel ? connectedChannel.slug : null;
}

async function renderChannel(channel, container) {
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

//  const title = document.createElement("h2");
//  title.textContent = channel.title;
//  container.appendChild(title);

  if (!channel.contents || channel.contents.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No content yet.";
    container.appendChild(empty);
    return;
  }

  if (document.body.dataset.page === "home") {
    await renderHomeChannelList(channel, container);
    return;
  }

  const sidebar = document.createElement("section");
  sidebar.className = "intervention-sidebar";

  const content = document.createElement("section");
  content.className = "intervention-content";

  [...channel.contents].reverse().forEach((block) => {
  const element = renderBlock(block);

  if (!element) {
    return;
  }

const isTitledText =
  block.class === "Text" && (block.title || "").trim().length > 0;

const isLink = block.class === "Link";

const isChannel = block.class === "Channel";

if (isTitledText || isLink || isChannel) {
  sidebar.appendChild(element);
} else {
  content.appendChild(element);
}

});

container.appendChild(sidebar);
container.appendChild(content);
}

async function renderHomeChannelList(channel, container) {
  const reversedBlocks = [...channel.contents].reverse();

  reversedBlocks.forEach((block) => {
    const element = renderBlock(block);

    if (element) {
      container.appendChild(element);
    }
  });

  addHomeInteractions(container);
}

function addHomeInteractions(container) {
  const questionLinks = container.querySelectorAll(".question-channel");

  questionLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();

      const questionSlug = link.dataset.channelSlug;

      if (!questionSlug) {
        return;
      }

      const questionChannel = await fetchChannel(questionSlug);
      const connectedIntervention = (questionChannel.contents || []).find((block) => {
        return block.class === "Channel";
      });

      if (!connectedIntervention) {
        return;
      }

      channelRelationships.set(questionSlug, connectedIntervention.slug);

      const allLinks = container.querySelectorAll(".channel-link");

      allLinks.forEach((channelLink) => {
        channelLink.classList.add("is-muted");
        channelLink.classList.remove("is-highlighted");
      });

      link.classList.remove("is-muted");
      link.classList.add("is-highlighted");

      const interventionLink = container.querySelector(
        `.intervention-channel[data-channel-slug="${connectedIntervention.slug}"]`
      );

      if (interventionLink) {
        interventionLink.classList.remove("is-muted");
        interventionLink.classList.add("is-highlighted");
      }
    });
  });
  const interventionLinks = container.querySelectorAll(".intervention-channel");

interventionLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    const interventionSlug = link.dataset.channelSlug;

    if (!interventionSlug) {
      return;
    }

    let connectedQuestionSlug = null;

    channelRelationships.forEach((savedInterventionSlug, savedQuestionSlug) => {
      if (savedInterventionSlug === interventionSlug) {
        connectedQuestionSlug = savedQuestionSlug;
      }
    });

    if (!connectedQuestionSlug) {
      return;
    }

    const allLinks = container.querySelectorAll(".channel-link");

    allLinks.forEach((channelLink) => {
      channelLink.classList.add("is-muted");
      channelLink.classList.remove("is-highlighted");
    });

    link.classList.remove("is-muted");
    link.classList.add("is-highlighted");

    const questionLink = container.querySelector(
      `.question-channel[data-channel-slug="${connectedQuestionSlug}"]`
    );

    if (questionLink) {
      questionLink.classList.remove("is-muted");
      questionLink.classList.add("is-highlighted");
    }
  });
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
  case "Link":
    return renderLinkBlock(block);
  case "Channel":
    return renderChannelBlock(block);
  default:
    return null;
}
}

function createDateCaption(block) {
  if (!block.connected_at) {
    return null;
  }

  const caption = document.createElement("figcaption");
  const date = new Date(block.connected_at);

  caption.textContent = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return caption;
}

function renderLinkBlock(block) {
  const section = document.createElement("section");
  section.className = "arena-link";

  const caption = createDateCaption(block);

  if (caption) {
    section.appendChild(caption);
  }

  const link = document.createElement("a");
  link.href = block.source?.url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const img = document.createElement("img");
  img.src =
    block.image?.display?.url ||
    block.image?.thumb?.url ||
    block.image?.original?.url ||
    "";

  img.alt = block.title || block.source?.url || "Link preview";

  link.appendChild(img);

  const linkContent = document.createElement("div");
  linkContent.className = "block-content";
  linkContent.appendChild(link);

  section.appendChild(linkContent);

  return section;
}

function renderTextBlock(block) {
  const section = document.createElement("section");
  section.className = "arena-text";

  const caption = createDateCaption(block);

  if (caption) {
    section.appendChild(caption);
  }

  const textContent = document.createElement("div");
  textContent.className = "block-content";

  if (block.title) {
    const title = document.createElement("h2");
    title.className = "block-title";
    title.textContent = block.title;
    textContent.appendChild(title);
}

  const paragraph = document.createElement("div");
  paragraph.textContent = block.content || "";
  textContent.appendChild(paragraph);

  section.appendChild(textContent);

  return section;
}

function renderChannelBlock(block) {
  const section = document.createElement("section");
  section.className = "arena-text arena-channel";

  const title = block.title || block.slug || "Untitled Channel";
  const cleanTitle = title.trim();

  const link = document.createElement("a");
  link.className = "channel-link";
  link.dataset.channelSlug = block.slug;
  link.dataset.channelTitle = cleanTitle;
  link.href = `intervention.html?channel=${block.slug}`;
  link.textContent = title;

  if (cleanTitle.endsWith("?")) {
    link.classList.add("question-channel");
  }

  if (cleanTitle.endsWith(".")) {
    link.classList.add("intervention-channel");
  }

  if (document.body.dataset.page === "home") {
    section.appendChild(link);
    return section;
  }

  const caption = createDateCaption(block);

  if (caption) {
    section.appendChild(caption);
  }

  const channelContent = document.createElement("div");
  channelContent.className = "block-content";

  channelContent.appendChild(link);
  section.appendChild(channelContent);

  return section;
}


function renderImageBlock(block) {
  const figure = document.createElement("figure");
  figure.className = "arena-image";

  const caption = createDateCaption(block);

  if (caption) {
    figure.appendChild(caption);
  }

  const img = document.createElement("img");
  img.src = block.image?.display?.url || block.image?.original?.url || "";
  img.alt = block.title || "";

  figure.appendChild(img);

  return figure;
}

function renderMediaBlock(block) {
  const wrapper = document.createElement("section");
  wrapper.className = "arena-media";

  const caption = createDateCaption(block);

  if (caption) {
    wrapper.appendChild(caption);
  }

if (block.embed?.html) {
  const embed = document.createElement("div");
  embed.className = "block-content";
  embed.innerHTML = block.embed.html;

  wrapper.appendChild(embed);
  return wrapper;
}

if (block.source?.url) {
  const link = document.createElement("a");
  link.href = block.source.url;
  link.textContent = block.title || "Open media";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const mediaContent = document.createElement("div");
  mediaContent.className = "block-content";
  mediaContent.appendChild(link);

  wrapper.appendChild(mediaContent);
  return wrapper;
}
}
