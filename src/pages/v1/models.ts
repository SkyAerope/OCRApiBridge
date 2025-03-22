// src/pages/api/v1/models.ts
import type { APIRoute } from 'astro';

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface ModelsResponse {
  object: string;
  data: Model[];
}

export const get: APIRoute = async () => {
  return handleModelsRequest();
};

export const post: APIRoute = async () => {
  return handleModelsRequest();
};

function handleModelsRequest() {
  const models: ModelsResponse = {
    object: "list",
    data: [
      {
        id: "ocr",
        object: "model",
        created: 1680000000,
        owned_by: "azure-ocr"
      }
    ]
  };

  return new Response(JSON.stringify(models, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Processing-Ms': '123' // 模拟OpenAI头
    }
  });
}