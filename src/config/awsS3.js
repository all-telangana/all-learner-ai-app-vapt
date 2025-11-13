import { S3Client } from "@aws-sdk/client-s3";

// export default new S3Client({
//   region: process.env.REACT_APP_AWS_S3_REGION,
//   credentials: {
//     accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
//   },
// });

//const s3Client = new S3Client({
//region: process.env.REACT_APP_AWS_S3_REGION || "us-east-1", // dummy region for E2E
//endpoint: process.env.REACT_APP_S3_ENDPOINT,
//forcePathStyle: true,
//credentials: {
// accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
// secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
// },
//});

//export default s3Client;

export default new S3Client({
  region: "us-east-1", // dummy region for E2E
  endpoint: process.env.REACT_APP_S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});
