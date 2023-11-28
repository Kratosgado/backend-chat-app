import * as fs from "fs";
import { FileUpload } from "graphql-upload";

export async function encodeImageToBase64(file: FileUpload): Promise < string > {
   // convert file to base64
   try {
      const stream = file.createReadStream();

      const chunks = [];
      for await (const chunk of stream) {
         chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString("base64");
      return base64;

   } catch (error) {
      throw new Error(error);
   }
}

export async function anotherEncodeToBase64(file:FileUpload) {
   try {
      const stream = file.createReadStream();
      const chunks = [];
      const buffer = await new Promise<Buffer>((resolve, reject) => {
         let buffer: Buffer;

         stream.on('data', (chunk) => {
            chunks.push(chunk)
         });

         stream.on('end', () => {
            buffer = Buffer.concat(chunks);
            resolve(buffer);
         });

         stream.on('error', reject);
      });

      const base64 = buffer.toString('base64');
      fs.writeFileSync(`${file.filename}`, buffer);
      return base64;
   } catch (error) {
      throw new Error(error)
   }
}

// export async function decodeBase64ToImage(base64: string, filename: string): Promise < FileUpload > {
//    // convert base64 to file
   
// }