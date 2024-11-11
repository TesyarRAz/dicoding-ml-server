const tfjs = require('@tensorflow/tfjs-node')


const loadModel = () => {
    const modelUrl = "file://models/model.json"
    return tfjs.loadGraphModel(modelUrl)
}

const predict = (model, imageBuffer) => {
    const tensor = tfjs.node
        .decodeImage(imageBuffer)
        .resizeBilinear([224, 224])
        .expandDims(0)
        .toFloat()

    return model.predict(tensor).data()
}

module.exports = {
    loadModel,
    predict
}