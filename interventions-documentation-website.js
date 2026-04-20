document.addEventListener("DOMContentLoaded", async () => {
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
const url = `https://api.are.na/v2/channels/${slug}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Are.na request failed: ${response.status}`);
  }

  return response.json();
}

function renderChannel(channel, container) {
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

  channel.contents.forEach((block) => {
    const element = renderBlock(block);

    if (element) {
      container.appendChild(element);
    }
  });
}

function renderBlock(block) {
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
