# 插件（Plugins）

`plugins` 选项用于以各种方式自定义 webpack 构建过程。webpack 附带了各种内置插件，可以通过 `webpack.[plugin-name]` 访问这些插件。请查看 [插件页面](https://webpack.docschina.org/plugins) 获取插件列表和对应文档，但请注意这只是其中一部分，社区中还有许多插件。

## plugins

`[Plugin]`

一组 webpack 插件。例如，[`DefinePlugin`](https://webpack.docschina.org/plugins/define-plugin/) 允许你创建可在编译时配置的全局常量。这对需要再开发环境构建和生产环境构建之间产生不同行为来说非常有用。

```javascript
// webpack.config.js

module.exports = {
  //...
  plugins: [
    new webpack.DefinePlugin({
      // Definitions...
    }),
  ],
};
```

一个复杂示例，使用多个插件，可能看起来就像这样：

```javascript
var webpack = require("webpack");
// 导入非 webpack 自带默认插件
var DashboardPlugin = require("webpack-dashboard/plugin");

// 在配置中添加插件
module.exports = {
  //...
  plugins: [
    // 忽略 Moment.js 库中的 ./locale 目录，从而减小打包后的文件大小。这样可以在保留 Moment.js 的核心功能的同时，减少不必要的代码，提高网站的性能。
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // 编译时(compile time)插件
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"',
    }),
    // webpack-dev-server 强化插件
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
```

## 自定义插件

### 1、创建插件

webpack 插件由以下组成：

- 一个 JavaScript 命名函数或 JavaScript 类。
- 在插件函数的 prototype 上定义一个 `apply` 方法。
- 指定一个绑定到 webpack 自身的[事件钩子](https://webpack.docschina.org/api/compiler-hooks/)。
- 处理 webpack 内部实例的特定数据。
- 功能完成后调用 webpack 提供的回调。

```javascript
// 一个 JavaScript 类
class MyExampleWebpackPlugin {
  // 在插件函数的 prototype 上定义一个 `apply` 方法，以 compiler 为参数。
  apply(compiler) {
    // 指定一个挂载到 webpack 自身的事件钩子。
    compiler.hooks.emit.tapAsync(
      "MyExampleWebpackPlugin",
      (compilation, callback) => {
        console.log("这是一个示例插件！");
        console.log(
          "这里表示了资源的单次构建的 `compilation` 对象：",
          compilation
        );

        // 用 webpack 提供的插件 API 处理构建过程
        compilation.addModule(/* ... */);

        callback();
      }
    );
  }
}
```

### 2、基本插件架构

插件是由「具有 `apply` 方法的 prototype 对象」所实例化出来的。这个 `apply` 方法在安装插件时，会被 webpack compiler 调用一次。`apply` 方法可以接收一个 webpack compiler 对象的引用，从而可以在回调函数中访问到 compiler 对象。一个插件结构如下：

```javascript
class HelloWorldPlugin {
  apply(compiler) {
    compiler.hooks.done.tap(
      "Hello World Plugin",
      (stats /* 绑定 done 钩子后，stats 会作为参数传入。 */) => {
        console.log("Hello World!");
      }
    );
  }
}

module.exports = HelloWorldPlugin;
```

然后，要安装这个插件，只需要在你的 webpack 配置的 plugin 数组中添加一个实例：

```
// webpack.config.js
var HelloWorldPlugin = require('hello-world');

module.exports = {
  // ... 这里是其他配置 ...
  plugins: [new HelloWorldPlugin({ options: true })],
};
```

使用 [`schema-utils`](https://github.com/webpack/schema-utils) 来校验传入插件的选项。这里是个例子：

```javascript
import { validate } from "schema-utils";

// 选项对象的 schema
const schema = {
  type: "object",
  properties: {
    test: {
      type: "string",
    },
  },
};

export default class HelloWorldPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: "Hello World Plugin",
      baseDataPath: "options",
    });
  }

  apply(compiler) {}
}
```

## 思考与疑惑

1. 为什么还需要 `new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"',})`, 定义全局变量。`process.env` 不是 node 自带的么?

   > 虽然 `process.env` 是 Node.js 中的全局变量，但在浏览器中运行的 JavaScript 代码并没有这个全局变量。在 Webpack 中使用 `new webpack.DefinePlugin()` 可以将 `process.env.NODE_ENV` 这个全局变量注入到 JavaScript 代码中，从而在代码中使用这个变量来区分开发环境和生产环境。
