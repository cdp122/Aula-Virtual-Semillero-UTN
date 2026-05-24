const { typeDefs: tiposComunes, resolvers: resolversComunes } = require('./TiposComunes');
const { typeDefs: rolTypeDefs } = require('./rol/RolTypeDefs');
const { resolvers: rolResolvers } = require('./rol/RolResolvers');
const { typeDefs: usuarioTypeDefs } = require('./usuario/UsuarioTypeDefs');
const { resolvers: usuarioResolvers } = require('./usuario/UsuarioResolvers');
const { typeDefs: cursoTypeDefs } = require('./curso/CursoTypeDefs');
const { resolvers: cursoResolvers } = require('./curso/CursoResolvers');
const {
  typeDefs: unidadDidacticaTypeDefs
} = require('./unidadDidactica/UnidadDidacticaTypeDefs');
const {
  resolvers: unidadDidacticaResolvers
} = require('./unidadDidactica/UnidadDidacticaResolvers');
const {
  typeDefs: criterioEvaluacionTypeDefs
} = require('./criterioEvaluacion/CriterioEvaluacionTypeDefs');
const {
  resolvers: criterioEvaluacionResolvers
} = require('./criterioEvaluacion/CriterioEvaluacionResolvers');
const { typeDefs: nivelTypeDefs } = require('./nivel/NivelTypeDefs');
const { resolvers: nivelResolvers } = require('./nivel/NivelResolvers');
const { typeDefs: descriptorTypeDefs } = require('./descriptor/DescriptorTypeDefs');
const { resolvers: descriptorResolvers } = require('./descriptor/DescriptorResolvers');
const {
  typeDefs: evaluacionEstudianteTypeDefs
} = require('./evaluacionEstudiante/EvaluacionEstudianteTypeDefs');
const {
  resolvers: evaluacionEstudianteResolvers
} = require('./evaluacionEstudiante/EvaluacionEstudianteResolvers');
const {
  typeDefs: preguntaAutoevaluacionTypeDefs
} = require('./preguntaAutoevaluacion/PreguntaAutoevaluacionTypeDefs');
const {
  resolvers: preguntaAutoevaluacionResolvers
} = require('./preguntaAutoevaluacion/PreguntaAutoevaluacionResolvers');
const {
  typeDefs: autoevaluacionDocenteTypeDefs
} = require('./autoevaluacionDocente/AutoevaluacionDocenteTypeDefs');
const {
  resolvers: autoevaluacionDocenteResolvers
} = require('./autoevaluacionDocente/AutoevaluacionDocenteResolvers');
const {
  typeDefs: operacionesEspecialesTypeDefs
} = require('./OperacionesEspecialesTypeDefs');
const {
  resolvers: operacionesEspecialesResolvers
} = require('./OperacionesEspecialesResolvers');
const { combinarResolvers } = require('./combinarResolvers');

const typeDefs = [
  tiposComunes,
  rolTypeDefs,
  usuarioTypeDefs,
  cursoTypeDefs,
  unidadDidacticaTypeDefs,
  criterioEvaluacionTypeDefs,
  nivelTypeDefs,
  descriptorTypeDefs,
  evaluacionEstudianteTypeDefs,
  preguntaAutoevaluacionTypeDefs,
  autoevaluacionDocenteTypeDefs,
  operacionesEspecialesTypeDefs
];

const resolvers = combinarResolvers([
  resolversComunes,
  rolResolvers,
  usuarioResolvers,
  cursoResolvers,
  unidadDidacticaResolvers,
  criterioEvaluacionResolvers,
  nivelResolvers,
  descriptorResolvers,
  evaluacionEstudianteResolvers,
  preguntaAutoevaluacionResolvers,
  autoevaluacionDocenteResolvers,
  operacionesEspecialesResolvers
]);

module.exports = { typeDefs, resolvers };
