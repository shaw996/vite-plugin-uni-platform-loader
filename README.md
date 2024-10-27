# vite-plugin-uni-platform-loader

一个基于uniapp中使用的vite插件，根据平台自动加载文件。

## 安装

在`.npmrc`中指定镜像

```bash
vite-plugin-uni-platform-loader:registry=https://registry.npmjs.org/
```

安装插件

```bash
npm i -D vite-plugin-uni-platform-loader
```

## 使用

在`vite.config.ts`中使用

```ts
import UniPlatformLoader from 'vite-plugin-uni-platform-loader';

export default defineConfig({
  plugins: [UniPlatformLoader()],
});
```
