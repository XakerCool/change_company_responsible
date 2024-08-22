const express = require('express');
const bodyParser = require('body-parser');
const timeout = require("connect-timeout");
const cors = require("cors");
const dotenv = require('dotenv');
const path = require("path");

const {logError, logSuccess, logWarning} = require("./logger/logger");
const { DealsService } = require("./services/deals.js");
const { CompaniesService } = require("./services/companies.js");

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const PORT = 3560;
const app = express();

const link = process.env.BX_LINK;
const dealsService = new DealsService(link);
const companiesService = new CompaniesService(link);

app.use(cors({
    origin: "*",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(timeout('20m'));

app.post("/change_resp/change_responsible/:ID", async (req, res) => {
    try {
        const companyId = req.params.ID;
        const company = await companiesService.getCompany(companyId);
        const deals = await dealsService.getDealsListFilterByCompanyId(companyId);

        let lastSuccessfulDealDate = null;
        if (deals.length > 0) {
            lastSuccessfulDealDate = deals.reduce((latestDate, deal) => {
                const dealDate = new Date(deal.DATE_MODIFY);
                return dealDate > latestDate ? dealDate : latestDate;
            }, new Date(0));
        }

        const isThereChangesInCompanyLast30Days = companiesService.checkIsThereChangesLast30Days(company.DATE_MODIFY);
        const isThereSuccessfulDealsLast90Days = companiesService.checkIsThereSuccessfulDealsLast90Days(deals);
        const isThereAnyDealsLast30Days = companiesService.checkIsThereAnyDealsLast30Days(deals);

        if (isThereChangesInCompanyLast30Days === false && isThereSuccessfulDealsLast90Days === false && isThereAnyDealsLast30Days === false) {
            const changeOperationResult = await companiesService.changeCompanyResponsible(companyId);
            if (changeOperationResult) {
                logSuccess("/change_resp/change_responsible/", `Ответственный у компании с ID: ${companyId} успешно сменен на 1. Дата последних изменений в компании: ${company.DATE_MODIFY}. Дата последней успешной сделки: ${lastSuccessfulDealDate}`);
                res.status(200).json({"status": true, "status_msg": "success", "message": `Ответственный у компании с ID: ${companyId} успешно сменен на 1`});
            } else {
                logError("/change_resp/change_responsible/", `Возникла ошибка при смене ответственного у компании ${companyId}`)
                res.status(500).json({"status": false, "status_msg": "error", "message": `Возникла ошибка при смене ответственного у компании ${companyId}`});
            }
        } else {
            logWarning("/change_resp/change_responsible/", `${companyId} - успешная сделка за последние 90 дней или изменения за последние 30 дней. Ответственный не сменен. Дата последних изменений в компании: ${company.DATE_MODIFY}. Дата последней успешной сделки: ${lastSuccessfulDealDate}`);
            res.status(400).json({"status": true, "status_msg": "no changes", "message": "Входные данные не подходят для изменения компании"});
        }
    } catch (error) {
        logError("/change_resp/change_responsible/", error);
        res.status(500).json({"status": false, "status_msg": "error", "message": "сервер вернул ошибку"});
    }
})

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
})