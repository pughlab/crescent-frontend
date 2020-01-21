const { Worker, isMainThread, workerData } = require("worker_threads");
const AdmZip = require("adm-zip");

if (isMainThread) {
    module.exports = function zipThread(folder, output) {
        return new Promise((resolve, reject) => {
            const workerThread = new Worker(__filename, {
                workerData: { folder, output }
            });
            workerThread.on("message", resolve);
            workerThread.on("error", reject);
            workerThread.on("exit", code => {
                if (code === 0) {
                    resolve(null);
                } else {
                    reject(new Error(`Worker thread exited with code ${code}`));
                }
            });
        });
    }
} else {
    const { folder, output } = workerData;
    const zip = new AdmZip();
    zip.addLocalFolder(folder);
    zip.writeZip(output);
}
