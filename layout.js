async function loadIncludes() {
  const placeholders = document.querySelectorAll('[data-include]');

  await Promise.all(
    Array.from(placeholders, async (placeholder) => {
      const response = await fetch(placeholder.dataset.include);
      if (!response.ok) {
        throw new Error(`Failed to load ${placeholder.dataset.include}`);
      }

      placeholder.innerHTML = await response.text();
    })
  );
}

function applySharedLinkTargets() {
  const homePrefix = document.body.dataset.homePrefix || '';
  const brandHref = document.body.dataset.brandHref || (homePrefix ? homePrefix : '#top');

  document.querySelectorAll('[data-home-anchor]').forEach((link) => {
    const anchor = link.dataset.homeAnchor;
    link.setAttribute('href', `${homePrefix}#${anchor}`);
  });

  document.querySelectorAll('[data-brand-link]').forEach((link) => {
    link.setAttribute('href', brandHref);
  });
}

async function initLayout() {
  try {
    await loadIncludes();
    applySharedLinkTargets();
  } catch (error) {
    console.error('Shared layout failed to load.', error);
  }
}

initLayout();
