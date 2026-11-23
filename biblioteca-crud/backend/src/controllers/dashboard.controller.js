
import * as dashboardService from "../services/dashboard.service.js";

/*
|--------------------------------------------------------------------------
| BUSCAR DADOS DO DASHBOARD
|--------------------------------------------------------------------------
| GET /api/dashboard
|--------------------------------------------------------------------------
*/

export async function buscarDadosDashboard(req, res) {

    try {

        const dados =
            await dashboardService.buscarDadosDashboardService();

        return res.status(200).json(dados);

    } catch (error) {

        console.error("Erro ao buscar dados do Dashboard:", error);

        return res.status(500).json({
            erro: "Não foi possível carregar os dados do Dashboard.",
        });
    }
}
