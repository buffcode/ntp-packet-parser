process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT || require('path').join(__dirname, 'test/tsconfig.json');

module.exports = {
  require: ['ts-node/register'],
  extensions: ['ts'],
};
