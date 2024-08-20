const { Bitrix } = require("@2bad/bitrix");
const {logError} = require("../logger/logger");

class DealsService {
    bx;

    constructor(link) {
        this.bx = Bitrix(link);
    }

    async getDealsListFilterByCompanyId(companyId) {
        try {
            return (await this.bx.deals.list(
                {
                    "select": ["ID", "TITLE", "COMPANY_ID", "STAGE_ID", "DATE_CREATE", "DATE_MODIFY"],
                    "filter": {"=COMPANY_ID": companyId, "=STAGE_ID": "C174:WON"}
                })
            ).result;
        } catch (error) {
            logError("DealsService getDealsListFilterByCompanyId", error);
            return null;
        }
    }
}

module.exports = { DealsService }