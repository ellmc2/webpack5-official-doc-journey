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

