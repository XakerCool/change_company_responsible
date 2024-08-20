const { Bitrix } = require("@2bad/bitrix");
const {logError} = require("../logger/logger");

class CompaniesService {
    bx;

    constructor(link) {
        this.bx = Bitrix(link);
    }

    async getCompany(companyId) {
        try {
            const company = (await this.bx.companies.get(companyId)).result;
            return {
                ID: company.ID,
                TITLE: company.TITLE,
                ASSIGNED_BY_ID: company.ASSIGNED_BY_ID,
                DATE_MODIFY: company.DATE_MODIFY
            };
        } catch (error) {
            logError("CompanyService getCompany", error);
            return null;
        }
    }

    async changeCompanyResponsible(companyId) {
        try {
            return (await this.bx.companies.update(companyId, {"ASSIGNED_BY_ID": "1"})).result;
        } catch (error) {
            logError("CompanyService changeCompanyResponsible", error);
            return null;
        }
    }

    checkIsThereSuccessfulDealsLast90Days(deals) {
        try {
            if (deals.length <= 0) {
                return false;
            }
            const currentDate = new Date();

            for (const deal of deals) {
                const dealLastActivity = new Date(deal.CLOSEDATE);

                const differenceInTime = currentDate - dealLastActivity;
                const differenceInDays = differenceInTime / (1000 * 3600 * 24);

                if (differenceInDays <= 90) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            logError("CompanyService checkIsThereSuccessfulDealsLast90Days", error);
            return null;
        }
    }

    checkIsThereChangesLast30Days(companyDateModify) {
        try {
            const currentDate = new Date();
            const dateModify = new Date(companyDateModify);


            const differenceInTime = currentDate - dateModify;
            const differenceInDays = differenceInTime / (1000 * 3600 * 24);

            return differenceInDays <= 30;
        } catch (error) {
            logError("CompanyService checkIsThereChangesLast30Days", error);
            return null;
        }
    }

}

module.exports = { CompaniesService }