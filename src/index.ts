/* eslint-disable sort-keys */
/* eslint-disable sort-keys-fix/sort-keys-fix */
import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

const PluginName = 'vite-plugin-uni-platform-loader';

export interface UniPlatformLoaderOptions {
  platform?: string;
  rootDir?: string;
}

/**
 * 添加注释
 * @param id 文件路径
 * @param platform 平台
 */
function annotate(id: string, platform: string) {
  const extname = path.extname(id);
  const linkId = id.replace(`.${platform}${extname}`, extname);
  const linkExists = fs.existsSync(linkId);

  if (!linkExists) {
    // 目标文件不存在，不处理
    return;
  }

  const content = fs.readFileSync(linkId, { encoding: 'utf-8' });
  let newContent = content;

  const annotateRegex = /@uni-platform-loader last-modified-at=\d+/;
  const oldAnnotate = content.match(annotateRegex)?.[0];
  let newAnnotate: string;

  switch (extname) {
    case '.html':
    case '.vue':
      newAnnotate = `<!-- @uni-platform-loader last-modified-at=${new Date().getTime()} -->`;
      break;
    default:
      newAnnotate = `/*** @uni-platform-loader last-modified-at=${new Date().getTime()} ***/`;
      break;
  }

  if (oldAnnotate) {
    newContent = content.replace(new RegExp(`.*${oldAnnotate}.*`), newAnnotate);
  } else {
    newContent = `${content}\n${newAnnotate}\n`;
  }

  fs.writeFileSync(linkId, newContent, { encoding: 'utf-8' });
}

export default function vitePluginUniPlatformLoader(options?: UniPlatformLoaderOptions): Plugin {
  let { platform, rootDir } = options || {};

  if (!platform) {
    platform = 'h5';
  }

  if (!rootDir) {
    rootDir = path.resolve(process.cwd(), 'src');
  }

  // 检查根目录是否存在
  const rootDirExists = fs.existsSync(rootDir);

  if (!rootDirExists) {
    throw new Error(`根目录 ${rootDir} 不存在`);
  }

  // 监听根目录
  fs.watch(rootDir, { recursive: true }, (_eventType, filename) => {
    if (!filename || platform === 'h5') {
      // 没有文件名或平台是h5不处理
      return;
    }

    const id = path.resolve(rootDir, filename);
    const exists = fs.existsSync(id);

    if (!exists) {
      // 文件不存在
      // 添加注释
      annotate(id, platform);

      // 不继续处理
      return;
    }

    const extname = path.extname(id);
    const currentPlatformFileRegexp = new RegExp(`.*.${platform}${extname}$`);
    const isFile = fs.statSync(id).isFile();

    if (!isFile || !currentPlatformFileRegexp.test(id)) {
      // 不是文件或不是当前平台文件，不处理
      return;
    }

    // 添加注释
    annotate(id, platform);
  });

  return {
    name: PluginName,
    enforce: 'pre',
    transform(code, id) {
      let newCode = code;

      if (platform !== 'h5') {
        // 平台不是h5时才特殊处理
        // 平台特定文件路径
        const extname = path.extname(id);
        const platformId = id.replace(extname, `.${platform}${extname}`);

        // 且平台特定文件是否存在
        if (fs.existsSync(platformId)) {
          newCode = fs.readFileSync(platformId, 'utf-8') ?? code;
        }
      }

      return newCode;
    },
  };
}
