/*
  ==========================================
  PADARIA BOM PASTOR - SCRIPT.JS
  ==========================================
  Este arquivo controla:
  - cadastro dos produtos
  - botões de quantidade (+ e -)
  - carrinho / pedido
  - máscara do telefone
  - horários válidos
  - regra de antecedência de 24h
  - campo de observações
  - mensagem final para o WhatsApp
*/

const numeroWhatsApp = "552433266628";

const produtos = [
  {
    id: 1,
    nome: "Pão de Cachorro Quente",
    descricao: "Pacote com 30 pães.",
    preco: 9.5,
    unidadeLabel: "pacote(s)",
    exige24h: false,
    quantidadeMinima: 1,
    imagem: "cachorro quente.jpeg",
    observacao: ""
  },
  {
    id: 2,
    nome: "Pão Hot Dog",
    descricao: "Pacote com 10 pães.",
    preco: 9.5,
    unidadeLabel: "pacote(s)",
    exige24h: false,
    quantidadeMinima: 1,
    imagem: "pao-hotdog.jpeg",
    observacao: ""
  },
  {
    id: 3,
    nome: "Pão de Hambúrguer",
    descricao: "Pacote com 6 pães.",
    preco: 6.0,
    unidadeLabel: "pacote(s)",
    exige24h: false,
    quantidadeMinima: 1,
    imagem: "pao-hamburguer.jpeg",
    observacao: ""
  },
  {
    id: 4,
    nome: "Pão de Sal Tradicional",
    descricao: "R$ 90,00 o cento. Aceita a quantidade desejada pelo cliente.",
    preco: 0.9,
    unidadeLabel: "unidade(s)",
    exige24h: false,
    quantidadeMinima: 1,
    imagem: "pao-sal.jpeg",
    observacao: "Valor calculado por unidade com base em R$ 90,00 o cento."
  },
  {
    id: 5,
    nome: "Mini Pão de Sal",
    descricao: "R$ 70,00 o cento. Pedido mínimo de 50 unidades.",
    preco: 0.7,
    unidadeLabel: "unidade(s)",
    exige24h: true,
    quantidadeMinima: 50,
    imagem: "mini.png",
    observacao: "Pedido mínimo de 50 unidades e antecedência mínima de 24 horas."
  },
  {
    id: 6,
    nome: "Pudim de Leite Condensado",
    descricao: "Forma inteira.",
    preco: 40.0,
    unidadeLabel: "unidade(s)",
    exige24h: true,
    quantidadeMinima: 1,
    imagem: "pudim.jpeg",
    observacao: "Antecedência mínima de 24 horas."
  },
  {
    id: 7,
    nome: "Rosca Salgada Recheada",
    descricao: "Rosca salgada recheada.",
    preco: 18.0,
    unidadeLabel: "unidade(s)",
    exige24h: true,
    quantidadeMinima: 1,
    imagem: "rosca.jpeg",
    observacao: "Encomendas com antecedência mínima de 24 horas."
  }
];

const pedido = [];

const produtosGrid = document.getElementById("produtosGrid");
const pedidoLista = document.getElementById("pedidoLista");
const pedidoVazio = document.getElementById("pedidoVazio");
const quantidadeItens = document.getElementById("quantidadeItens");
const totalPedido = document.getElementById("totalPedido");
const btnLimparPedido = document.getElementById("btnLimparPedido");
const nomeCliente = document.getElementById("nomeCliente");
const telefoneCliente = document.getElementById("telefoneCliente");
const dataRetirada = document.getElementById("dataRetirada");
const horarioRetirada = document.getElementById("horarioRetirada");
const observacoesPedido = document.getElementById("observacoesPedido");
const btnFinalizar = document.getElementById("btnFinalizar");
const mensagemStatus = document.getElementById("mensagemStatus");
const previewMensagem = document.getElementById("previewMensagem");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarDataBR(dataStr) {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function obterNomeDiaSemana(dataStr) {
  const data = new Date(dataStr + "T00:00:00");
  const nomes = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ];
  return nomes[data.getDay()];
}

function obterIntervaloFuncionamento(dataStr) {
  const data = new Date(dataStr + "T00:00:00");
  const diaSemana = data.getDay();

  if (diaSemana === 0) {
    return { inicio: 6, fim: 12 };
  }

  return { inicio: 6, fim: 21 };
}

function gerarHorariosDisponiveis(dataStr) {
  if (!dataStr) return [];

  const horarios = [];
  const { inicio, fim } = obterIntervaloFuncionamento(dataStr);

  const agora = new Date();
  const anoHoje = agora.getFullYear();
  const mesHoje = String(agora.getMonth() + 1).padStart(2, "0");
  const diaHoje = String(agora.getDate()).padStart(2, "0");
  const hojeStr = `${anoHoje}-${mesHoje}-${diaHoje}`;

  const mesmaData = dataStr === hojeStr;

  for (let hora = inicio; hora <= fim; hora++) {
    const horaFormatada = String(hora).padStart(2, "0") + ":00";

    if (mesmaData) {
      const dataHoraEscolhida = new Date(`${dataStr}T${horaFormatada}:00`);
      if (dataHoraEscolhida <= agora) {
        continue;
      }
    }

    horarios.push(horaFormatada);
  }

  return horarios;
}

function aplicarMascaraTelefone(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros.length ? `(${numeros}` : "";
  }

  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
}

function renderizarProdutos() {
  if (!produtosGrid) return;

  produtosGrid.innerHTML = "";

  produtos.forEach(produto => {
    const card = document.createElement("article");
    card.className = "produto-card";

    let textoPreco = "";
    if (produto.id === 4) {
      textoPreco = "R$ 90,00 o cento";
    } else if (produto.id === 5) {
      textoPreco = "R$ 70,00 o cento";
    } else {
      textoPreco = formatarMoeda(produto.preco);
    }

    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}" />

      <div class="produto-info">
        <h3>${produto.nome}</h3>
        <div class="produto-descricao">${produto.descricao}</div>
        <div class="produto-preco">${textoPreco}</div>
        <div class="produto-obs">${produto.observacao || "&nbsp;"}</div>

        <div class="controle-quantidade">
          <button
            class="btn-qtd"
            type="button"
            aria-label="Diminuir quantidade"
            onclick="alterarQuantidade(${produto.id}, -1)"
          >−</button>

          <input
            type="number"
            min="${produto.quantidadeMinima}"
            step="1"
            value="${produto.quantidadeMinima}"
            id="qtd-${produto.id}"
          />

          <button
            class="btn-qtd"
            type="button"
            aria-label="Aumentar quantidade"
            onclick="alterarQuantidade(${produto.id}, 1)"
          >+</button>
        </div>

        <button class="btn btn-add" type="button" onclick="adicionarAoPedido(${produto.id})">
          Adicionar ao pedido
        </button>
      </div>
    `;

    produtosGrid.appendChild(card);
  });
}

function alterarQuantidade(produtoId, delta) {
  const produto = produtos.find(item => item.id === produtoId);
  const input = document.getElementById(`qtd-${produtoId}`);

  if (!produto || !input) return;

  let valorAtual = Number(input.value) || produto.quantidadeMinima;
  valorAtual += delta;

  if (valorAtual < produto.quantidadeMinima) {
    valorAtual = produto.quantidadeMinima;
  }

  input.value = valorAtual;
}

function adicionarAoPedido(produtoId) {
  limparMensagemStatus();

  const produto = produtos.find(item => item.id === produtoId);
  const inputQuantidade = document.getElementById(`qtd-${produtoId}`);

  if (!produto || !inputQuantidade) return;

  const quantidade = Number(inputQuantidade.value);

  if (!quantidade || quantidade <= 0) {
    mostrarErro("Informe uma quantidade válida.");
    return;
  }

  if (quantidade < produto.quantidadeMinima) {
    mostrarErro(`O produto "${produto.nome}" exige quantidade mínima de ${produto.quantidadeMinima}.`);
    return;
  }

  const subtotal = quantidade * produto.preco;

  pedido.push({
    produtoId: produto.id,
    nome: produto.nome,
    quantidade,
    unidadeLabel: produto.unidadeLabel,
    subtotal,
    exige24h: produto.exige24h
  });

  renderizarPedido();
  atualizarPreviewMensagem();
  mostrarSucesso(`"${produto.nome}" foi adicionado ao pedido.`);
}

function removerItem(index) {
  pedido.splice(index, 1);
  renderizarPedido();
  atualizarPreviewMensagem();
  mostrarSucesso("Item removido do pedido.");
}

function limparPedido() {
  pedido.length = 0;
  renderizarPedido();
  atualizarPreviewMensagem();
  mostrarSucesso("Pedido limpo com sucesso.");
}

function renderizarPedido() {
  if (!pedidoLista || !pedidoVazio || !quantidadeItens || !totalPedido) return;

  pedidoLista.innerHTML = "";

  if (pedido.length === 0) {
    pedidoVazio.style.display = "block";
  } else {
    pedidoVazio.style.display = "none";
  }

  let totalItens = 0;
  let totalGeral = 0;

  pedido.forEach((item, index) => {
    totalItens += item.quantidade;
    totalGeral += item.subtotal;

    const li = document.createElement("li");
    li.className = "pedido-item";
    li.innerHTML = `
      <div class="pedido-item__topo">
        <h4>${item.nome}</h4>
        <button class="btn-remover" type="button" onclick="removerItem(${index})">Remover</button>
      </div>
      <p>Quantidade: ${item.quantidade} ${item.unidadeLabel}</p>
      <p>Subtotal: <strong>${formatarMoeda(item.subtotal)}</strong></p>
    `;
    pedidoLista.appendChild(li);
  });

  quantidadeItens.textContent = totalItens;
  totalPedido.textContent = formatarMoeda(totalGeral);
}

function configurarDataMinima() {
  if (!dataRetirada) return;

  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  dataRetirada.min = `${yyyy}-${mm}-${dd}`;
}

function atualizarHorarios() {
  if (!horarioRetirada || !dataRetirada) return;

  const dataSelecionada = dataRetirada.value;
  horarioRetirada.innerHTML = "";

  if (!dataSelecionada) {
    horarioRetirada.innerHTML = `<option value="">Selecione primeiro a data</option>`;
    atualizarPreviewMensagem();
    return;
  }

  const horarios = gerarHorariosDisponiveis(dataSelecionada);

  if (horarios.length === 0) {
    horarioRetirada.innerHTML = `<option value="">Não há horários disponíveis para esta data</option>`;
    atualizarPreviewMensagem();
    return;
  }

  horarioRetirada.innerHTML = `<option value="">Selecione um horário</option>`;

  horarios.forEach(horario => {
    const option = document.createElement("option");
    option.value = horario;
    option.textContent = horario;
    horarioRetirada.appendChild(option);
  });

  atualizarPreviewMensagem();
}

function pedidoTemItemCom24h() {
  return pedido.some(item => item.exige24h);
}

function validarAntecedencia24h() {
  if (!pedidoTemItemCom24h()) return true;
  if (!dataRetirada || !horarioRetirada) return false;

  const data = dataRetirada.value;
  const horario = horarioRetirada.value;

  if (!data || !horario) return false;

  const dataHoraRetirada = new Date(`${data}T${horario}:00`);
  const agora = new Date();
  const diffMs = dataHoraRetirada - agora;
  const diffHoras = diffMs / (1000 * 60 * 60);

  return diffHoras >= 24;
}

function validarHorarioFuncionamento() {
  if (!dataRetirada || !horarioRetirada) return false;

  const data = dataRetirada.value;
  const horario = horarioRetirada.value;

  if (!data || !horario) return false;

  const horariosDisponiveis = gerarHorariosDisponiveis(data);
  return horariosDisponiveis.includes(horario);
}

function montarTextoPedido() {
  return pedido
    .map(item => `${item.quantidade} ${item.unidadeLabel} de ${item.nome.toLowerCase()} - ${formatarMoeda(item.subtotal)}`)
    .join("\\n");
}

function calcularTotalGeral() {
  return pedido.reduce((acc, item) => acc + item.subtotal, 0);
}

function montarMensagemFinal() {
  if (pedido.length === 0) {
    return "Adicione produtos ao pedido para visualizar a mensagem final.";
  }

  const nome = nomeCliente?.value.trim() || "[nome do cliente]";
  const telefone = telefoneCliente?.value.trim() || "[telefone]";
  const data = dataRetirada?.value ? formatarDataBR(dataRetirada.value) : "[data]";
  const diaSemana = dataRetirada?.value ? obterNomeDiaSemana(dataRetirada.value) : "[dia da semana]";
  const horario = horarioRetirada?.value || "[horário]";
  const itens = montarTextoPedido();
  const total = formatarMoeda(calcularTotalGeral());
  const observacoes = observacoesPedido?.value.trim() || "";

  let mensagem = `Olá, gostaria de confirmar meu pedido:

data: ${data} - ${diaSemana}
horario: ${horario} horas

pedido:
${itens}

total: ${total}

nome: ${nome}
telefone: ${telefone}`;

  if (observacoes) {
    mensagem += `

observações:
${observacoes}`;
  }

  return mensagem;
}

function atualizarPreviewMensagem() {
  if (previewMensagem) {
    previewMensagem.textContent = montarMensagemFinal();
  }
}

function mostrarErro(texto) {
  if (!mensagemStatus) return;
  mensagemStatus.className = "mensagem-status mensagem-erro";
  mensagemStatus.textContent = texto;
}

function mostrarSucesso(texto) {
  if (!mensagemStatus) return;
  mensagemStatus.className = "mensagem-status mensagem-sucesso";
  mensagemStatus.textContent = texto;
}

function limparMensagemStatus() {
  if (!mensagemStatus) return;
  mensagemStatus.className = "mensagem-status";
  mensagemStatus.textContent = "";
}

function validarFormularioFinal() {
  if (pedido.length === 0) {
    mostrarErro("Adicione pelo menos um item ao pedido antes de finalizar.");
    return false;
  }

  if (!nomeCliente || !nomeCliente.value.trim()) {
    mostrarErro("Informe o nome do cliente.");
    return false;
  }

  if (!telefoneCliente || !telefoneCliente.value.trim()) {
    mostrarErro("Informe o telefone do cliente.");
    return false;
  }

  const telefoneNumeros = telefoneCliente.value.replace(/\\D/g, "");
  if (telefoneNumeros.length < 10) {
    mostrarErro("Informe um telefone válido com DDD.");
    return false;
  }

  if (!dataRetirada || !dataRetirada.value) {
    mostrarErro("Selecione a data da retirada.");
    return false;
  }

  if (!horarioRetirada || !horarioRetirada.value) {
    mostrarErro("Selecione o horário da retirada.");
    return false;
  }

  if (!validarHorarioFuncionamento()) {
    mostrarErro("O horário selecionado é inválido para o dia escolhido.");
    return false;
  }

  if (pedidoTemItemCom24h() && !validarAntecedencia24h()) {
    mostrarErro("Mini pão de sal, pudim e rosca exigem antecedência mínima de 24 horas.");
    return false;
  }

  return true;
}

function finalizarPedido() {
  limparMensagemStatus();

  if (!validarFormularioFinal()) return;

  const mensagem = montarMensagemFinal();
  const link = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;

  window.open(link, "_blank");
  mostrarSucesso("Pedido pronto. O WhatsApp foi aberto para confirmação.");
}

if (telefoneCliente) {
  telefoneCliente.addEventListener("input", event => {
    event.target.value = aplicarMascaraTelefone(event.target.value);
    atualizarPreviewMensagem();
  });
}

if (nomeCliente) {
  nomeCliente.addEventListener("input", atualizarPreviewMensagem);
}

if (dataRetirada) {
  dataRetirada.addEventListener("change", atualizarHorarios);
}

if (horarioRetirada) {
  horarioRetirada.addEventListener("change", atualizarPreviewMensagem);
}

if (observacoesPedido) {
  observacoesPedido.addEventListener("input", atualizarPreviewMensagem);
}

if (btnFinalizar) {
  btnFinalizar.addEventListener("click", finalizarPedido);
}

if (btnLimparPedido) {
  btnLimparPedido.addEventListener("click", limparPedido);
}

renderizarProdutos();
renderizarPedido();
configurarDataMinima();
atualizarPreviewMensagem();

window.alterarQuantidade = alterarQuantidade;
window.adicionarAoPedido = adicionarAoPedido;
window.removerItem = removerItem;