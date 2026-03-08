import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('sqlite.db');

db.get("SELECT content FROM articles WHERE id = 45", (err, row) => {
    if (err) {
        console.error(err);
        return;
    }
    if (row) {
        console.log(row.content);
    } else {
        console.log("No article found with ID 45");
    }
    db.close();
});
