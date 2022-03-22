const cardDB_OCTGN = require('../definitions/cardDb.json');

function requireAll( requireContext ) {
  return requireContext.keys().map( requireContext );
}
const cardDBs_ALeP = requireAll( require.context("../../../../cardDB/ALeP", false, /.json$/) );
const cardDB_ALeP = Object.assign({}, ...cardDBs_ALeP);

export const cardDb = {
  ...cardDB_OCTGN,
  ...cardDB_ALeP
};