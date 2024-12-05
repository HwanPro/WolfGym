import multer from "multer";
import nextConnect from "next-connect";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

// Configuración de multer para almacenar imágenes en "public/uploads/images"
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(process.cwd(), "public/uploads/images"),
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// Middleware de `next-connect`
const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).end("Error en el servidor");
  },
  onNoMatch: (req, res) => {
    res.status(405).end(`Método ${req.method} no permitido`);
  },
});

// Middleware para manejar la subida del archivo
const uploadMiddleware = upload.single("file");

// Función para ejecutar el middleware de multer manualmente
const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Endpoint POST para manejar la subida
apiRoute.post(async (req, res) => {
  try {
    // Ejecutar el middleware de multer
    await runMiddleware(req, res, uploadMiddleware);

    // Extraer el archivo subido
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "Archivo no subido" });
    }

    // Responder con la ruta del archivo
    res.status(200).json({ filePath: `/uploads/images/${file.filename}` });
  } catch (error) {
    res.status(500).json({ error: "Error al subir el archivo" });
  }
});

// Deshabilitar el analizador de cuerpo (bodyParser)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;
