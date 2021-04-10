declare module 'react-in-viewport' {
  import { ReactNode, MutableRefObject } from "react";
  export declare function useInViewport(ref: MutableRefObject<any>, options?: any, config?: any, props: any): {
    inViewport: boolean,
    enterCount: number,
    leaveCount: number,
  }

  function handleViewport(block: ReactNode, options?: any, config?: any): any
  export = handleViewport
}