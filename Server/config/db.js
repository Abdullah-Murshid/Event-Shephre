const mongoose = require("mongoose")

const ConnectedDB = async () => {

await mongoose.connect(process.env.DBURI)
.then(()=> console.log("connected to db"))
.catch(()=> console.log ("connection is failed"))
}

module.exports = ConnectedDB