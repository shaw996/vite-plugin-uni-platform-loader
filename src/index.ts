/* eslint-disable sort-keys */
/* eslint-disable sort-keys-fix/sort-keys-fix */
import type { Plugin, ViteDevServer } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

export default function vitePluginUniPlatformLoader(): Plugin {
  let _server: ViteDevServer;
  const filesTracked = new Set<string>();

  return {
    name: 'vite-plugin-uni-platform-loader',
    enforce: 'pre',
    configureServer(server) {
      const platform = process.env['UNI_PLATFORM'];

      if (platform && _server !== server) {
        /**
         * 调度重新加载
         * @param file 文件路径
         */
        const scheduleReload = (file: string) => {
          const extname = path.extname(file);

          file = file.replace(`.${platform}${extname}`, extname);

          if (filesTracked.has(file)) {
            const module = server.moduleGraph.idToModuleMap.get(file);

            if (module) {
              server.reloadModule(module);
            }
          }
        };

        /**************/
        // 监听src目录
        const srcDir = path.resolve(__dirname, 'src');

        server.watcher.add(srcDir);
        /**************/

        /**************/
        // 监听文件变化
        server.watcher.on('change', scheduleReload);
        /**************/

        /**************/
        // 监听文件新增
        server.watcher.on('add', scheduleReload);
        /**************/

        /**************/
        // 监听文件删除
        server.watcher.on('unlink', scheduleReload);
        /**************/

        _server = server;
      }
    },
    transform(code, file) {
      filesTracked.add(file);

      let content = code;
      const platform = process.env['UNI_PLATFORM'];

      // 如果有platform
      if (platform) {
        // 平台特定文件路径
        const extname = path.extname(file);
        const specFileId = file.replace(extname, `.${platform}${extname}`);

        // 且平台特定文件是否存在
        if (fs.existsSync(specFileId)) {
          content = fs.readFileSync(specFileId, 'utf-8');
        }
      }

      return content;
    },
  };
}
