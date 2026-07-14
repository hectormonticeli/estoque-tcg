// Aguarda a cotação do dólar e as funções estarem prontas
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderizarEstoque, 300);
});

// Guardamos o estoque em uma variável para podermos filtrar sem perder os dados originais
let estoqueLocal = [];

function renderizarEstoque() {
    estoqueLocal = obterEstoque();
    filtrarEstoque(); // Renderiza aplicando qualquer filtro ativo
}

function filtrarEstoque() {
    const nomeFiltro = document.getElementById('filterName').value.toLowerCase();
    const raridadeFiltro = document.getElementById('filterRarity').value;
    const estoqueGrid = document.getElementById('estoqueGrid');
    
    estoqueGrid.innerHTML = '';

    // Filtragem local
    const estoqueFiltrado = estoqueLocal.filter(item => {
        const correspondeNome = item.name.toLowerCase().includes(nomeFiltro);
        const correspondeRaridade = raridadeFiltro === "" || item.rarity.includes(raridadeFiltro);
        return correspondeNome && correspondeRaridade;
    });

    // Atualiza o valor total da coleção baseado no estoque ORIGINAL (sem filtros)
    atualizarValorTotal(estoqueLocal);

    if (estoqueFiltrado.length === 0) {
        estoqueGrid.innerHTML = '<p style="text-align: center; width: 100%; color: gray;">Nenhuma carta corresponde aos filtros aplicados.</p>';
        return;
    }

    estoqueFiltrado.forEach(item => {
        const cardItem = document.createElement('div');
        cardItem.className = 'grid-item';

        const precoBRL = item.priceUSD ? (item.priceUSD * cotacaoDolar) : 0;
        const precoExibicao = precoBRL > 0 ? `R$ ${precoBRL.toFixed(2)}` : 'N/A';

        cardItem.innerHTML = `
            <div>
                <img src="${item.image}" alt="${item.name}">
                <h3 style="margin: 5px 0; font-size: 1.1em;">${item.name}</h3>
                <p style="font-size: 0.85em; margin: 3px 0; color: gray;">${item.set} (${item.number})</p>
                <p class="price" style="margin: 5px 0;">${precoExibicao}</p>
                <p style="font-weight: bold; font-size: 1em; margin: 5px 0;">Qtd: <span>${item.quantidade}</span></p>
            </div>
            
            <div class="card-actions">
                <button class="secondary" onclick="alterarQuantidade('${item.id}', 1)">+</button>
                <button class="secondary" onclick="alterarQuantidade('${item.id}', -1)">-</button>
                <button class="danger" onclick="removerDoEstoque('${item.id}')">Excluir</button>
            </div>
        `;

        estoqueGrid.appendChild(cardItem);
    });
}

// Altera a quantidade direto do estoque (+1 ou -1)
function alterarQuantidade(id, delta) {
    let estoque = obterEstoque();
    const index = estoque.findIndex(item => item.id === id);

    if (index !== -1) {
        estoque[index].quantidade += delta;
        
        if (estoque[index].quantidade <= 0) {
            estoque.splice(index, 1);
        }
        
        salvarEstoque(estoque);
        renderizarEstoque();
    }
}

// Remove o item por completo do estoque
function removerDoEstoque(id) {
    if (confirm("Deseja realmente remover esta carta do seu estoque?")) {
        let estoque = obterEstoque();
        estoque = estoque.filter(item => item.id !== id);
        salvarEstoque(estoque);
        renderizarEstoque();
    }
}

// Calcula e exibe o valor financeiro acumulado das cartas
function atualizarValorTotal(estoque) {
    let valorTotalBRL = 0;

    estoque.forEach(item => {
        if (item.priceUSD) {
            const precoCartaBRL = item.priceUSD * cotacaoDolar;
            valorTotalBRL += (precoCartaBRL * item.quantidade);
        }
    });

    const statsPanel = document.getElementById('statsPanel');
    statsPanel.innerText = `Valor Total do Estoque: R$ ${valorTotalBRL.toFixed(2)}`;
}