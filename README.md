# vite-plugin-uni-platform-loader

一个基于vite的，在uniapp中使用的插件。会根据当前编译的平台，自动加载对应的文件（默认是`h5`）。

例如：h5平台默认加载`index.vue`；微信小程序平台会加载`index.mp-weixin.vue`，若没有则加载`index.vue`。

## 更新日志

| 版本  | 更新内容                           |
| ----- | ---------------------------------- |
| 1.0.5 | 修复默认rootDir路径错误问题        |
| 1.0.4 | 更新README                         |
| 1.0.3 | 修复微信小程序平台文件重新加载问题 |

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
import path from 'path';

export default defineConfig({
  plugins: [
    UniPlatformLoader({
      platform: process.env.UNI_PLATFORM,
      rootDir: path.resolve(__dirname, 'src'),
    }),
  ],
});
```

## 插件选项

| 参数名   | 类型   | 默认值 | 说明   |
| -------- | ------ | ------ | ------ |
| rootDir  | string | `src`  | 根目录 |
| platform | string | `h5`   | 平台   |

## 原理

`vite-plugin-uni-platform-loader`插件会监听`rootDir`目录下的文件变化，当文件发生变化时，会更新默认文件中的注释，重新触发vite的构建。

![image-20241030144938478](https://github.com/shaw996/typorarc/raw/master/src/image-20241030144938478.png?raw=true)
