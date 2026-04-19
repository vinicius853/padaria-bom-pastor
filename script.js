/*
  ╔═══════════════════════════════════════════════════════════════╗
  ║           PADARIA BOM PASTOR — script.js                      ║
  ╠═══════════════════════════════════════════════════════════════╣
  ║  Este arquivo controla toda a lógica do site:                 ║
  ║  • Listagem e filtragem de produtos                           ║
  ║  • Carrinho (adicionar, remover, calcular total)              ║
  ║  • Modal de checkout com formulário                           ║
  ║  • Geração da mensagem e envio para o WhatsApp                ║
  ║  • Horários de atendimento dinâmicos                          ║
  ╚═══════════════════════════════════════════════════════════════╝
*/


/* ═══════════════════════════════════════════════════════════════
   ① CONFIGURAÇÃO — altere aqui sem precisar mexer no resto
   ═══════════════════════════════════════════════════════════════ */

/**
 * Número do WhatsApp que receberá os pedidos.
 * Formato: código do país (55) + DDD + número, sem espaços ou símbolos.
 * → Para mudar: substitua apenas os dígitos dentro das aspas.
 */
const WHATSAPP_NUMERO = "552433266628";

/**
 * CARDÁPIO — lista de produtos disponíveis para encomenda.
 *
 * Cada produto é um objeto com os campos:
 *
 *   id           → número único; nunca repita (usado como chave interna)
 *   nome         → texto exibido no card e na mensagem do WhatsApp
 *   desc         → descrição curta exibida embaixo do nome no card
 *   preco        → valor em reais (número; use ponto como decimal: 9.50)
 *   cat          → categoria: "paes" | "bolos" | "doces"
 *                  → Para nova categoria: adicione aqui e crie botão no index.html
 *   unid         → unidade de venda: "pacote" | "cento" | "unidade" | "kg"
 *   antecedencia → (opcional) true = exibe badge "24h" no card
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  FOTO DO PRODUTO — como usar:                           │
 *   │                                                         │
 *   │  foto: "fotos/nome-do-arquivo.jpg"                      │
 *   │    → Coloque a imagem na pasta "fotos/" ao lado do site │
 *   │    → Formatos aceitos: .jpg .jpeg .png .webp            │
 *   │    → Tamanho ideal: 400x300px ou maior (16:9 ou 4:3)   │
 *   │                                                         │
 *   │  foto: "https://site.com/imagem.jpg"                    │
 *   │    → Também funciona com link direto de imagem online   │
 *   │                                                         │
 *   │  Se NÃO colocar foto (ou deixar foto: ""), o emoji      │
 *   │  será exibido automaticamente como substituto.          │
 *   └─────────────────────────────────────────────────────────┘
 *
 *   emoji → usado no carrinho lateral e como substituto se não houver foto
 */
const produtos = [

  /* ── PÃES ──────────────────────────────────────────────────
     Para adicionar foto: coloque o arquivo na pasta "fotos/"
     e preencha: foto: "fotos/nome-do-arquivo.jpg"
  ─────────────────────────────────────────────────────────── */
  {
    id: 1,
    nome: "Pão de Cachorro-Quente",
    desc: "Pacote com 30 pães. Ideal para festas e lanches.",
    preco: 9.50,
    cat: "paes",
    emoji: "🥖",
    unid: "pacote",
    foto: "cachorro.jpeg"
  },
  {
    id: 2,
    nome: "Pão de Hambúrguer",
    desc: "Pacote com 6 unidades. Macio e saboroso.",
    preco: 6.00,
    cat: "paes",
    emoji: "🍔",
    unid: "pacote",
    foto: "hamburguer.jpeg"
  },
  {
    id: 3,
    nome: "Pão Hot Dog",
    desc: "Pacote com 10 unidades.",
    preco: 9.50,
    cat: "paes",
    emoji: "🌭",
    unid: "pacote",
    foto: "hotdog.jpeg"
  },
  {
    id: 4,
    nome: "Mini Pão de Sal",
    desc: "Venda por cento. Ideal para eventos e cafés. Pedir com 24h de antecedência.",
    preco: 70.00,
    cat: "paes",
    emoji: "🥐",
    unid: "cento",
    antecedencia: true,
    foto: "mini.png"
  },
  {
    id: 5,
    nome: "Pão de Sal Tradicional",
    desc: "Venda por cento. Fresquinho e crocante.",
    preco: 90.00,
    cat: "paes",
    emoji: "🍞",
    unid: "cento",
    foto: "pao-sal.jpeg"
  },

  /* ── BOLOS ──────────────────────────────────────────────── */
  {
    id: 6,
    nome: "torta de limão",
    desc: "torta inteira sob encomenda. Cobertura cremosa de musse de limão.",
    preco: 100.00,
    cat: "bolos",
    emoji: "🎂",
    unid: "unidade",
    foto: "torta.jpeg"
  },

  /* ── DOCES ──────────────────────────────────────────────── */
  {
    id: 8,
    nome: "Pudim de leite condensado",
    desc: "Pudim inteiro sob encomenda. Pedir com 24h de antecedência.",
    preco: 40.00,
    cat: "doces",
    emoji: "🍮",
    unid: "unidade",
    antecedencia: true,
    foto: "pudim.jpeg"
  },
  {
    id: 9,
    nome: "Pudim de creme",
    desc: "Pudim inteiro sob encomenda. Pedir com 24h de antecedência.",
    preco: 40.00,
    cat: "doces",
    emoji: "🍮",
    unid: "unidade",
    antecedencia: true,
    foto: "pudim2.jpeg"
  }
];

/* Nomes de exibição para cada categoria — aparece como título de seção */
const catNomes = {
  paes:  "🍞 Pães",
  bolos: "🎂 Bolos & Tortas",
  doces: "🍮 Doces & Confeitaria"
  /* → Para nova categoria: adicione aqui, ex.: salgados: "🥐 Salgados" */
};


/* ═══════════════════════════════════════════════════════════════
   ② ESTADO DA APLICAÇÃO
   ═══════════════════════════════════════════════════════════════ */

/** Carrinho: chave = id do produto, valor = quantidade */
let carrinho = {};

/** Categoria atualmente selecionada no filtro */
let catAtual = "todos";


/* ═══════════════════════════════════════════════════════════════
   ③ UTILITÁRIOS
   ═══════════════════════════════════════════════════════════════ */

/** Formata número como moeda: 9.5 → "R$ 9,50" */
function fmt(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Formata telefone enquanto o usuário digita: (24) 99999-9999 */
function fmtTelefone(valor) {
  valor = valor.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length <= 10) {
    valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return valor;
}

/**
 * Formata a data do campo (yyyy-mm-dd) para o formato da mensagem.
 * Resultado: "18/04/2026 - sábado"
 *
 * → Para mudar o formato: edite o return dentro desta função.
 * → Os nomes dos dias estão no array diasSemana — altere se quiser abreviar.
 */
function fmtData(dataIso) {
  if (!dataIso) return "-";

  const [ano, mes, dia] = dataIso.split("-");

  /* Nomes dos dias da semana — índice 0 = domingo, 6 = sábado */
  const diasSemana = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ];

  /* new Date(ano, mes-1, dia) cria a data sem problemas de fuso horário */
  const nomeDia = diasSemana[new Date(ano, mes - 1, dia).getDay()];

  /* Formato final: dd/mm/aaaa - dia da semana */
  return `${dia}/${mes}/${ano} - ${nomeDia}`;
}

/** Busca produto pelo id */
function buscarProduto(id) {
  return produtos.find(p => p.id == id);
}

/** Soma todas as quantidades no carrinho */
function totalQuantidade() {
  return Object.values(carrinho).reduce((acc, q) => acc + q, 0);
}

/** Calcula valor total do carrinho */
function totalValor() {
  return Object.keys(carrinho).reduce((acc, id) => {
    const p = buscarProduto(id);
    return acc + (p ? p.preco * carrinho[id] : 0);
  }, 0);
}


/* ═══════════════════════════════════════════════════════════════
   ④ RENDERIZAÇÃO DOS PRODUTOS
   ═══════════════════════════════════════════════════════════════ */

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
      html += `<h2 class="secao-titulo">${catNomes[cat] || cat}</h2>`;
      html += `<div class="grid-produtos">${itens.map(gerarCardHtml).join("")}</div>`;
    });
  } else {
    html = `<div class="grid-produtos" style="margin-top:16px">${lista.map(gerarCardHtml).join("")}</div>`;
  }

  grid.innerHTML = html;
}

/**
 * Gera o HTML de um card de produto.
 *
 * LÓGICA DA IMAGEM:
 *   1. Se p.foto estiver preenchido → exibe a foto
 *   2. Se p.foto estiver vazio ou ausente → exibe o emoji como fallback
 *
 * No carrinho lateral, sempre usa o emoji (ícone pequeno).
 */
function gerarCardHtml(p) {
  const qty = carrinho[p.id] || 0;

  const unidLabel = {
    pacote:  "por pacote",
    cento:   "por cento",
    unidade: "por unidade",
    kg:      "por kg"
  }[p.unid] || p.unid;

  const thumbHtml = p.foto
    ? `<img
         src="${p.foto}"
         alt="${p.nome}"
         class="card__foto"
         onerror="fotoFallback(this, '${p.emoji}')"
       />`
    : `<span class="card__emoji">${p.emoji}</span>`;

  return `
    <div class="card">
      <div class="card__thumb">
        ${thumbHtml}
        ${p.antecedencia ? '<span class="card__tag">24h</span>' : ""}
      </div>
      <div class="card__body">
        <div class="card__nome">${p.nome}</div>
        <div class="card__desc">${p.desc}</div>
        <div class="card__rodape">
          <div class="card__preco-wrap">
            <span class="card__unid">${unidLabel}</span>
            <span class="card__preco">${fmt(p.preco)}</span>
          </div>
          <div class="controle">
            <button class="controle__btn"              onclick="mudaQuantidade(${p.id}, -1)" aria-label="Diminuir">−</button>
            <span   class="controle__num"              id="qty${p.id}">${qty}</span>
            <button class="controle__btn controle__btn--add" onclick="mudaQuantidade(${p.id}, 1)"  aria-label="Adicionar">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fallback automático: se a imagem não carregar,
 * substitui o <img> pelo emoji para não quebrar o layout.
 */
function fotoFallback(imgEl, emoji) {
  const span = document.createElement("span");
  span.className = "card__emoji";
  span.textContent = emoji;
  imgEl.replaceWith(span);
}


/* ═══════════════════════════════════════════════════════════════
   ⑤ LÓGICA DO CARRINHO
   ═══════════════════════════════════════════════════════════════ */

function mudaQuantidade(id, delta) {
  if (!carrinho[id]) carrinho[id] = 0;
  carrinho[id] = Math.max(0, carrinho[id] + delta);
  if (carrinho[id] === 0) delete carrinho[id];

  const numEl = document.getElementById("qty" + id);
  if (numEl) numEl.textContent = carrinho[id] || 0;

  if (delta > 0) {
    const p = buscarProduto(id);
    mostrarToast(`${p.nome} adicionado! ✓`);
  }

  atualizarUI();
}

function removerItem(id) {
  delete carrinho[id];
  const numEl = document.getElementById("qty" + id);
  if (numEl) numEl.textContent = "0";
  atualizarUI();
}


/* ═══════════════════════════════════════════════════════════════
   ⑥ ATUALIZAÇÃO GERAL DA INTERFACE
   ═══════════════════════════════════════════════════════════════ */

function atualizarUI() {
  const qty = totalQuantidade();
  const val = totalValor();

  document.getElementById("headerBadge").textContent = qty;

  const floatBar = document.getElementById("floatBar");
  document.getElementById("fbQtd").textContent  = `${qty} ${qty === 1 ? "item" : "itens"}`;
  document.getElementById("fbTotal").textContent = fmt(val);
  floatBar.classList.toggle("visivel", qty > 0);

  const body   = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");

  if (qty === 0) {
    body.innerHTML = `
      <div class="cart-vazio">
        <span class="cart-vazio__emoji">🥐</span>
        <p>Seu pedido está vazio</p>
        <small>Adicione produtos e finalize pelo WhatsApp!</small>
      </div>`;
    footer.style.display = "none";
  } else {
    footer.style.display = "block";
    document.getElementById("cartTotal").textContent = fmt(val);

    body.innerHTML = Object.keys(carrinho).map(id => {
      const p = buscarProduto(id);
      if (!p) return "";
      const subtotal = p.preco * carrinho[id];
      return `
        <div class="cart-item">
          <span class="cart-item__emoji">${p.emoji}</span>
          <div class="cart-item__info">
            <div class="cart-item__nome">${p.nome}</div>
            <div class="cart-item__sub">${carrinho[id]}x ${fmt(p.preco)}</div>
          </div>
          <span class="cart-item__preco">${fmt(subtotal)}</span>
          <button class="cart-item__remover" onclick="removerItem(${id})" aria-label="Remover ${p.nome}">🗑</button>
        </div>`;
    }).join("");
  }

  atualizarPreview();
}


/* ═══════════════════════════════════════════════════════════════
   ⑦ CARRINHO LATERAL — abrir / fechar
   ═══════════════════════════════════════════════════════════════ */

function abrirCarrinho() {
  document.getElementById("cartPanel").classList.add("aberto");
  document.getElementById("overlay").classList.add("aberto");
  document.body.style.overflow = "hidden";
}

function fecharCarrinho() {
  document.getElementById("cartPanel").classList.remove("aberto");
  document.getElementById("overlay").classList.remove("aberto");
  document.body.style.overflow = "";
}


/* ═══════════════════════════════════════════════════════════════
   ⑧ MODAL DE CHECKOUT — abrir / fechar
   ═══════════════════════════════════════════════════════════════ */

function abrirModal() {
  fecharCarrinho();
  document.getElementById("modalBg").classList.add("aberto");
  document.body.style.overflow = "hidden";
  atualizarPreview();
}

function fecharModal() {
  document.getElementById("modalBg").classList.remove("aberto");
  document.body.style.overflow = "";
}

function fecharModalFora(event) {
  if (event.target === document.getElementById("modalBg")) fecharModal();
}


/* ═══════════════════════════════════════════════════════════════
   ⑨ HORÁRIOS DE ATENDIMENTO
   ═══════════════════════════════════════════════════════════════ */

function preencherHorarios() {
  const dataVal = document.getElementById("inData").value;
  const select  = document.getElementById("inHora");
  select.innerHTML = "";

  if (!dataVal) {
    select.innerHTML = '<option value="">Selecione a data primeiro</option>';
    atualizarPreview();
    return;
  }

  const [ano, mes, dia] = dataVal.split("-").map(Number);
  const dataSelecionada = new Date(ano, mes - 1, dia);
  const diaSemana       = dataSelecionada.getDay();
  const agora           = new Date();

  const isHoje =
    dataSelecionada.getFullYear() === agora.getFullYear() &&
    dataSelecionada.getMonth()    === agora.getMonth()    &&
    dataSelecionada.getDate()     === agora.getDate();

  /* ── ALTERE AQUI PARA MUDAR OS HORÁRIOS ── */
  const horaInicio = 6;
  const horaFim    = diaSemana === 0 ? 12 : 21; // domingo fecha às 12h

  const opcoesHorario = [];

  for (let hora = horaInicio; hora <= horaFim; hora++) {
    ["00", "30"].forEach(minuto => {
      if (hora === horaFim && minuto === "30") return;
      const horarioStr = `${String(hora).padStart(2, "0")}:${minuto}`;
      if (isHoje) {
        const horarioDate = new Date();
        horarioDate.setHours(hora, parseInt(minuto), 0, 0);
        if (horarioDate <= agora) return;
      }
      opcoesHorario.push(horarioStr);
    });
  }

  select.innerHTML = opcoesHorario.length
    ? '<option value="">Selecione um horário</option>' +
      opcoesHorario.map(h => `<option value="${h}">${h}</option>`).join("")
    : '<option value="">Nenhum horário disponível para hoje</option>';

  atualizarPreview();
}


/* ═══════════════════════════════════════════════════════════════
   ⑩ GERAÇÃO E PRÉVIA DA MENSAGEM WHATSAPP
   ═══════════════════════════════════════════════════════════════ */

function gerarMensagem() {
  if (!Object.keys(carrinho).length) {
    return "Adicione produtos ao pedido para ver a prévia aqui.";
  }

  const linhasProdutos = Object.keys(carrinho)
    .map(id => {
      const p = buscarProduto(id);
      return `• ${carrinho[id]}x ${p.nome} — ${fmt(p.preco * carrinho[id])}`;
    })
    .join("\n");

  const nome = document.getElementById("inNome")?.value.trim() || "-";
  const tel  = document.getElementById("inTel")?.value.trim()  || "-";
  const obs  = document.getElementById("inObs")?.value.trim()  || "-";
  const hora = document.getElementById("inHora")?.value        || "-";

  /*
   * DATA FORMATADA
   * → Usa a função fmtData() que converte yyyy-mm-dd para dd/mm/aaaa - dia da semana
   * → Exemplo: "20/04/2026 - segunda-feira"
   * → Para mudar o formato: edite a função fmtData() na seção ③ acima
   */
  const dataRaw = document.getElementById("inData")?.value || "";
  const data    = fmtData(dataRaw);

  /* ── FORMATO DA MENSAGEM — edite aqui para mudar o texto enviado ── */
  return `🥐 *ENCOMENDA — Padaria Bom Pastor*

👤 *Nome:* ${nome}
📱 *Contato:* ${tel}

📅 *Data de retirada:* ${data}
🕐 *Horário:* ${hora}

🛒 *Itens do pedido:*
${linhasProdutos}

💰 *Total: ${fmt(totalValor())}*

📍 *Retirada no local (não fazemos entregas)*

📝 *Observações:* ${obs}`;
}

function atualizarPreview() {
  const el = document.getElementById("preview");
  if (el) el.textContent = gerarMensagem();
}


/* ═══════════════════════════════════════════════════════════════
   ⑪ VALIDAÇÃO E ENVIO PARA O WHATSAPP
   ═══════════════════════════════════════════════════════════════ */

function enviarWhatsApp() {
  const nome   = document.getElementById("inNome").value.trim();
  const tel    = document.getElementById("inTel").value.trim();
  const data   = document.getElementById("inData").value;
  const hora   = document.getElementById("inHora").value;
  const status = document.getElementById("statusMsg");

  status.textContent = "";

  if (!Object.keys(carrinho).length) { status.textContent = "⚠️ Adicione pelo menos 1 produto ao pedido."; return; }
  if (!nome) { status.textContent = "⚠️ Por favor, informe o nome completo."; document.getElementById("inNome").focus(); return; }
  if (!tel)  { status.textContent = "⚠️ Por favor, informe o WhatsApp/telefone."; document.getElementById("inTel").focus(); return; }
  if (!data) { status.textContent = "⚠️ Selecione a data de retirada."; document.getElementById("inData").focus(); return; }
  if (!hora) { status.textContent = "⚠️ Selecione o horário de retirada."; document.getElementById("inHora").focus(); return; }

  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(gerarMensagem())}`;
  window.open(url, "_blank");
}


/* ═══════════════════════════════════════════════════════════════
   ⑫ TOAST — notificação rápida
   ═══════════════════════════════════════════════════════════════ */

function mostrarToast(mensagem) {
  const el = document.getElementById("toast");
  el.textContent = mensagem;
  el.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}


/* ═══════════════════════════════════════════════════════════════
   ⑬ FILTRO DE CATEGORIAS
   ═══════════════════════════════════════════════════════════════ */

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("ativa"));
    btn.classList.add("ativa");
    catAtual = btn.dataset.cat;
    renderizarProdutos();
  });
});


/* ═══════════════════════════════════════════════════════════════
   ⑭ EVENTOS DO FORMULÁRIO
   ═══════════════════════════════════════════════════════════════ */

document.getElementById("inTel").addEventListener("input", e => {
  e.target.value = fmtTelefone(e.target.value);
  atualizarPreview();
});

document.getElementById("inData").addEventListener("change", preencherHorarios);

["inNome", "inObs"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", atualizarPreview);
});

document.getElementById("inHora")?.addEventListener("change", atualizarPreview);


/* ═══════════════════════════════════════════════════════════════
   ⑮ INICIALIZAÇÃO
   ═══════════════════════════════════════════════════════════════ */

function definirDataMinima() {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia  = String(hoje.getDate()).padStart(2, "0");
  document.getElementById("inData").min = `${ano}-${mes}-${dia}`;
}

definirDataMinima();
renderizarProdutos();
atualizarUI();