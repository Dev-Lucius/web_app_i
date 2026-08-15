<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0">Novo Pedido</h4>
    <a href="index.php?pagina=pedidos" class="btn btn-outline-secondary btn-sm">Voltar</a>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-body">
        <form method="POST" action="index.php?pagina=pedidos&acao=salvar" id="formPedido">
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label">Cliente *</label>
                    <select name="cliente_id" id="cliente_id" class="form-select" required>
                        <option value="">— Selecione —</option>
                        <?php foreach ($clientes as $c): ?>
                        <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['nome']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Endereço de Entrega</label>
                    <select name="endereco_entrega_id" id="endereco_id" class="form-select">
                        <option value="">— Selecione um cliente primeiro —</option>
                    </select>
                </div>
                <div class="col-12">
                    <label class="form-label">Observação</label>
                    <textarea name="observacao" class="form-control" rows="2"></textarea>
                </div>
            </div>

            <h6 class="mb-3">Itens do Pedido</h6>
            <table class="table table-bordered" id="tabelaItens">
                <thead class="table-light">
                    <tr>
                        <th style="width:40%">Produto</th>
                        <th style="width:15%">Qtd</th>
                        <th style="width:20%">Preço Unit.</th>
                        <th style="width:20%">Subtotal</th>
                        <th style="width:5%"></th>
                    </tr>
                </thead>
                <tbody id="corpoItens"></tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                        <td colspan="2"><strong id="totalPedido">R$ 0,00</strong></td>
                    </tr>
                </tfoot>
            </table>

            <button type="button" class="btn btn-outline-primary btn-sm mb-3" onclick="adicionarItem()">
                <i class="bi bi-plus-lg"></i> Adicionar Produto
            </button>

            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-success"><i class="bi bi-check-lg"></i> Finalizar Pedido</button>
            </div>
        </form>
    </div>
</div>

<script>
const produtos = <?= json_encode($produtos) ?>;
const enderecos = <?= json_encode($enderecos) ?>;

// Filtrar endereços por cliente
document.getElementById('cliente_id').addEventListener('change', function() {
    const clienteId = this.value;
    const sel = document.getElementById('endereco_id');
    sel.innerHTML = '<option value="">— Selecione —</option>';
    enderecos.filter(e => e.cliente_id == clienteId).forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.text = e.logradouro + ', ' + e.numero + ' — ' + e.cidade;
        sel.appendChild(opt);
    });
});

let contador = 0;
function adicionarItem() {
    contador++;
    const tbody = document.getElementById('corpoItens');
    const tr = document.createElement('tr');
    tr.id = 'item_' + contador;

    let opts = '<option value="">— Selecione —</option>';
    produtos.forEach(p => {
        opts += `<option value="${p.id}" data-preco="${p.preco}" data-estoque="${p.qtd_estoque}">${p.nome} (Estoque: ${p.qtd_estoque})</option>`;
    });

    tr.innerHTML = `
        <td><select name="produto_id[]" class="form-select produto-select" onchange="calcularLinha(this)" required>${opts}</select></td>
        <td><input type="number" name="quantidade[]" class="form-control qtd-input" value="1" min="1" onchange="calcularLinha(this)"></td>
        <td><input type="text" class="form-control preco-display" readonly value="R$ 0,00"></td>
        <td><input type="text" class="form-control subtotal-display" readonly value="R$ 0,00"></td>
        <td><button type="button" class="btn btn-sm btn-outline-danger" onclick="removerItem('item_${contador}')"><i class="bi bi-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
}

function removerItem(id) {
    document.getElementById(id).remove();
    calcularTotal();
}

function calcularLinha(el) {
    const tr = el.closest('tr');
    const select = tr.querySelector('.produto-select');
    const qtd = parseInt(tr.querySelector('.qtd-input').value) || 0;
    const opt = select.selectedOptions[0];
    const preco = parseFloat(opt.dataset.preco) || 0;
    const estoque = parseInt(opt.dataset.estoque) || 0;

    if (qtd > estoque) {
        alert('Quantidade maior que o estoque disponível (' + estoque + ')');
        tr.querySelector('.qtd-input').value = estoque;
        return calcularLinha(el);
    }

    tr.querySelector('.preco-display').value = 'R$ ' + preco.toLocaleString('pt-BR', {minimumFractionDigits:2});
    tr.querySelector('.subtotal-display').value = 'R$ ' + (preco * qtd).toLocaleString('pt-BR', {minimumFractionDigits:2});
    calcularTotal();
}

function calcularTotal() {
    let total = 0;
    document.querySelectorAll('#corpoItens tr').forEach(tr => {
        const select = tr.querySelector('.produto-select');
        const qtd = parseInt(tr.querySelector('.qtd-input').value) || 0;
        const preco = parseFloat(select.selectedOptions[0]?.dataset.preco) || 0;
        total += preco * qtd;
    });
    document.getElementById('totalPedido').textContent = 'R$ ' + total.toLocaleString('pt-BR', {minimumFractionDigits:2});
}

// Adicionar primeiro item automaticamente
adicionarItem();
</script>
