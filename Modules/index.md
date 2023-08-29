# 模块（Modules）

在[模块化编程](https://en.wikipedia.org/wiki/Modular_programming)中，开发者将程序分解为功能离散的 chunk，并称之为 **模块**。

## 何为 webpack 模块

与 [Node.js 模块](https://nodejs.org/api/modules.html)相比，webpack _模块_ 能以各种方式表达它们的依赖关系。下面是一些示例：

- [ES2015 `import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 语句
- [CommonJS](http://www.commonjs.org/specs/modules/1.0/) `require()` 语句
- [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) `define` 和 `require` 语句
- css/sass/less 文件中的 [`@import` 语句](https://developer.mozilla.org/en-US/docs/Web/CSS/@import)。
- stylesheet `url(...)` 或者 HTML `<img src=...>` 文件中的图片链接。

## 支持的模块类型

Webpack 天生支持如下模块类型：

- [ECMAScript 模块](https://webpack.docschina.org/guides/ecma-script-modules)
- CommonJS 模块
- AMD 模块
- [Assets](https://webpack.docschina.org/guides/asset-modules)
- WebAssembly 模块

通过 **loader** 可以使 webpack 支持多种语言和预处理器语法编写的模块。**loader** 向 webpack 描述了如何处理非原生*模块*，并将相关**依赖**引入到你的 **bundles**中。 webpack 社区已经为各种流行的语言和预处理器创建了 _loader_，其中包括：

- [CoffeeScript](http://coffeescript.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [ESNext (Babel)](https://babeljs.io/)
- [Sass](http://sass-lang.com/)
- [Less](http://lesscss.org/)
- [Stylus](http://stylus-lang.com/)
- [Elm](https://elm-lang.org/)

## 思考

1. 在 js 中 chunk 和 module 有区别么？

   > 模块是指一个独立的 JavaScript 文件或者一个包含多个 JavaScript 文件的文件夹（例如 Node.js 中的模块）。一个模块可以导出（export）一些变量、函数或类，供其他模块使用。模块化是现代 JavaScript 开发中的一个重要特性，它可以使代码更加模块化、可维护和可重用。
   >
   > 代码块（chunk）是指 Webpack 中的一个概念，它是将多个模块打包成一个或多个文件的过程中产生的一个中间文件。Webpack 将多个模块组合成一个代码块，可以根据需要进行拆分和加载，以优化网页的加载速度和性能。
   >
   > 在 Webpack 中，一个代码块可以包含多个模块，一个模块也可以被多个代码块所共用。因此，模块和代码块是两个不同的概念，在 Webpack 中扮演着不同的角色。
