
export interface ArchitecturalStyle {
  id: string;
  name: string;
  prompt: string;
}

export interface ViewAngle {
  id: string;
  name: string;
  prompt: string;
}

export type ImageResolution = '1K' | '2K' | '4K';

export type AspectRatio = '1:1' | '16:9' | '4:3' | '3:4' | '9:16';

export interface MaterialOption {
  value: string;
  label: string;
}

export interface RenderPreset {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
}
