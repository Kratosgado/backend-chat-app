import * as fs from "fs";

export async function encodeImageToBase64(file: Express.Multer.File): Promise < string > {
   // convert file to base64
   try {
      // const stream = file.stream;

      // const chunks = [];
      // for await (const chunk of stream) {
      //    chunks.push(chunk);
      // }
      // const buffer = Buffer.concat(chunks);
      const buffer = file.buffer;
      const base64 = buffer.toString("base64");
      fs.writeFileSync(`${file.filename}.${file.mimetype}`, buffer);

      return base64;

   } catch (error) {
      throw new Error(error);
   }
}

export async function anotherEncodeToBase64(file: Express.Multer.File) {
   try {
      const stream = file.stream;
      const chunks = [];
      const buffer = await new Promise<Buffer>((resolve, reject) => {
         let buffer: Buffer;

         stream.on("data", (chunk) => {
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

export function decodeBase64ToImage(base64: string, filename: string): File {
   var pos = base64.indexOf(';base64,');
   var type = base64.substring(5, pos);
   var b64 = base64.substr(pos + 8);
   
   var imageContent = atob(b64);
   // convert base64 to file
   const buffer = Buffer.from(base64);
   // const buffer = new ArrayBuffer(imageContent.length);
   const view = new Uint8Array(buffer);

   for(let n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);  
   }

   var blob = new Blob([buffer], { type });
   return new File([blob], filename, {lastModified: new Date().getTime(), type})
   
}