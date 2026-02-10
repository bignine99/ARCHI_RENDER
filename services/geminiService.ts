
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageResolution, AspectRatio } from "../types";

// --- Runtime API Key Management ---
let _runtimeApiKey: string | null = null;

export const setApiKey = (key: string) => {
  _runtimeApiKey = key;
};

export const getApiKey = (): string | null => {
  return _runtimeApiKey || process.env.API_KEY || null;
};

// Utility function to convert File to Gemini-compatible part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

// Retry helper for 503 and 5xx errors
const runWithRetry = async <T>(operation: () => Promise<T>, retries = 5, baseDelay = 2000): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const errStr = JSON.stringify(error);
      const errMsg = error.message || '';
      const errCode = error.status || error.code || error.error?.code;

      const isRetriable =
        errMsg.includes('503') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('Too Many Requests') ||
        errMsg.includes('Internal Server Error') ||
        errStr.includes('503') ||
        errStr.includes('overloaded') ||
        errStr.includes('UNAVAILABLE') ||
        errCode === 503 ||
        errCode === 500 ||
        errCode === 502 ||
        errCode === 504;

      if (isRetriable && i < retries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Gemini API error (${errCode || 'Unknown'}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// Robust error handler for Gemini API errors
const handleGeminiError = (error: any): never => {
  console.error("Gemini API 호출 오류:", error);

  const msg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
  const errorCode = error.status || error.code || error.error?.code || error.error?.status;
  const detailedMsg = error.error?.message || msg;

  if (
    detailedMsg.includes("Requested entity was not found") ||
    detailedMsg.includes("PERMISSION_DENIED") ||
    detailedMsg.includes("The caller does not have permission") ||
    detailedMsg.includes("403") ||
    String(errorCode) === "403" ||
    errorCode === 403 ||
    String(errorCode).includes("PERMISSION_DENIED")
  ) {
    throw new Error("API 키 오류: 권한이 없거나 유효하지 않은 키입니다. 유효한 결제 프로젝트의 키를 다시 선택해주세요.");
  }

  throw new Error(`작업에 실패했습니다: ${msg}`);
};

const resolveApiKey = (): string => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API 키가 설정되지 않았습니다. 인증을 먼저 완료해주세요.");
  }
  return apiKey;
};

interface GenerateImageOptions {
  prompt: string;
  imageFile?: File;
  base64Image?: string;
  resolution?: ImageResolution;
  aspectRatio?: AspectRatio;
}

export const generateImage = async ({
  prompt,
  imageFile,
  base64Image,
  resolution = '1K',
  aspectRatio = '1:1'
}: GenerateImageOptions): Promise<string> => {
  const apiKey = resolveApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const parts = [];

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.push(imagePart);
  } else if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image.split(',')[1],
        mimeType: 'image/png',
      }
    });
  }

  parts.push({ text: prompt });

  try {
    const response = await runWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: parts,
        },
        config: {
          imageConfig: {
            imageSize: resolution,
            aspectRatio: aspectRatio,
          },
        },
      });
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error('API에서 이미지를 생성하지 못했습니다.');
  } catch (error: any) {
    handleGeminiError(error);
  }
};

export const editImageWithFlash = async (base64Image: string, prompt: string): Promise<string> => {
  const apiKey = resolveApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const parts = [
    {
      inlineData: {
        data: base64Image.split(',')[1],
        mimeType: 'image/png',
      }
    },
    { text: prompt }
  ];

  try {
    const response = await runWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts,
        },
      });
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error('API에서 이미지를 생성하지 못했습니다.');
  } catch (error: any) {
    handleGeminiError(error);
  }
};

export const generateArchitecturalVideo = async (base64Image: string, aspectRatio: AspectRatio): Promise<string> => {
  const apiKey = resolveApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Map input aspect ratio to Veo supported ratios (16:9 or 9:16)
  const veoAspectRatio = (aspectRatio === '9:16' || aspectRatio === '3:4') ? '9:16' : '16:9';

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'A cinematic slow architectural drone sweep around this building, realistic materials, soft natural lighting, high detail.',
      image: {
        imageBytes: base64Image.split(',')[1],
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: veoAspectRatio
      }
    });

    const VIDEO_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max
    const startTime = Date.now();
    while (!operation.done) {
      if (Date.now() - startTime > VIDEO_TIMEOUT_MS) {
        throw new Error('비디오 생성 시간이 초과되었습니다 (5분). 다시 시도해주세요.');
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('비디오 생성 결과 링크를 찾을 수 없습니다.');
    }

    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    handleGeminiError(error);
  }
};
