<div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="m-0"><?= !empty($cliente) ? 'Editar Cliente' : 'Novo Cliente' ?></h4>
    <a href="index.php?pagina=clientes" class="btn btn-outline-secondary btn-sm">Voltar</a>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-body">
        <form method="POST" action="index.php?pagina=clientes&acao=salvar">
            <?php if (!empty($cliente['id'])): ?>
                <input type="hidden" name="id" value="<?= $cliente['id'] ?>">
            <?php endif; ?>

            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Nome *</label>
                    <input type="text" name="nome" class="form-control" value="<?= htmlspecialchars($cliente['nome'] ?? '') ?>" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Email *</label>
                    <input type="email" name="email" class="form-control" value="<?= htmlspecialchars($cliente['email'] ?? '') ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">CPF *</label>
                    <input type="text" name="cpf" class="form-control" value="<?= htmlspecialchars($cliente['cpf'] ?? '') ?>" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Telefone</label>
                    <input type="text" name="telefone" class="form-control" value="<?= htmlspecialchars($cliente['telefone'] ?? '') ?>">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Data de Nascimento</label>
                    <input type="date" name="data_nascimento" class="form-control" value="<?= htmlspecialchars($cliente['data_nascimento'] ?? '') ?>">
                </div>
                <div class="col-12">
                    <div class="form-check">
                        <input type="checkbox" name="ativo" class="form-check-input" id="ativo" <?= ($cliente['ativo'] ?? 1) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="ativo">Ativo</label>
                    </div>
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-check-lg"></i> Salvar
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
