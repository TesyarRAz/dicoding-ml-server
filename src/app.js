const Hapi = require('@hapi/hapi');
const { loadModel, predict } = require('./inference');
const { storePredictions, getPredictions } = require('./firestore');

(async () => {
    const model = await loadModel();
    console.log('Model loaded successfully');

    const server = Hapi.server({
        port: process.env.PORT || 8080,
        routes: {
            cors: true
        }
    })

    server.route({
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
                failAction: (request, h, err) => {
                    if (err.output.statusCode == 413) {
                        return h.response({
                            "status": "fail",
                            "message": "Payload content length greater than maximum allowed: 1000000"
                        })
                        .code(413)
                        .takeover();
                    }

                    return h.continue();
                }
            },
        },
        handler: async (request, h) => {
            const { image } = request.payload;

            try {
                const [prob] = await predict(model, image);

                let data = {};

                if (prob >= 1) {
                    data = {
                        result: 'Cancer',
                        suggestion: 'Segera periksa ke dokter!'
                    };
                } else {
                    data = {
                        result: 'Non-cancer',
                        suggestion: 'Penyakit kanker tidak terdeteksi.'
                    };
                }

                data = await storePredictions(data);

                return h.response({
                    "status": "success",
                    "message": "Model is predicted successfully",
                    "data": data,
                })
                .code(201);
            } catch (error) {
                console.error(error);
            }

            return h.response({
                "status": "fail",
                "message": "Terjadi kesalahan dalam melakukan prediksi"
            })
            .code(400);
        },
    })

    server.route({
        method: 'GET',
        path: '/predict/histories',
        handler: async (request, h) => {
            return h.response({
                "status": "success",
                "data": await getPredictions()
            })
        }
    })

    await server.start();

    console.log('Server running on %s', server.info.uri);
})()