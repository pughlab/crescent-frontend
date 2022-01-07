const { RESTDataSource } = require('apollo-datasource-rest');

module.exports = {
    WesAPI: class WesAPI extends RESTDataSource {
        constructor(){
            super();
            this.baseURL = `http://${process.env.WES_SERVER}:${process.env.WES_PORT}`;
        }
        
        // Warning: Do not use this if the wesID does not exist because it will make an empty workflow
        async getStatus(wesID) {
            return this.get(`ga4gh/wes/v1/runs/${wesID}/status`);
        }

        async getRunData(wesID){
            return this.get(`/ga4gh/wes/v1/runs/${wesID}`);
        }

        async cancelRun({annotationType=null, isSecondaryRun=false, runID}) {
            return this.post(`/ga4gh/wes/v1/runs/${runID}/cancel?annotation_type=${annotationType}&is_secondary_run=${isSecondaryRun}`)
        }

        async getLogs({annotationType=null, isSecondaryRun=false, runID}) {
            return this.get(`/ga4gh/wes/v1/runs/${runID}/logs?annotation_type=${annotationType}&is_secondary_run=${isSecondaryRun}`);
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