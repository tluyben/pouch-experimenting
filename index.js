// import pouchdb
import PouchDB from 'pouchdb';
// import pouchdb-replication-stream
import PouchDBReplicationStream from 'pouchdb-replication-stream';
// import pouchdb-adapter-memory
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
// import Falso 
import Falso from '@ngneat/falso';
// import memory-stream
import MemoryStream from 'memorystream';

// create a new replication stream
//PouchDB.plugin(PouchDBReplicationStream.plugin);
//PouchDB.adapter('writableStream', PouchDBReplicationStream.adapters.writableStream);

// add the memory adapter
PouchDB.plugin(PouchDBMemoryAdapter);

// create an array with two pouch db instances; 
const couchdb = 'http://admin:admin@localhost:5984/db1';
const db = [new PouchDB('db1', { 'adapter': 'memory' }), new PouchDB('db2', { 'adapter': 'memory' })];

// playing with couch
db[0] = new PouchDB(couchdb);

var stream = new MemoryStream();

db[0].sync(db[1], { live: true, retry: true }).on('change', function (change) {
    console.log(0, JSON.stringify(change, null, 2));
}).on('paused', function (info) {
    // replication was paused, usually because of a lost connection
}).on('active', function (info) {
    // replication was resumed
}).on('error', function (err) {
    // totally unhandled error (shouldn't happen)
});
db[1].sync(db[0], { live: true, retry: true }).on('change', function (change) {
    console.log(1, JSON.stringify(change, null, 2));
}).on('paused', function (info) {
    // replication was paused, usually because of a lost connection
}).on('active', function (info) {
    // replication was resumed
}).on('error', function (err) {
    // totally unhandled error (shouldn't happen)
});

(async () => {

    // create an infinite loop; 
    while (true) {
        // pick a random db from the list 
        const randomDb = db[Math.floor(Math.random() * db.length)];
        // pick a random value that is either 0 or 1 
        const randomValue = Math.floor(Math.random() * 2);

        // create a random human first name : 
        const randomFirstName = Falso.randFirstName();
        // create a random human last name :
        const randomLastName = Falso.randLastName();
        // create a random human email; 
        const randomEmail = Falso.randEmail();
        // create a random city 
        const randomCity = Falso.randCity();

        console.log(`randomValue: ${randomValue}, randomFirstName: ${randomFirstName}, randomLastName: ${randomLastName}, randomEmail: ${randomEmail}, randomCity: ${randomCity}`)
        // if the value is 0, then insert a new document into the db
        if (randomValue === 0) {

            // insert a new document into the db with the values firstname, lastname, email and city
            await randomDb.put({
                _id: randomEmail,
                firstname: randomFirstName,
                lastname: randomLastName,
                email: randomEmail,
                city: randomCity
            });

        } else {
            // pick a random document from the db, if there are no records, then skip this step, if there is one then load it and update the value for city in the document
            const randomDoc = await randomDb.allDocs({ include_docs: true, limit: 1 });
            if (randomDoc.rows.length > 0) {
                const doc = randomDoc.rows[0].doc;
                doc.city = randomCity;
                await randomDb.put(doc);
            }
        }

        // show the number of records in both dbs; 
        //console.log(`db1: ${JSON.stringify(await db[0].info(), null, 2)}, db2: ${JSON.stringify(await db[1].info(), null, 2)}`);

        // show all records in the first db
        // const allDocs = await db[0].allDocs({ include_docs: true });
        // console.log(allDocs.rows);

        // await db[0].dump(stream);
        // // read from the memory stream and convert to string
        // const data = stream.read().toString();
        // console.log(data);

        // // load the data back into the stream and then into the second db
        // stream = new MemoryStream(data);
        // await db[1].load(stream);

        // wait for 2 seconds 
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
})();

