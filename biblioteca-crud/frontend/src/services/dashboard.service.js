
import api from "./api";

/*
|--------------------------------------------------------------------------
| SERVIÇO DO DASHBOARD
|--------------------------------------------------------------------------
| Responsável pelas requisições relacionadas ao Dashboard.
|--------------------------------------------------------------------------
*/

export async function buscarDadosDashboard() {

    const resposta = await api.get("/dashboard");

    return resposta.data;
}
