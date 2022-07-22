import { MongoClient, Db } from "mongodb";
// import "dotenv/config";
// import path from "path";
// import fs from "fs";
// import { parse } from "dotenv";

const dbName = "bestie-quiz";

class Mongo {
  url: string;
  connected: boolean = false;
  db: Db | null | undefined = null;
  constructor() {
    // console.log(
    //   parse(fs.readFileSync(path.join(__dirname, "../.env"), "utf8"))
    // );
    this.url = import.meta.env.VITE_MONGODB_URI;
    // console.log(this.url);
    this.connect();
  }
  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, (err, client) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          this.connected = true;
          this.db = client?.db(dbName);
          resolve(true);
        }
      });
    });
  }
}

export { Mongo };
export default new Mongo();
