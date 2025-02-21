export default () => {
  process.on("unhandledRejection", (error: Error) => {
    throw error;
  });
};
