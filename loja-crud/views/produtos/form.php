<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><?= !empty($produto) ? 'Editar Produto' : 'Novo Produto' ?></h4>
    <a href="index.php?pagina=produtos" class="btn btn-outline-secondary btn-sm">Voltar</a>
</div>
<div class="card border-0 shadow-sm">
    <div class="card-body">
        <form method="POST" action="index.php?pagina=produtos&acao=salvar">
            <?php if (!empty($produto['id'])): ?><input type="hidden" name="id" value="<?= $produto['id'] ?>"><?php endif; ?>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Nome *</label>
                    <input type="text" name="nome" class="form-control" value="<?= htmlspecialchars($produto['nome'] ?? '') ?>" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Categoria</label>
                    <select name="categoria_id" class="form-select">
                        <option value="">— Selecione —</option>
                        <?php foreach ($categorias as $cat): ?>
                        <option value="<?= $cat['id'] ?>" <?= ($produto['categoria_id']??'')==$cat['id']?'selected':'' ?>>
                            <?= htmlspecialchars($cat['nome']) ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-12">
                    <label class="form-label">Descrição</label>
                    <textarea name="descricao" class="form-control" rows="2"><?= htmlspecialchars($produto['descricao'] ?? '') ?></textarea>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Preço *</label>
                    <div class="input-group">
                        <span class="input-group-text">R$</span>
                        <input type="text" name="preco" class="form-control" value="<?= number_format($produto['preco'] ?? 0, 2, ',', '.') ?>" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Estoque *</label>
                    <input type="number" name="qtd_estoque" class="form-control" value="<?= $produto['qtd_estoque'] ?? 0 ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Estoque Mínimo</label>
                    <input type="number" name="estoque_minimo" class="form-control" value="<?= $produto['estoque_minimo'] ?? 5 ?>">
                </div>
                <div class="col-12">
                    <div class="form-check">
                        <input type="checkbox" name="ativo" class="form-check-input" id="ativo" <?= ($produto['ativo'] ?? 1) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="ativo">Ativo</label>
                    </div>
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg"></i> Salvar</button>
                </div>
            </div>
        </form>
    </div>
</div>
