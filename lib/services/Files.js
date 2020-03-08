const fs = require('fs');

module.exports = function(roker) {
    return {
        /**
         * 
         * @param {*} options 
         * 
         */
        storeFile(options) {
            if (!options.filePath) {
                throw new Error('Roker.files.storeFile: fileName or filePath is not set', options);
            }

            const promise = new Promise((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        throw new Error('Roker.files.storeFile: error occured during accesing file', filePath);
                    }
    
                    const fileData = data.toString('base64');
                    
                    resolve(fileData);
                })
            });

            return promise.then(fileData => roker.files.storeData({
                    fileName: options.fileName,
                    fileData
                }));
        },
        /**
         * 
         * @param {*} options 
         */
        storeData(options = {}) {
            if (!options.fileData) {
                throw new Error('Roker.files.send: fileName or fileData is not set');
            }

            return roker.fetch('/files', {
                method: 'POST',
                body: {
                    fileName: options.fileName,
                    fileData: options.fileData
                }
            }).then(roker.checkResponseStatus)
            .catch(err => {
                console.error(err);
                throw new Error('Roker.files.storeData: An error occured during processing send file', err);
            });
        },
        /**
         * 
         * @param {*} options 
         */
        getFile(id) {
            if (!id) {
                throw new Error('Roker.files.getFile: No file id provided');
            }

            return roker.fetch(`/file/${id}`)
                .then(roker.checkResponseStatus)
                .catch(err => {
                    console.error(err);
                    throw new Error('Roker.files.getFile: An error occured during processing get file', err);
                });
        }
    };
};