<div class="row g-4">
    <div class="col-md-3">
        <div class="card card-hover border-0 shadow-sm">
            <div class="card-body d-flex align-items-center">
                <div class="bg-primary bg-opacity-10 p-3 rounded me-3 text-primary">
                    <i class="bi bi-people fs-3"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Clientes</h6>
                    <h4 class="mb-0"><?= $totalClientes ?? 0 ?></h4>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card card-hover border-0 shadow-sm">
            <div class="card-body d-flex align-items-center">
                <div class="bg-success bg-opacity-10 p-3 rounded me-3 text-success">
                    <i class="bi bi-box-seam fs-3"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Produtos</h6>
                    <h4 class="mb-0"><?= $totalProdutos ?? 0 ?></h4>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card card-hover border-0 shadow-sm">
            <div class="card-body d-flex align-items-center">
                <div class="bg-warning bg-opacity-10 p-3 rounded me-3 text-warning">
                    <i class="bi bi-cart3 fs-3"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Pedidos</h6>
                    <h4 class="mb-0"><?= $totalPedidos ?? 0 ?></h4>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card card-hover border-0 shadow-sm">
            <div class="card-body d-flex align-items-center">
                <div class="bg-danger bg-opacity-10 p-3 rounded me-3 text-danger">
                    <i class="bi bi-currency-dollar fs-3"></i>
                </div>
                <div>
                    <h6 class="text-muted mb-1">Faturamento</h6>
                    <h4 class="mb-0">R$ <?= number_format($faturamento ?? 0, 2, ',', '.') ?></h4>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="mt-5">
    <h5>Bem-vindo ao Sistema de Loja</h5>
    <p class="text-muted">Use o menu lateral para navegar entre Clientes, Categorias, Produtos e Pedidos.</p>
</div>