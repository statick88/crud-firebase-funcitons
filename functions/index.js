const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require('express');
const bodyParser = require('body-parser');
const serviceAccount = require("./permisos.json");

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(bodyParser.json());

app.get('/hello-world', (req, res) => {
    res.send('Hello World');
});

// Create a new product
app.post('/api/products', async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).send({ error: 'ID and Name are required' });
        }

        await db.collection('products').doc(id).set({ name });
        return res.status(204).send();
    } catch (error) {
        console.error("Error adding document: ", error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const querySnapshot = await db.collection('products').get();
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).send(products);
    } catch (error) {
        console.error("Error getting documents: ", error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get a product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error getting document: ", error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ error: 'Name is required' });
        }

        await db.collection('products').doc(req.params.id).update({ name });
        return res.status(204).send();
    } catch (error) {
        console.error("Error updating document: ", error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.collection('products').doc(req.params.id).delete();
        return res.status(204).send();
    } catch (error) {
        console.error("Error deleting document: ", error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

exports.app = functions.https.onRequest(app);
