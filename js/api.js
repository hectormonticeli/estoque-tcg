// Variável global para armazenar a cotação comercial
let cotacaoDolar = 1;

// Busca a cotação atualizada na AwesomeAPI
async function carregarCotacaoDolar() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        const data = await response.json();
        cotacaoDolar = parseFloat(data.USDBRL.bid);
        console.log(`Cotação atualizada: R$ ${cotacaoDolar.toFixed(2)}`);
    } catch (error) {
        console.error("Erro ao obter cotação. Usando R$ 6.00 como fallback.", error);
        cotacaoDolar = 6.00;
    }
}

// Inicia a cotação ao carregar o script
carregarCotacaoDolar();

// --- FUNÇÕES DE CONTROLE DO ESTOQUE (localStorage) ---

// Retorna a lista de cartas salvas no estoque do navegador
function obterEstoque() {
    const estoque = localStorage.getItem('estoque_pokemon');
    return estoque ? JSON.parse(estoque) : [];
}

// Salva a lista de cartas atualizada de volta no navegador
function salvarEstoque(estoque) {
    localStorage.setItem('estoque_pokemon', JSON.stringify(estoque));
}

// Adiciona uma carta ou atualiza a quantidade se ela já existir no estoque
function adicionarAoEstoque(carta, quantidadeAdicional) {
    let estoque = obterEstoque();
    
    // Procura se a carta com este ID específico já está no estoque
    const index = estoque.findIndex(item => item.id === carta.id);
    
    if (index !== -1) {
        // Se já existe, soma à quantidade atual
        estoque[index].quantidade += quantidadeAdicional;
    } else {
        // Se é nova, cria o objeto no estoque com a quantidade selecionada
        const novoItem = {
            id: carta.id,
            name: carta.name,
            image: carta.images.small,
            set: carta.set.name,
            number: `${carta.number}/${carta.set.printedTotal}`,
            rarity: carta.rarity || 'Não informada',
            priceUSD: obterPrecoUSD(carta),
            quantidade: quantidadeAdicional
        };
        estoque.push(novoItem);
    }
    
    salvarEstoque(estoque);
    alert(`${quantidadeAdicional}x ${carta.name} adicionado ao estoque!`);
}

// Função auxiliar para extrair o preço de mercado da carta
function obterPrecoUSD(carta) {
    if (carta.tcgplayer && carta.tcgplayer.prices) {
        const tipoPreco = Object.keys(carta.tcgplayer.prices)[0];
        return parseFloat(carta.tcgplayer.prices[tipoPreco].market) || 0;
    }
    return 0;
}