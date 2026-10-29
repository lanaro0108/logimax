import mongoose from 'mongoose';

// Interface para controle de cache da conexão Mongoose
interface ConexaoMongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Armazena no escopo global para reaproveitamento em hot-reload
declare global {
  var mongooseCache: ConexaoMongooseCache | undefined;
}

let cache = global.mongooseCache;

if (!cache) {
  cache = global.mongooseCache = { conn: null, promise: null };
}

// Conecta ao MongoDB garantindo uma única instância ativa
export async function conectarBanco(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/logimax';

  if (cache?.conn) {
    return cache.conn;
  }

  if (!cache?.promise) {
    cache!.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cache!.conn = await cache!.promise;
  return cache!.conn;
}
