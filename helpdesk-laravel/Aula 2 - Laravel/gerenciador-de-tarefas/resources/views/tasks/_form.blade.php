{{-- Este arquivo é compartilhado entre create.blade.php e edit.blade.php --}}
{{-- para não repetir o mesmo formulário duas vezes (princípio DRY). --}}

<div class="mb-3">
    <label class="form-label">Título</label>
    <input
        type="text"
        name="title"
        class="form-control @error('title') is-invalid @enderror"
        value="{{ old('title', $task->title ?? '') }}"
    >
    @error('title')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

<div class="mb-3">
    <label class="form-label">Descrição</label>
    <textarea
        name="description"
        rows="3"
        class="form-control @error('description') is-invalid @enderror"
    >{{ old('description', $task->description ?? '') }}</textarea>
    @error('description')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

<div class="row">
    <div class="col-md-4 mb-3">
        <label class="form-label">Status</label>
        @php $currentStatus = old('status', $task->status ?? 'pendente'); @endphp
        <select name="status" class="form-select @error('status') is-invalid @enderror">
            <option value="pendente" @selected($currentStatus === 'pendente')>Pendente</option>
            <option value="em_andamento" @selected($currentStatus === 'em_andamento')>Em andamento</option>
            <option value="concluida" @selected($currentStatus === 'concluida')>Concluída</option>
        </select>
        @error('status')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>

    <div class="col-md-4 mb-3">
        <label class="form-label">Data de vencimento</label>
        <input
            type="date"
            name="due_date"
            class="form-control @error('due_date') is-invalid @enderror"
            value="{{ old('due_date', isset($task) && $task->due_date ? $task->due_date->format('Y-m-d') : '') }}"
        >
        @error('due_date')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>

    <div class="col-md-4 mb-3">
        <label class="form-label">Categoria</label>
        @php $currentCategoryId = (int) old('category_id', $task->category_id ?? 0); @endphp
        <select name="category_id" class="form-select">
            <option value="">Sem categoria</option>
            @foreach ($categories as $category)
                <option value="{{ $category->id }}" @selected($currentCategoryId === $category->id)>
                    {{ $category->name }}
                </option>
            @endforeach
        </select>
    </div>
</div>
