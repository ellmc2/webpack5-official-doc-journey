const schemaValidate = require("schema-utils");
const { validate } = schemaValidate;

// 选项对象的 schema
const schema = {
  type: "object",
  properties: {
    options: {
      type: "boolean",
    },
  },
  additionalProperties: false,
};

class HelloWorldPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: "Hello World Plugin",
      baseDataPath: "options",
      throwError: true,
    });
  }

  apply(compiler) {
    // 当 webpack 编译完成并且输出文件成功时，compiler.hooks.done 钩子会触发。
    compiler.hooks.done.tap(
      "Hello World Plugin",
      (stats /* 绑定 done 钩子后，stats 会作为参数传入。 */) => {
        console.log("Hello World!");
      }
    );
  }
}

module.exports = HelloWorldPlugin;
