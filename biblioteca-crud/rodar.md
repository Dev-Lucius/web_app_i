## Fazer Login

```curl
 curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lucas@email.com",
    "senha": "123456789"
  }'
```

 ## Inserindo o Token

 - 1. Abrir o Console e Colocar 

```bash
localStorage.setItem("token", '');
Boolean(localStorage.getItem("token"))
```
