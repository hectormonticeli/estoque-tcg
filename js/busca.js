let cartasEncontradas = [];
let cartaSelecionada = null;

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
    resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-weight: bold; color: #e3350d;">Buscando cartas na API... Por favor, aguarde.</p>';

    try {
        let queryParts = [];
        if (name) queryParts.push(`name:"${name}*"`);
        if (subtype) queryParts.push(`subtypes:"${subtype}"`);
        if (rarity) queryParts.push(`rarity:"${rarity}"`);
        if (set) queryParts.push(`set.id:"${set}"`);

        const query = queryParts.join(' ');

        const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=50`;
        const response = await fetch(url);
        const data = await response.json();

        cartasEncontradas = data.data || [];
        resultsGrid.innerHTML = '';

        if (cartasEncontradas.length > 0) {
            cartasEncontradas.forEach((carta, index) => {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                gridItem.style.cursor = 'pointer';
                gridItem.setAttribute('onclick', `selecionarCarta(${index})`);
                
                const img = document.createElement('img');
                img.src = carta.images.small;
                img.alt = carta.name;
                
                gridItem.appendChild(img);
                resultsGrid.appendChild(gridItem);
            });
        } else {
            resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: gray;">Nenhuma carta encontrada com esses critérios.</p>';
        }

    } catch (error) {
        console.error(error);
        resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Erro ao conectar com a API de Pokémon.</p>';
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