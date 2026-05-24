const esObjetoPlano = (valor) =>
  valor && typeof valor === 'object' && !Array.isArray(valor);

const combinarObjetos = (destino, fuente) => {
  Object.keys(fuente).forEach((clave) => {
    const valorActual = fuente[clave];
    if (esObjetoPlano(valorActual) && esObjetoPlano(destino[clave])) {
      combinarObjetos(destino[clave], valorActual);
      return;
    }
    destino[clave] = valorActual;
  });
  return destino;
};

const combinarResolvers = (listaResolvers) =>
  listaResolvers.reduce(
    (acumulado, actual) => combinarObjetos(acumulado, actual),
    {}
  );

module.exports = { combinarResolvers };
