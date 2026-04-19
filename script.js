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

const WHATSAPP_NUMERO = "552433266628";

/**
 * CARDÁPIO — lista de produtos disponíveis para encomenda.
 */
const produtos = [
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
    desc: "Pedido mínimo de 50 unidades. Ideal para eventos e cafés. Pedir com 24h de antecedência.",
    preco: 0.70,
    cat: "paes",
    emoji: "🥐",
    unid: "unidade",
    qtdMinima: 50,
    antecedencia: true,
    foto: "mini.png"
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
    foto: "pao-sal.jpeg"
  },
  {
    id: 10,
    nome: "Rosca Salgada",
    desc: "Rosca salgada recheada com presunto, queijo e maionese, feita no dia para garantir sabor e maciez. Ideal para café e lanche.",
    preco: 19.00,
    cat: "paes",
    emoji: "🥨",
    unid: "unidade",
    foto: "rosca.jpeg"
  },
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
  paes: "🍞 Pães",
  bolos: "🎂 Bolos & Tortas",
  doces: "🍮 Doces & Confeitaria"
};


/* ═══════════════════════════════════════════════════════════════
   ② ESTADO DA APLICAÇÃO
   ═══════════════════════════════════════════════════════════════ */

let carrinho = {};
let catAtual = "todos";


/* ═══════════════════════════════════════════════════════════════
   ③ UTILITÁRIOS
   ═══════════════════════════════════════════════════════════════ */

function fmt(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

function fmtData(dataIso) {
  if (!dataIso) return "-";

  const [ano, mes, dia] = dataIso.split("-");

  const diasSemana = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ];

  const nomeDia = diasSemana[new Date(ano, mes - 1, dia).getDay()];
  return `${dia}/${mes}/${ano} - ${nomeDia}`;
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
    cento: "por cento",
    unidade: "por unidade",
    kg: "por kg"
  }[unid] || unid;
}

function getTextoQuantidade(produto, quantidade) {
  if (produto.unid === "kg") return `${quantidade} kg`;
  return `${quantidade}x`;
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

function gerarCardHtml(p) {
  const qty = carrinho[p.id] || 0;
  const unidLabel = getLabelUnidade(p.unid);

  const infoMinima = p.qtdMinima
    ? `<div class="card__desc" style="margin-top:-6px; margin-bottom:10px; color:#A97208; font-weight:800;">Pedido mínimo: ${p.qtdMinima} unidades</div>`
    : "";

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
        ${infoMinima}
        <div class="card__rodape">
          <div class="card__preco-wrap">
            <span class="card__unid">${unidLabel}</span>
            <span class="card__preco">${fmt(p.preco)}</span>
          </div>
          <div class="controle">
            <button class="controle__btn" onclick="mudaQuantidade(${p.id}, -1)" aria-label="Diminuir">−</button>
            <span class="controle__num" id="qty${p.id}">${qty}</span>
            <button class="controle__btn controle__btn--add" onclick="mudaQuantidade(${p.id}, 1)" aria-label="Adicionar">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

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
  const produto = buscarProduto(id);
  if (!produto) return;

  const qtdAtual = carrinho[id] || 0;
  const qtdMinima = produto.qtdMinima || 1;
  let novaQtd = qtdAtual;

  if (delta > 0) {
    novaQtd = qtdAtual === 0 ? qtdMinima : qtdAtual + delta;
  } else if (delta < 0) {
    if (qtdAtual <= qtdMinima && produto.qtdMinima) {
      novaQtd = 0;
    } else {
      novaQtd = Math.max(0, qtdAtual + delta);
    }
  }

  if (novaQtd > 0) {
    carrinho[id] = novaQtd;
  } else {
    delete carrinho[id];
  }

  const numEl = document.getElementById("qty" + id);
  if (numEl) numEl.textContent = carrinho[id] || 0;

  if (delta > 0) {
    if (produto.qtdMinima && qtdAtual === 0) {
      mostrarToast(`${produto.nome} adicionado com mínimo de ${produto.qtdMinima} unidades ✓`);
    } else {
      mostrarToast(`${produto.nome} adicionado! ✓`);
    }
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
  document.getElementById("fbQtd").textContent = `${qty} ${qty === 1 ? "item" : "itens"}`;
  document.getElementById("fbTotal").textContent = fmt(val);
  floatBar.classList.toggle("visivel", qty > 0);

  const body = document.getElementById("cartBody");
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

      const quantidade = carrinho[id];
      const subtotal = p.preco * quantidade;
      const textoQuantidade = getTextoQuantidade(p, quantidade);

      return `
        <div class="cart-item">
          <span class="cart-item__emoji">${p.emoji}</span>
          <div class="cart-item__info">
            <div class="cart-item__nome">${p.nome}</div>
            <div class="cart-item__sub">${textoQuantidade} ${p.unid === "kg" ? fmt(p.preco) : `× ${fmt(p.preco)}`}</div>
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
  const select = document.getElementById("inHora");
  select.innerHTML = "";

  if (!dataVal) {
    select.innerHTML = '<option value="">Selecione a data primeiro</option>';
    atualizarPreview();
    return;
  }

  const [ano, mes, dia] = dataVal.split("-").map(Number);
  const dataSelecionada = new Date(ano, mes - 1, dia);
  const diaSemana = dataSelecionada.getDay();
  const agora = new Date();

  const isHoje =
    dataSelecionada.getFullYear() === agora.getFullYear() &&
    dataSelecionada.getMonth() === agora.getMonth() &&
    dataSelecionada.getDate() === agora.getDate();

  const horaInicio = 6;
  const horaFim = diaSemana === 0 ? 12 : 21;

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
      const quantidade = carrinho[id];
      const subtotal = p.preco * quantidade;
      return `• ${quantidade}x ${p.nome} — ${fmt(subtotal)}`;
    })
    .join("\n");

  const nome = document.getElementById("inNome")?.value.trim() || "-";
  const tel = document.getElementById("inTel")?.value.trim() || "-";
  const obs = document.getElementById("inObs")?.value.trim() || "-";
  const hora = document.getElementById("inHora")?.value || "-";

  const dataRaw = document.getElementById("inData")?.value || "";
  const data = fmtData(dataRaw);

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
  const nome = document.getElementById("inNome").value.trim();
  const tel = document.getElementById("inTel").value.trim();
  const data = document.getElementById("inData").value;
  const hora = document.getElementById("inHora").value;
  const status = document.getElementById("statusMsg");

  status.textContent = "";

  if (!Object.keys(carrinho).length) {
    status.textContent = "⚠️ Adicione pelo menos 1 produto ao pedido.";
    return;
  }

  if (!nome) {
    status.textContent = "⚠️ Por favor, informe o nome completo.";
    document.getElementById("inNome").focus();
    return;
  }

  if (!tel) {
    status.textContent = "⚠️ Por favor, informe o WhatsApp/telefone.";
    document.getElementById("inTel").focus();
    return;
  }

  if (!data) {
    status.textContent = "⚠️ Selecione a data de retirada.";
    document.getElementById("inData").focus();
    return;
  }

  if (!hora) {
    status.textContent = "⚠️ Selecione o horário de retirada.";
    document.getElementById("inHora").focus();
    return;
  }

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
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  document.getElementById("inData").min = `${ano}-${mes}-${dia}`;
}

definirDataMinima();
renderizarProdutos();
atualizarUI();