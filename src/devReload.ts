import childProcess from "child_process";

console.clear();

process.on("SIGTERM", () => {
  childProcess.execSync(`kill -9 ${process.pid}`);
});
