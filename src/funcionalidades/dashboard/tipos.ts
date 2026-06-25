/** Resumen de métricas de un cliente (debe coincidir con el backend). */
export interface ResumenCorto {
  impresiones: number;
  alcance: number;
  interacciones: number;
}

export interface ResumenMetricas {
  clienteId: string;
  desde: string | null;
  hasta: string | null;
  totales: {
    impresiones: number;
    alcance: number;
    meGusta: number;
    comentarios: number;
    compartidos: number;
    guardados: number;
    clics: number;
    interacciones: number;
    publicaciones: number;
  };
  porCanal: ({ canal: string } & ResumenCorto)[];
  serie: ({ fecha: string } & ResumenCorto)[];
}
