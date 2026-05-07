/*
  ╔═══════════════════════════════════════════════════════════════╗
  ║           PADARIA BOM PASTOR — script.js                      ║
  ╠═══════════════════════════════════════════════════════════════╣
  ║  Ajustado para:                                               ║
  ║  • campo digitável em TODOS os produtos                       ║
  ║  • mínimo de 50 nos pães de sal                               ║
  ║  • botão + e - funcionando                                    ║
  ║  • manter carrinho, WhatsApp e checkout                       ║
  ╚═══════════════════════════════════════════════════════════════╝
*/

const WHATSAPP_NUMERO = "552433266628";

const produtos = [
  {
    id: 1,
    nome: "Pão de Cachorro-Quente",
    desc: "Pacote com 30 pães. Ideal para festas e lanches.",
    preco: 9.50,
    cat: "paes",
    emoji: "🥖",
    unid: "pacote",
    foto: "cachorro.jpeg",
    fotoPos: "center"
  },
  {
    id: 2,
    nome: "Pão de Hambúrguer",
    desc: "Pacote com 6 unidades. Macio e saboroso.",
    preco: 6.00,
    cat: "paes",
    emoji: "🍔",
    unid: "pacote",
    foto: "hamburguer.jpeg",
    fotoPos: "center"
  },
  {
    id: 3,
    nome: "Pão Hot Dog",
    desc: "Pacote com 10 unidades.",
    preco: 9.50,
    cat: "paes",
    emoji: "🌭",
    unid: "pacote",
    foto: "hotdog.jpeg",
    fotoPos: "center"
  },
  {
    id: 4,
    nome: "Mini Pão de Sal",
    desc: "Pedido mínimo de 50 unidades. Ideal para eventos e cafés. Pedir com 24h de antecedência.",
    preco: 0.70,
    cat: "paes",
    emoji: "🥐",
    unid: "unidade",
    qtdMinima: 50,
    antecedencia: true,
    foto: "mini.png",
    fotoPos: "center"
  },
  {
    id: 5,
    nome: "Pão de Sal Tradicional",
    desc: "Pedido mínimo de 50 unidades. Fresquinho e crocante.",
    preco: 0.90,
    cat: "paes",
    emoji: "🍞",
    unid: "unidade",
    qtdMinima: 50,
    foto: "pao-sal.jpeg",
    fotoPos: "center"
  },
  {
    id: 10,
    nome: "Rosca Salgada",
    desc: "Rosca salgada recheada com presunto, queijo e maionese.",
    preco: 19.00,
    cat: "paes",
    emoji: "🥨",
    unid: "unidade",
    foto: "rosca.jpeg",
    fotoPos: "center"
  },
  {
    id: 6,
    nome: "Torta de Limão",
    desc: "Torta inteira sob encomenda.",
    preco: 100.00,
    cat: "bolos",
    emoji: "🎂",
    unid: "unidade",
    foto: "torta.jpeg",
    fotoPos: "center"
  },
  {
    id: 8,
    nome: "Pudim de Leite Condensado",
    desc: "Pudim inteiro sob encomenda.",
    preco: 40.00,
    cat: "doces",
    emoji: "🍮",
    unid: "unidade",
    antecedencia: true,
    foto: "pudim.jpeg",
    fotoPos: "center"
  },
  {
    id: 9,
    nome: "Pudim de Creme",
    desc: "Pudim inteiro sob encomenda.",
    preco: 40.00,
    cat: "doces",
    emoji: "🍮",
    unid: "unidade",
    antecedencia: true,
    foto: "pudim2.jpeg",
    fotoPos: "center"
  }
];

const catNomes = {
  paes: "🍞 Pães",
  bolos: "🎂 Bolos & Tortas",
  doces: "🍮 Doces & Confeitaria"
};

let carrinho = {};
let catAtual = "todos";

function fmt(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function buscarProduto(id) {
  return produtos.find(p => p.id == id);
}

function totalQuantidade() {
  return Object.values(carrinho).reduce((acc, q) => acc + q, 0);
}

function totalValor() {
  return Object.keys(carrinho).reduce((acc, id) => {
    const p = buscarProduto(id);
    return acc + (p ? p.preco * carrinho[id] : 0);
  }, 0);
}

function getLabelUnidade(unid) {
  return {
    pacote: "por pacote",
    unidade: "por unidade"
  }[unid] || unid;
}

function renderizarProdutos() {
  const grid = document.getElementById("produtosGrid");

  const lista = catAtual === "todos"
    ? produtos
    : produtos.filter(p => p.cat === catAtual);

  let html = "";

  if (catAtual === "todos") {
    const categorias = [...new Set(lista.map(p => p.cat))];

    categorias.forEach(cat => {
      const itens = lista.filter(p => p.cat === cat);

      html += `
        <h2 class="secao-titulo">
          ${catNomes[cat]}
        </h2>

        <div class="grid-produtos">
          ${itens.map(gerarCardHtml).join("")}
        </div>
      `;
    });
  } else {
    html = `
      <div class="grid-produtos">
        ${lista.map(gerarCardHtml).join("")}
      </div>
    `;
  }

  grid.innerHTML = html;
}

function gerarControleQuantidade(p, qty) {
  return `
    <div class="controle controle--manual">

      <button
        class="controle__btn"
        type="button"
        onclick="mudaQuantidade(${p.id}, -1)"
      >
        −
      </button>

      <input
        type="number"
        class="controle__input"
        id="qty${p.id}"
        value="${qty}"
        min="0"
        inputmode="numeric"
        oninput="alterarQuantidadeManual(${p.id}, this.value)"
        onblur="validarQuantidadeManual(${p.id})"
      />

      <button
        class="controle__btn controle__btn--add"
        type="button"
        onclick="mudaQuantidade(${p.id}, 1)"
      >
        +
      </button>

    </div>
  `;
}

function gerarCardHtml(p) {
  const qty = carrinho[p.id] || 0;

  const thumbHtml = p.foto
    ? `
      <img
        src="${p.foto}"
        alt="${p.nome}"
        class="card__foto"
      />
    `
    : `<span class="card__emoji">${p.emoji}</span>`;

  return `
    <div class="card">

      <div class="card__thumb">
        ${thumbHtml}
      </div>

      <div class="card__body">

        <div class="card__nome">
          ${p.nome}
        </div>

        <div class="card__desc">
          ${p.desc}
        </div>

        ${
          p.qtdMinima
            ? `
              <div class="card__desc card__desc--minimo">
                Pedido mínimo: ${p.qtdMinima} unidades
              </div>
            `
            : ""
        }

        <div class="card__rodape">

          <div class="card__preco-wrap">
            <span class="card__unid">
              ${getLabelUnidade(p.unid)}
            </span>

            <span class="card__preco">
              ${fmt(p.preco)}
            </span>
          </div>

        </div>

        <div class="card__acoes">
          ${gerarControleQuantidade(p, qty)}
        </div>

      </div>

    </div>
  `;
}

function atualizarQuantidadeVisual(id) {
  const qtyEl = document.getElementById(`qty${id}`);

  if (!qtyEl) return;

  qtyEl.value = carrinho[id] || 0;
}

function alterarQuantidadeManual(id, valor) {
  const numeroLimpo = String(valor).replace(/\D/g, "");

  if (numeroLimpo === "") {
    delete carrinho[id];
    atualizarUI();
    return;
  }

  const quantidade = parseInt(numeroLimpo, 10);

  if (isNaN(quantidade) || quantidade <= 0) {
    delete carrinho[id];
    atualizarUI();
    return;
  }

  carrinho[id] = quantidade;

  atualizarUI();
}

function validarQuantidadeManual(id) {
  const produto = buscarProduto(id);

  if (!produto) return;

  const qtyEl = document.getElementById(`qty${id}`);

  if (!qtyEl) return;

  const valor = parseInt(qtyEl.value, 10);

  if (isNaN(valor) || valor <= 0) {
    delete carrinho[id];
    atualizarQuantidadeVisual(id);
    atualizarUI();
    return;
  }

  if (produto.qtdMinima && valor < produto.qtdMinima) {
    carrinho[id] = produto.qtdMinima;

    atualizarQuantidadeVisual(id);
    atualizarUI();

    mostrarToast(
      `${produto.nome}: mínimo ${produto.qtdMinima} unidades`
    );

    return;
  }

  carrinho[id] = valor;

  atualizarQuantidadeVisual(id);
  atualizarUI();
}

function mudaQuantidade(id, delta) {
  const produto = buscarProduto(id);

  if (!produto) return;

  const qtdAtual = carrinho[id] || 0;
  const qtdMinima = produto.qtdMinima || 1;

  let novaQtd = qtdAtual;

  if (delta > 0) {
    novaQtd = qtdAtual === 0
      ? qtdMinima
      : qtdAtual + 1;
  }

  if (delta < 0) {
    if (produto.qtdMinima && qtdAtual <= qtdMinima) {
      novaQtd = 0;
    } else {
      novaQtd = Math.max(0, qtdAtual - 1);
    }
  }

  if (novaQtd > 0) {
    carrinho[id] = novaQtd;
  } else {
    delete carrinho[id];
  }

  atualizarQuantidadeVisual(id);
  atualizarUI();
}

function removerItem(id) {
  delete carrinho[id];

  atualizarQuantidadeVisual(id);
  atualizarUI();
}

function atualizarUI() {
  const qty = totalQuantidade();
  const val = totalValor();

  document.getElementById("headerBadge").textContent = qty;

  const floatBar = document.getElementById("floatBar");

  document.getElementById("fbQtd").textContent =
    `${qty} ${qty === 1 ? "item" : "itens"}`;

  document.getElementById("fbTotal").textContent = fmt(val);

  floatBar.classList.toggle("visivel", qty > 0);

  const body = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");

  if (qty === 0) {
    body.innerHTML = `
      <div class="cart-vazio">
        <span class="cart-vazio__emoji">🥐</span>
        <p>Seu pedido está vazio</p>
      </div>
    `;

    footer.style.display = "none";

  } else {

    footer.style.display = "block";

    document.getElementById("cartTotal").textContent =
      fmt(val);

    body.innerHTML = Object.keys(carrinho).map(id => {

      const p = buscarProduto(id);

      if (!p) return "";

      const quantidade = carrinho[id];
      const subtotal = p.preco * quantidade;

      return `
        <div class="cart-item">

          <span class="cart-item__emoji">
            ${p.emoji}
          </span>

          <div class="cart-item__info">

            <div class="cart-item__nome">
              ${p.nome}
            </div>

            <div class="cart-item__sub">
              ${quantidade}x × ${fmt(p.preco)}
            </div>

          </div>

          <span class="cart-item__preco">
            ${fmt(subtotal)}
          </span>

          <button
            class="cart-item__remover"
            type="button"
            onclick="removerItem(${id})"
          >
            🗑
          </button>

        </div>
      `;

    }).join("");
  }
}

function abrirCarrinho() {
  document
    .getElementById("cartPanel")
    .classList.add("aberto");

  document
    .getElementById("overlay")
    .classList.add("aberto");

  document.body.style.overflow = "hidden";
}

function fecharCarrinho() {
  document
    .getElementById("cartPanel")
    .classList.remove("aberto");

  document
    .getElementById("overlay")
    .classList.remove("aberto");

  document.body.style.overflow = "";
}

function mostrarToast(mensagem) {
  const el = document.getElementById("toast");

  el.textContent = mensagem;

  el.classList.add("show");

  clearTimeout(window._toastTimer);

  window._toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 1800);
}

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".cat-btn")
      .forEach(b => b.classList.remove("ativa"));

    btn.classList.add("ativa");

    catAtual = btn.dataset.cat;

    renderizarProdutos();
  });
});

renderizarProdutos();
atualizarUI();