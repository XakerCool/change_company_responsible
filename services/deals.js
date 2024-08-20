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
                    "select": ["ID", "TITLE", "COMPANY_ID", "STAGE_ID", "STAGE_SEMANTIC_ID", "DATE_CREATE", "DATE_MODIFY", "CLOSEDATE"],
                    "filter": {"=COMPANY_ID": companyId, "=STAGE_SEMANTIC_ID": "S"},
                })
            ).result;
        } catch (error) {
            logError("DealsService getDealsListFilterByCompanyId", error);
            return null;
        }
    }
}

module.exports = { DealsService }