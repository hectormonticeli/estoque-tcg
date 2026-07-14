// Variável global para armazenar a cotação comercial
let cotacaoDolar = 1;

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

carregarCotacaoDolar();

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
function adicionarAoEstoque(carta, quantidadeAdicional, estado) {
    let estoque = obterEstoque();
    
    // O ID único combina o ID da carta + estado de conservação
    const idUnico = `${carta.id}-${estado}`;
    
    const index = estoque.findIndex(item => item.idUnico === idUnico);
    
    if (index !== -1) {
        estoque[index].quantidade += quantidadeAdicional;
    } else {
        const novoItem = {
            idUnico: idUnico,
            id: carta.id,
            name: carta.name,
            image: carta.images.small,
            set: carta.set.name,
            number: `${carta.number}/${carta.set.printedTotal}`,
            rarity: carta.rarity || 'Não informada',
            priceUSD: obterPrecoUSD(carta),
            quantidade: quantidadeAdicional,
            estado: estado
        };
        estoque.push(novoItem);
    }
    
    salvarEstoque(estoque);
    alert(`${quantidadeAdicional}x ${carta.name} (${estado}) adicionado ao estoque!`);
}

function obterPrecoUSD(carta) {
    if (carta.tcgplayer && carta.tcgplayer.prices) {
        const tipoPreco = Object.keys(carta.tcgplayer.prices)[0];
        return parseFloat(carta.tcgplayer.prices[tipoPreco].market) || 0;
    }
    return 0;
}