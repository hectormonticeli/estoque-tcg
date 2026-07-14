// Aguarda a cotação do dólar e as funções estarem prontas para desenhar o estoque
window.addEventListener('DOMContentLoaded', () => {
    // Dá um pequeno atraso para garantir que a cotação do dólar foi carregada do api.js
    setTimeout(renderizarEstoque, 300);
});

function renderizarEstoque() {
    const estoque = obterEstoque();
    const estoqueGrid = document.getElementById('estoqueGrid');
    
    estoqueGrid.innerHTML = '';

    if (estoque.length === 0) {
        estoqueGrid.innerHTML = '<p style="text-align: center; width: 100%; color: gray;">Seu estoque está vazio. Vá em "Buscar Cartas" para adicionar alguma!</p>';
        return;
    }

    estoque.forEach(item => {
        const cardItem = document.createElement('div');
        cardItem.className = 'grid-item';

        // Calcula o preço total desse lote em Real
        const precoBRL = item.priceUSD ? (item.priceUSD * cotacaoDolar) : 0;
        const precoExibicao = precoBRL > 0 ? `R$ ${precoBRL.toFixed(2)}` : 'N/A';

        cardItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p style="font-size: 0.9em; margin: 5px 0; color: gray;">${item.set} (${item.number})</p>
            <p class="price" style="margin: 5px 0;">${precoExibicao}</p>
            <p style="font-weight: bold; font-size: 1.1em; margin: 10px 0;">Quantidade: <span id="qtd-${item.id}">${item.quantidade}</span></p>
            
            <div style="display: flex; gap: 5px; justify-content: center; margin-top: 10px;">
                <button class="secondary" onclick="alterarQuantidade('${item.id}', 1)">+</button>
                <button class="secondary" onclick="alterarQuantidade('${item.id}', -1)">-</button>
                <button class="danger" onclick="removerDoEstoque('${item.id}')">Remover</button>
            </div>
        `;

        estoqueGrid.appendChild(cardItem);
    });
}

// Altera a quantidade de uma carta diretamente pelo estoque (+1 ou -1)
function alterarQuantidade(id, delta) {
    let estoque = obterEstoque();
    const index = estoque.findIndex(item => item.id === id);

    if (index !== -1) {
        estoque[index].quantidade += delta;
        
        // Se a quantidade chegar a 0, removemos o item
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