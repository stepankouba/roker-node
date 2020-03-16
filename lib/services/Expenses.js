const fs = require('fs');

module.exports = function(roker) {
    return {
        /**
         * 
         * @param {*} options 
         */
        createFromFile(options) {
            if (!options.filePath) {
                throw new RokerError('Roker.expenses.createFromFile: file path missing');
            }

            const promise = new Promise((resolve, reject) => {
                fs.readFile(options.filePath, (err, data) => {
                    if (err) {
                        throw new RokerError(`Roker.expenses.createFromFile: error occured during accesing file ${options.filePath}`);
                    }
    
                    const fileData = data.toString('base64');
                    resolve(fileData);
                })
            });

            return promise.then(fileData => roker.fetch('/expenses', {
                    method: 'post',
                    body: {
                        fileData
                    }
                }))
                .then(roker.checkResponseStatus)
                .catch(err => {
                    console.error(err);
                    throw new RokerError('Roker.expenses.createFromFile: An error occured', err);
                });
        },
        get(id) {
            return roker.fetch(`/expenses/${id}`)
                .then(roker.checkResponseStatus)
                .catch(err => {
                    console.error(err);
                    throw new RokerError('Roker.expenses.get: An error occured', err);
                });
        }
    };
};