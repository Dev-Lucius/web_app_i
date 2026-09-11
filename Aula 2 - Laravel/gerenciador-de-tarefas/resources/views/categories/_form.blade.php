<div class="mb-3">
    <label class="form-label">Nome</label>
    <input
        type="text"
        name="name"
        class="form-control @error('name') is-invalid @enderror"
        value="{{ old('name', $category->name ?? '') }}"
    >
    @error('name')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

<div class="mb-3">
    <label class="form-label">Descrição (opcional)</label>
    <input
        type="text"
        name="description"
        class="form-control @error('description') is-invalid @enderror"
        value="{{ old('description', $category->description ?? '') }}"
    >
    @error('description')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>
