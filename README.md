# OCRApiBridge
本项目将Azure OCR接口转换为OpenAI视觉模型接口格式

甚至还带了一个前端给你测试

Astro框架，可以使用netlify等serverless服务部署

用途：
  - 很方便地在Open WebUI上使用
  - 想不到了

## 效果：
用于测试的前端
![image](https://github.com/user-attachments/assets/4b1cd21a-a350-436a-ae4f-a1f82fa26235)

Open WebUI
![image](https://github.com/user-attachments/assets/3150b867-cec8-4387-bcc5-2a6865bbca35)

## 如何使用
1. 在Azure上创建一个视觉服务，获取key和endpoint
2. fork本项目，在netlify上部署

  如果你在其它serverless平台部署，则需要更换SSR适配器。参考官方文档：https://docs.astro.build/zh-cn/guides/on-demand-rendering/
3. 填入环境变量
   ```
    AZURE_OCR_KEY=your_key
    AZURE_OCR_ENDPOINT=your_endpoint
    API_KEY=your_api_key # 选填，Open WebUI请求时带上，若不填请使用AZURE_OCR_KEY认证
   ```
   由于每个人的endpoint不同，所以不用担心不填API_KEY会被滥用
4. 在Open WebUI上添加模型
   URL填入你的netlify地址，如`https://your_site.netlify.app/v1`

   API密钥填入你的API_KEY或者AZURE_OCR_KEY（如果没设置API_KEY）

5. 在对话中选择模型，上传图片即可

## TODO
- [ ] 伪装流式返回
- [ ] 适配更多OCR接口
## 开发

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
