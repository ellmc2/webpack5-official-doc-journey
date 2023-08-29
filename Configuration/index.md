# 配置（Configuration）

webpack 开箱即用，可以无需使用任何配置文件。然而，webpack 会假定项目的入口起点为 `src/index.js`，然后会在 `dist/main.js` 输出结果，并且在生产环境开启压缩和优化。

你可以在项目根目录下创建一个 `webpack.config.js` 文件，然后 webpack 会自动使用它。

### 使用不同的配置文件

如果出于某些原因，需要根据特定情况使用不同的配置文件，则可以通过在命令行中使用 `--config` 标志修改。

```bash
# package.json
"scripts": {
  "build": "webpack --config prod.config.js"
}
```

### 设置一个新的 webpack 项目

利用 [webpack-cli 的 init 命令](https://webpack.docschina.org/api/cli/#init)，它可以根据你的项目需求快速生成 webpack 配置文件，它会在创建配置文件之前询问你几个问题。

```
npx webpack init
```

如果尚未在项目或全局安装 `@webpack-cli/generators`，npx 可能会提示你安装。根据你在配置生成过程中的选择，你也可能会安装额外的 package 到你的项目中。

**webpack 的配置文件是 JavaScript 文件，文件内导出了一个 webpack [配置的对象](https://webpack.docschina.org/configuration/)。**

由于 webpack 遵循 CommonJS 模块规范，因此，你**可以在配置中使用**：

- 通过 `require(...)` 引入其他文件
- 通过 `require(...)` 使用 npm 下载的工具函数
- 使用 JavaScript 控制流表达式，例如 `?:` 操作符
- 对 value 使用常量或变量赋值
- 编写并执行函数，生成部分配置

### 基本配置

```javascript
// webpack.config.js

const path = require("path");

module.exports = {
  mode: "development",
  entry: "./foo.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "foo.bundle.js",
  },
};
```

### 多个 target

除了可以将单个配置导出为 object，[function](https://webpack.docschina.org/configuration/configuration-types/#exporting-a-function) 或 [Promise](https://webpack.docschina.org/configuration/configuration-types/#exporting-a-promise) 以外，还可以将其导出为多个配置。比如，对于多 [targets](https://webpack.docschina.org/configuration/output/#outputlibrarytarget)（如 AMD 和 CommonJS）[构建 library](https://webpack.docschina.org/guides/author-libraries) 时会非常有用。

```js
module.exports = [
  {
    output: {
      filename: "./dist-amd.js",
      libraryTarget: "amd",
    },
    name: "amd",
    entry: "./app.js",
    mode: "production",
  },
  {
    output: {
      filename: "./dist-commonjs.js",
      libraryTarget: "commonjs",
    },
    name: "commonjs",
    entry: "./app.js",
    mode: "production",
  },
];
```

### 使用其它配置语言

#### TypeScript

要使用 [Typescript](https://www.typescriptlang.org/) 来编写 webpack 配置，你需要先安装必要的依赖，比如 Typescript 以及其相应的类型声明，类型声明可以从 [DefinitelyTyped](https://definitelytyped.org/) 项目中获取，依赖安装如下所示：

```bash
npm install --save-dev typescript ts-node @types/node @types/webpack
# 如果使用版本低于 v4.7.0 的 webpack-dev-server，还需要安装以下依赖
npm install --save-dev @types/webpack-dev-server
```

完成依赖安装后便可以开始编写配置文件，示例如下：

```typescript
// webpack.config.ts

import * as path from "path";
import * as webpack from "webpack";
// in case you run into any typescript error when configuring `devServer`
import "webpack-dev-server";

const config: webpack.Configuration = {
  mode: "production",
  entry: "./foo.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "foo.bundle.js",
  },
};

export default config;
```

该示例需要 typescript 版本在 2.7 及以上，并在 `tsconfig.json` 文件的 compilerOptions 中添加 `esModuleInterop` 和 `allowSyntheticDefaultImports` 两个配置项。

值得注意的是你需要确保 `tsconfig.json` 的 `compilerOptions` 中 `module` 选项的值为 `commonjs`,否则 webpack 的运行会失败报错，因为 `ts-node` 不支持 `commonjs` 以外的其他模块规范。

你可以通过三个途径来完成 module 的设置：

- 直接修改 `tsconfig.json` 文件

- 修改 `tsconfig.json` 并且添加 `ts-node` 的设置。

- 使用 `tsconfig-paths`

**第一种方法**就是打开你的 `tsconfig.json` 文件，找到 `compilerOptions` 的配置，然后设置 `target` 和 `module` 的选项分别为 `"ES5"` 和 `"CommonJs"` (在 `target` 设置为 `es5` 时你也可以不显示编写 `module` 配置)。

**第二种方法** 就是添加 ts-node 设置：

你可以为 `tsc` 保持 `"module": "ESNext"` 配置，如果你是用 webpack 或者其他构建工具的话，为 ts-node 设置一个重载（override）。[ts-node 配置项](https://typestrong.org/ts-node/docs/imports/)

```
{
  "compilerOptions": {
    "module": "ESNext",
  },
  "ts-node": {
    "compilerOptions": {
      "module": "CommonJS"
    }
  }
}
```

**第三种方法**需要先安装 `tsconfig-paths` 这个 npm 包，如下所示：

```bash
npm install --save-dev tsconfig-paths
```

安装后你可以为 webpack 配置创建一个单独的 TypeScript 配置文件，示例如下：

**tsconfig-for-webpack-config.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "esModuleInterop": true
  }
}
```

ts-node 可以根据 `tsconfig-paths` 提供的环境变量 `process.env.TS_NODE_PROJECT` 来找到 `tsconfig.json` 文件路径。

`process.env.TS_NODE_PROJECT` 变量的设置如下所示:

**package.json**

```
{
  "scripts": {
    "build": "cross-env TS_NODE_PROJECT=\"tsconfig-for-webpack-config.json\" webpack"
  }
}
```

之所以要添加 `cross-env`，是因为我们在直接使用 `TS_NODE_PROJECT` 时遇到过 `"TS_NODE_PROJECT" unrecognized command` 报错的反馈，添加 `cross-env` 之后该问题也似乎得到了解决，你可以查看[这个 issue](https://github.com/webpack/webpack.js.org/issues/2733)获取到关于该问题的更多信息。

#### Babel and JSX

下述的示例中使用了 JSX（用于 React 的 JavaScript 标记语言）和 babel 来创建格式为 json 的 webpack 配置文件。

首先，需要安装一些必要依赖，如下所示:

```bash
npm install --save-dev babel-register jsxobj babel-preset-es2015
```

```
// .babelrc
{
  "presets": ["es2015"]
}
```

```
// webpack.config.babel.js

import jsxobj from 'jsxobj';

// 插件引入示例
const CustomPlugin = (config) => ({
  ...config,
  name: 'custom-plugin',
});

export default (
  <webpack target="web" watch mode="production">
    <entry path="src/index.js" />
    <resolve>
      <alias
        {...{
          react: 'preact-compat',
          'react-dom': 'preact-compat',
        }}
      />
    </resolve>
    <plugins>
      <CustomPlugin foo="bar" />
    </plugins>
  </webpack>
);
```

如果你在其他地方也使用了 Babel 并且 `modules` 的值设置为 `false`，则必须维护两份 `.babelrc` 的文件，或者你也可以将上述示例中的 `import jsxobj from 'jsxobj';` 替换为 `const jsxobj = require('jsxobj');` 并将新的 `export` 语法替换为 `module.exports`，因为尽管 Node 目前已经支持了 ES6 的许多新特性，但是仍然没有支持 ES6 的模块语法。

## 思考与疑惑

1. 什么是 `?:` 操作符？
2.
