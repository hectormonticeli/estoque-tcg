window.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderizarEstoque, 300);
});

let estoqueLocal = [];

function renderizarEstoque() {
    let estoqueRaw = obterEstoque();
    
    // Filtra para garantir que apenas itens válidos com idUnico sejam processados
    estoqueLocal = estoqueRaw.filter(item => {
        if (!item.idUnico) {
            console.warn(`Carta corrompida ou antiga ignorada: ${item.name}`);
            return false;
        }
        return true;
    });

    if (estoqueLocal.length !== estoqueRaw.length) {
        salvarEstoque(estoqueLocal);
    }

    filtrarEstoque();
}

function filtrarEstoque() {
    const nomeFiltro = document.getElementById('filterName').value.toLowerCase();
    const estadoFiltro = document.getElementById('filterCondition').value;
    const raridadeFiltro = document.getElementById('filterRarity').value;
    const estiloFiltro = document.getElementById('filterSubtype').value;
    const estoqueGrid = document.getElementById('estoqueGrid');
    
    estoqueGrid.innerHTML = '';

    // Atualiza o painel com o valor do estoque total original
    atualizarValorTotal(estoqueLocal);

    // CASO 1: Estoque está genuinamente vazio
    if (estoqueLocal.length === 0) {
        estoqueGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: gray; font-size: 1.1em;">
                <p>Seu estoque está vazio. 📭</p>
                <p style="font-size: 0.9em; margin-top: 5px;">Vá na aba <strong>"Buscar Cartas"</strong> para adicionar sua primeira carta!</p>
            </div>
        `;
        return;
    }

    // Filtros aplicados localmente baseados nas características salvas na carta
    const estoqueFiltrado = estoqueLocal.filter(item => {
        const correspondeNome = item.name.toLowerCase().includes(nomeFiltro);
        const correspondeEstado = estadoFiltro === "" || item.estado.includes(estadoFiltro);
        const correspondeRaridade = raridadeFiltro === "" || item.rarity.toLowerCase().includes(raridadeFiltro.toLowerCase());
        
        // Para verificar o estilo, checamos se o nome do estilo escolhido está contido na raridade ou subtipos se existirem
        const correspondeEstilo = estiloFiltro === "" || 
            (item.rarity && item.rarity.toUpperCase().includes(estiloFiltro)) ||
            (item.name && item.name.toUpperCase().includes(estiloFiltro));

        return correspondeNome && correspondeEstado && correspondeRaridade && correspondeEstilo;
    });

    // CASO 2: Existem cartas, mas o filtro ativo as escondeu todas
    if (estoqueFiltrado.length === 0) {
        estoqueGrid.innerHTML = `
            <p style="grid-column: 1 / -1; text-align: center; color: gray; padding: 20px; font-weight: 500;">
                Nenhuma carta no seu estoque corresponde aos filtros aplicados. 🔎
            </p>
        `;
        return;
    }

    // Renderiza as cartas filtradas normalmente
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
                <p style="font-size: 0.85em; margin: 3px 0; font-weight: bold; color: #e3350d;">
                    ✨ ${item.estado.split(' ')[0]}
                </p>
                <p class="price" style="margin: 5px 0;">Un: ${precoExibicao}</p>
                <p style="font-weight: bold; font-size: 1em; margin: 5px 0;">Qtd: <span>${item.quantidade}</span></p>
            </div>
            
            <div class="card-actions">
                <button class="secondary" onclick="alterarQuantidade('${item.idUnico}', 1)">+</button>
                <button class="secondary" onclick="alterarQuantidade('${item.idUnico}', -1)">-</button>
                <button class="danger" onclick="removerDoEstoque('${item.idUnico}')">Excluir</button>
            </div>
        `;

        estoqueGrid.appendChild(cardItem);
    });
}

function alterarQuantidade(idUnico, delta) {
    let estoque = obterEstoque();
    const index = estoque.findIndex(item => item.idUnico === idUnico);

    if (index !== -1) {
        estoque[index].quantidade += delta;
        
        if (estoque[index].quantidade <= 0) {
            estoque.splice(index, 1);
        }
        
        salvarEstoque(estoque);
        renderizarEstoque();
    }
}

function removerDoEstoque(idUnico) {
    if (confirm("Deseja realmente remover este lote do seu estoque?")) {
        let estoque = obterEstoque();
        estoque = estoque.filter(item => item.idUnico !== idUnico);
        salvarEstoque(estoque);
        renderizarEstoque();
    }
}

function atualizarValorTotal(estoque) {
    if (!estoque || estoque.length === 0) {
        document.getElementById('statsPanel').innerText = `Valor Total do Estoque: R$ 0,00`;
        return;
    }

    let valorTotalBRL = 0;

    estoque.forEach(item => {
        if (item.priceUSD) {
            const precoCartaBRL = item.priceUSD * cotacaoDolar;
            valorTotalBRL += (precoCartaBRL * item.quantidade);
        }
    });

    document.getElementById('statsPanel').innerText = `Valor Total do Estoque: R$ ${valorTotalBRL.toFixed(2)}`;
}