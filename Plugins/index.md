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

### 3、异步编译插件

有些插件钩子是异步的。我们可以像同步方式一样用 `tap` 方法来绑定，也可以用 `tapAsync` 或 `tapPromise` 这两个异步方法来绑定。

#### tapAsync

当我们用 `tapAsync` 方法来绑定插件时，*必须*调用函数的最后一个参数 `callback` 指定的回调函数。

```javascript
class HelloAsyncPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "HelloAsyncPlugin",
      (compilation, callback) => {
        // 执行某些异步操作...
        setTimeout(function () {
          console.log("异步任务完成...");
          callback();
        }, 1000);
      }
    );
  }
}

module.exports = HelloAsyncPlugin;
```

#### tapPromise

当我们用 `tapPromise` 方法来绑定插件时，*必须*返回一个 pormise ，异步任务完成后 resolve 。

```javascript
class HelloAsyncPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapPromise("HelloAsyncPlugin", (compilation) => {
      // 返回一个 pormise ，异步任务完成后 resolve
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          console.log("异步任务完成...");
          resolve();
        }, 1000);
      });
    });
  }
}

module.exports = HelloAsyncPlugin;
```

#### 示例

写一个简单的示例插件，生成一个叫做 `assets.md` 的新文件；文件内容是所有构建生成的文件的列表。这个插件大概像下面这样：

```javascript
class FileListPlugin {
  static defaultOptions = {
    outputFile: "assets.md",
  };

  // 需要传入自定义插件构造函数的任意选项
  //（这是自定义插件的公开API）
  constructor(options = {}) {
    // 在应用默认选项前，先应用用户指定选项
    // 合并后的选项暴露给插件方法
    // 记得在这里校验所有选项
    this.options = { ...FileListPlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    const pluginName = FileListPlugin.name;

    // webpack 模块实例，可以通过 compiler 对象访问，
    // 这样确保使用的是模块的正确版本
    // （不要直接 require/import webpack）
    const { webpack } = compiler;

    // Compilation 对象提供了对一些有用常量的访问。
    const { Compilation } = webpack;

    // RawSource 是其中一种 “源码”("sources") 类型，
    // 用来在 compilation 中表示资源的源码
    const { RawSource } = webpack.sources;

    // 绑定到 “thisCompilation” 钩子，
    // 以便进一步绑定到 compilation 过程更早期的阶段
    // 在每次新的编译(compilation)开始时触发
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // 绑定到资源处理流水线(assets processing pipeline)
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,

          // 用某个靠后的资源处理阶段，
          // 确保所有资源已被插件添加到 compilation
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          // "assets" 是一个包含 compilation 中所有资源(assets)的对象。
          // 该对象的键是资源的路径，
          // 值是文件的源码

          // 遍历所有资源，
          // 生成 Markdown 文件的内容
          const content =
            "# In this build:\n\n" +
            Object.keys(assets)
              .map((filename) => `- ${filename}`)
              .join("\n");

          // 向 compilation 添加新的资源，
          // 这样 webpack 就会自动生成并输出到 output 目录
          compilation.emitAsset(
            this.options.outputFile,
            new RawSource(content)
          );
        }
      );
    });
  }
}

module.exports = { FileListPlugin };
```

```javascript
// webpack.config.json

const { FileListPlugin } = require("./file-list-plugin.js");

// 在 webpack 配置中使用自定义的插件：
module.exports = {
  // …

  plugins: [
    // 添加插件，使用默认选项
    new FileListPlugin(),

    // 或者:

    // 使用任意支持的选项
    new FileListPlugin({
      outputFile: "my-assets.md",
    }),
  ],
};
```

## 思考与疑惑

1. 为什么还需要 `new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"',})`, 定义全局变量。`process.env` 不是 node 自带的么?

   > 虽然 `process.env` 是 Node.js 中的全局变量，但在浏览器中运行的 JavaScript 代码并没有这个全局变量。在 Webpack 中使用 `new webpack.DefinePlugin()` 可以将 `process.env.NODE_ENV` 这个全局变量注入到 JavaScript 代码中，从而在代码中使用这个变量来区分开发环境和生产环境。
