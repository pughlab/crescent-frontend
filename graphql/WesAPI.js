const { RESTDataSource } = require('apollo-datasource-rest');

module.exports = {
    WesAPI: class WesAPI extends RESTDataSource {
        constructor(){
            super();
            this.baseURL = `http://wes-server:${process.env.WES_PORT}`;
        }
        
        // Warning: Do not use this if the wesID does not exist because it will make an empty workflow
        async getStatus(wesID) {
            return this.get(`ga4gh/wes/v1/runs/${wesID}/status`);
        }

        async getRunData(wesID){
            return this.get(`/ga4gh/wes/v1/runs/${wesID}`);
        }

        async cancelRun(runID) {
            return this.post(`/ga4gh/wes/v1/runs/${runID}/cancel`)
        }

        async getLogs(runID) {
            return this.get(`/ga4gh/wes/v1/runs/${runID}/logs`);
        }

        async getCompletedOn({isSecondaryRun=false, runID, state, submittedOnTime, wesID}) {
            return state == 'EXECUTOR_ERROR' ? (
                this.get(`/ga4gh/wes/v1/runs/completed-on?state=${state}&wes_id=${wesID}`)
            ) : ( // COMPLETE
                this.get(`/ga4gh/wes/v1/runs/completed-on?is_secondary_run=${isSecondaryRun}&run_id=${runID}&state=${state}&submitted_on_time=${submittedOnTime}&wes_id=${wesID}`)
            );
        }
    }
}