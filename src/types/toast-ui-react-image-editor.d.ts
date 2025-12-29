declare module '@toast-ui/react-image-editor' {
  import { Component, RefObject } from 'react';

  export interface ImageEditorOptions {
    includeUI?: {
      loadImage?: {
        path: string;
        name: string;
      };
      theme?: Record<string, any>;
      menu?: string[];
      initMenu?: string;
      uiSize?: {
        width: string | number;
        height: string | number;
      };
      menuBarPosition?: 'top' | 'bottom' | 'left' | 'right';
    };
    cssMaxHeight?: number;
    cssMaxWidth?: number;
    selectionStyle?: {
      cornerSize?: number;
      rotatingPointOffset?: number;
    };
    usageStatistics?: boolean;
  }

  export interface ImageEditorInstance {
    getInstance(): any;
    getRootElement(): HTMLElement;
    toDataURL(): string;
    flipX(): void;
    flipY(): void;
    // Add other methods as needed
  }

  export default class ImageEditor extends Component<ImageEditorOptions> {
    getInstance(): any;
    getRootElement(): HTMLElement;
  }
}