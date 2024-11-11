const {Firestore} = require('@google-cloud/firestore')
const { v7: uuidv7 } = require('uuid')

const db = new Firestore()

const predictionsCollection = () => {
    return db.collection('predictions')
}

const storePredictions = async (prediction) => {
    const collection = predictionsCollection();

    const { result, suggestion } = prediction;

    const input = {
        id: uuidv7(),
        result,
        suggestion,
        createdAt: Date.now().toString()
    };

    await collection.add(input);

    return input;
}

const getPredictions = async () => {
    const collection = predictionsCollection();

    const snapshot = await collection.get();

    return snapshot.docs.map(doc => doc.data());
}

module.exports = {
    storePredictions,
    getPredictions
}