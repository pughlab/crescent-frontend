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
    }
}