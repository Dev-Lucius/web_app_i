<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><?= !empty($categoria) ? 'Editar Categoria' : 'Nova Categoria' ?></h4>
    <a href="index.php?pagina=categorias" class="btn btn-outline-secondary btn-sm">Voltar</a>
</div>
<div class="card border-0 shadow-sm">
    <div class="card-body">
        <form method="POST" action="index.php?pagina=categorias&acao=salvar">
            <?php if (!empty($categoria['id'])): ?><input type="hidden" name="id" value="<?= $categoria['id'] ?>"><?php endif; ?>
            <div class="mb-3">
                <label class="form-label">Nome *</label>
                <input type="text" name="nome" class="form-control" value="<?= htmlspecialchars($categoria['nome'] ?? '') ?>" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Descrição</label>
                <textarea name="descricao" class="form-control" rows="3"><?= htmlspecialchars($categoria['descricao'] ?? '') ?></textarea>
            </div>
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg"></i> Salvar</button>
        </form>
    </div>
</div>
