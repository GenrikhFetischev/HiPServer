import childProcess from "child_process";

process.on("SIGTERM", () => {
  childProcess.execSync(`kill -9 ${process.pid}`);
});
