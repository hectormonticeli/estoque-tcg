// INSIRA A SUA CHAVE DA API AQUI DE VERDADE
const MINHA_API_KEY = "3f5ec81a-19cf-4d7f-85ba-3d535630a338"; 

let cartasEncontradas = [];
let cartaSelecionada = null;

// Variáveis para controlar a paginação
let paginaAtual = 1;
const limitePorPagina = 30;
let queryAtual = "";

async function buscarCartas() {
    const name = document.getElementById('pokemonName').value.trim();
    const subtype = document.getElementById('cardSubtype').value;
    const rarity = document.getElementById('cardRarity').value;
    const set = document.getElementById('cardSet').value;

    if (!name && !set) {
        alert('Por favor, digite um nome ou escolha uma coleção!');
        return;
    }

    const resultsSection = document.getElementById('resultsSection');
    const resultsGrid = document.getElementById('resultsGrid');
    const selectedCardDiv = document.getElementById('selectedCard');
    
    selectedCardDiv.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Reseta o controle de páginas para uma nova busca
    paginaAtual = 1;
    cartasEncontradas = [];
    resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-weight: bold; color: #e3350d;">Buscando cartas na API... Por favor, aguarde.</p>';

    // Remove o botão de carregar mais antigo se ele existir
    removerBotaoCarregarMais();

    // Monta a query de busca
    let queryParts = [];
    if (name) queryParts.push(`name:"${name}*"`);
    if (subtype) queryParts.push(`subtypes:"${subtype}"`);
    if (rarity) queryParts.push(`rarity:"${rarity}"`);
    if (set) queryParts.push(`set.id:"${set}"`);

    queryAtual = queryParts.join(' ');

    // Dispara a primeira busca
    executarChamadaAPI();
}

async function executarChamadaAPI() {
    const resultsGrid = document.getElementById('resultsGrid');
    const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(queryAtual)}&page=${paginaAtual}&pageSize=${limitePorPagina}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': MINHA_API_KEY
            }
        });
        const data = await response.json();
        const novasCartas = data.data || [];

        // Remove a mensagem de "Carregando..." na primeira página
        if (paginaAtual === 1) {
            resultsGrid.innerHTML = '';
        }

        if (novasCartas.length > 0) {
            // Guarda as cartas encontradas no array global para seleção posterior
            // Usamos o operador "spread" (...) para juntar as cartas novas com as que já tínhamos
            const offsetAnterior = cartasEncontradas.length;
            cartasEncontradas = [...cartasEncontradas, ...novasCartas];

            // Renderiza apenas as novas cartas adicionadas
            novasCartas.forEach((carta, index) => {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                gridItem.style.cursor = 'pointer';
                // O index real do array global será o offset anterior + o index atual do loop
                gridItem.setAttribute('onclick', `selecionarCarta(${offsetAnterior + index})`);
                
                const img = document.createElement('img');
                img.src = carta.images.small;
                img.alt = carta.name;
                
                gridItem.appendChild(img);
                resultsGrid.appendChild(gridItem);
            });

            // Se a API retornou o limite máximo de cartas, significa que provavelmente há mais nas próximas páginas
            if (novasCartas.length === limitePorPagina) {
                criarBotaoCarregarMais();
            } else {
                removerBotaoCarregarMais();
            }

        } else {
            if (paginaAtual === 1) {
                resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: gray;">Nenhuma carta encontrada com esses critérios.</p>';
            }
            removerBotaoCarregarMais();
        }

    } catch (error) {
        console.error(error);
        if (paginaAtual === 1) {
            resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Erro ao conectar com a API de Pokémon.</p>';
        } else {
            alert('Erro ao carregar mais cartas.');
        }
    }
}

// Cria o botão "Carregar Mais" dinamicamente abaixo da grade de resultados
function criarBotaoCarregarMais() {
    removerBotaoCarregarMais(); // Garante que não haverá duplicados

    const resultsSection = document.getElementById('resultsSection');
    const btn = document.createElement('button');
    btn.id = 'btnCarregarMais';
    btn.innerText = 'Carregar mais cartas...';
    btn.style.margin = '20px auto';
    btn.style.display = 'block';
    
    // Função que avança a página e busca mais dados
    btn.onclick = () => {
        paginaAtual++;
        btn.innerText = 'Carregando...';
        btn.disabled = true;
        executarChamadaAPI();
    };

    resultsSection.appendChild(btn);
}

function removerBotaoCarregarMais() {
    const btnExistente = document.getElementById('btnCarregarMais');
    if (btnExistente) {
        btnExistente.remove();
    }
}

function selecionarCarta(index) {
    cartaSelecionada = cartasEncontradas[index];
    const selectedCardDiv = document.getElementById('selectedCard');

    document.getElementById('cardName').innerText = cartaSelecionada.name;
    document.getElementById('cardImage').src = cartaSelecionada.images.large;
    document.getElementById('cardSetText').innerText = cartaSelecionada.set.name;
    document.getElementById('cardNumber').innerText = `${cartaSelecionada.number}/${cartaSelecionada.set.printedTotal}`;
    document.getElementById('cardRarityText').innerText = cartaSelecionada.rarity || 'Não informada';
    
    const precoUSD = obterPrecoUSD(cartaSelecionada);
    if (precoUSD > 0) {
        const precoBRL = precoUSD * cotacaoDolar;
        document.getElementById('cardPrice').innerText = `R$ ${precoBRL.toFixed(2)}`;
    } else {
        document.getElementById('cardPrice').innerText = 'Não disponível';
    }

    document.getElementById('addQuantity').value = 1;
    selectedCardDiv.style.display = 'block';
    selectedCardDiv.scrollIntoView({ behavior: 'smooth' });
}

function confirmarAdicao() {
    if (!cartaSelecionada) return;
    
    const quantidade = parseInt(document.getElementById('addQuantity').value) || 1;
    const estado = document.getElementById('addCondition').value;
    
    if (quantidade < 1) {
        alert('A quantidade mínima é 1!');
        return;
    }

    adicionarAoEstoque(cartaSelecionada, quantidade, estado);
}