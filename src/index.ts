import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import { userConverter, User } from "./converter";

const app = express();

// allows the functions to run somewhere separate from your client.
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

exports.app = functions.https.onRequest(app);

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://niceproject-282023.firebaseio.com",
});

const db = admin.firestore();

// readOne
app.get("/:collection/:id", (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  db.collection(collection)
    .doc(id)
    .withConverter(userConverter)
    .get()
    .then(doc => {
      if (doc.exists) return res.status(200).send(doc.data());
      else return res.status(200).send({});
    })
    .catch(error => {
      return res.status(500).send(error);
    });
});

// readMany => max 10 items
app.get("/:collection", (req, res) => {
  const collection = req.params.collection;

  let limit: number;
  if (req.query.limit) {
    limit = Number.parseInt(req.query.limit?.toString());
  } else {
    limit = 10;
  }

  db.collection(collection)
    .limit(limit)
    .withConverter(userConverter)
    .get()
    .then(doc => {
      if (doc.empty) res.status(200).send([]);
      else
        res
          .status(200)
          .send(
            doc.docs.map((dc: FirebaseFirestore.QueryDocumentSnapshot<User>) =>
              dc.data()
            )
          );
    })
    .catch((error: any) => {
      return res.status(500).send(error);
    });
});

// Create
app.post("/:collection", (req, res) => {
  const collection = req.params.collection;
  const docData = JSON.parse(JSON.stringify(req.body));

  db.collection(collection)
    .add(docData)
    .then(docRef => {
      return res.status(200).send(docRef);
    })
    .catch(error => {
      return res.status(500).send(error);
    });
});

// Update
app.post("/:collection/:id", (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  const docData = JSON.parse(JSON.stringify(req.body));

  db.collection(collection)
    .doc(id)
    .set(docData)
    .then(docRef => {
      return res.status(200).send(docRef);
    })
    .catch(error => {
      return res.status(500).send(error);
    });
});

// class Database {
//   project_id!: string;
//   cache_max_age!: number;
//   cache_allocated_memory!: number;
// }

// export default Database;
