const dns = require("dns");

// Development-only DNS override for MongoDB Atlas SRV record resolution.
// The default system DNS may fail to resolve MongoDB Atlas SRV records.
// This only applies in development; production builds/deployments are unaffected.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
