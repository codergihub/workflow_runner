const runMain = (mainpath) => {
    return new Promise((resolve, reject) => {

        // import workerExample.js script..

        const worker = new Worker(mainpath, {});
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`stopped with  ${code} exit code`));
        })
    })
}

module.exports = { runMain }
