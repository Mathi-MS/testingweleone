const tsJest = require('ts-jest').default;

const transformer = tsJest.createTransformer({
  tsconfig: 'tsconfig.jest.json',
});

module.exports = {
  process(sourceText, sourcePath, options) {
    // Replace import.meta.env with process.env for Jest
    const modifiedSource = sourceText.replace(
      /import\.meta\.env\.(\w+)/g,
      'process.env.$1'
    );
    
    return transformer.process(modifiedSource, sourcePath, options);
  },
};