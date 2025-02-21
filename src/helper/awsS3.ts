import config from "config";
// import AWS from "aws-sdk";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// let awsKey: any = config.get('awsS3Bucket.awsKey');
// let awsSecret: any = config.get('awsS3Bucket.awsSecret');
const client = new S3Client({
  region: config.get("awsS3Bucket.region"),
  credentials: {
    accessKeyId: config.get("awsS3Bucket.awsKey"),
    secretAccessKey: config.get("awsS3Bucket.awsSecret"),
  },
});

// let s3: any = new AWS.S3({ apiVersion: '2006-03-01' });
const region: any = config.get("awsS3Bucket.region");
let bucket: any = config.get("awsS3Bucket.bucket");
console.log(region)
export const uploadFile = async (body: any) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: body.filename,
      Body: body.file.buffer,
      ContentType: body.contentType, // Use the dynamic ContentType
    });

      await client.send(command);
    const url = `${body.filename}`;
    if (url) {
      return url;
    }
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteFile = async (path: any, folder: string = "") => {
  // let filename = path.split("/").pop();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: path,
  });
  console.log(command);
  // return client.send(command, (error: any, data: any) => {
  //     if (error) {
  //         return false;
  //     }
  //     if (data) {
  //         console.log(data);
  //         return true;
  //     }
  // });
  try {
    const response = await client.send(command);
    return response.$metadata.httpStatusCode === 204;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};
