const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      '@primary-color': '#2e5985', // hsla(210, 49%, 35%, 1)
      '@border-color-base': '#cdcdcd',
      '@heading-color': '#183149' // hsla(209, 50%, 19%, 1)
    },
  }),
)

