export function renderShopGrid({
  container,
  skins,
  ownedSkinIds,
  selectedSkinId,
  balance,
  onSelect,
  onBuy,
}) {
  container.replaceChildren();

  const owned = new Set(ownedSkinIds);

  for (const skin of skins) {
    const isOwned = owned.has(skin.id);
    const isSelected = selectedSkinId === skin.id;

    const card = document.createElement("article");
    card.className = "shop-card";
    card.classList.toggle("shop-card--owned", isOwned);
    card.classList.toggle("shop-card--selected", isSelected);

    const visual = document.createElement("div");
    visual.className = "shop-card__visual";
    visual.style.setProperty("--shop-primary", skin.primaryColor);
    visual.style.setProperty("--shop-secondary", skin.secondaryColor);

    const content = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = skin.name;

    const description = document.createElement("p");
    description.textContent = skin.description;

    const status = document.createElement("span");
    status.className = "shop-card__status";

    if (isSelected) {
      status.textContent = "Em uso";
    } else if (isOwned) {
      status.textContent = "Desbloqueada";
    } else {
      status.textContent = `🪙 ${skin.price}`;
    }

    const action = document.createElement("button");
    action.type = "button";
    action.className = "shop-card__button";

    if (isOwned) {
      action.textContent = isSelected ? "Selecionada" : "Usar skin";
      action.disabled = isSelected;
      action.addEventListener("click", () => onSelect(skin));
    } else {
      action.textContent =
        balance >= skin.price ? "Comprar" : "Moedas insuficientes";
      action.disabled = balance < skin.price;
      action.addEventListener("click", () => onBuy(skin));
    }

    content.append(title, description, status, action);
    card.append(visual, content);
    container.append(card);
  }
}
