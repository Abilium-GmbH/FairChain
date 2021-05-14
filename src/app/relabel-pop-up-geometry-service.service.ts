import { Injectable } from '@angular/core';
import { RectOnDOM } from './interfaces/RectOnDOM';

@Injectable({
  providedIn: 'root'
})
export class RelabelPopUpGeometryService {

  constructor() { }

  public getRelabelPopUpRect(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    rect = this.moveRectOverNode(rect, min_x, min_y);
    rect = this.rescaleRect(rect, min_x, min_y, max_x, max_y);
    rect = this.cropRectToFitCanvas(rect, min_x, min_y, max_x, max_y)
    rect = this.moveRectLeftToFitCanvas(rect, min_x);
    rect = this.moveRectRightToFitCanvas(rect, max_x);
    rect = this.moveRectDownToFitCanvas(rect, min_y);
    rect = this.moveRectUpToFitCanvas(rect, max_y);

    return rect;
  }

  private rescaleRect(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const center_x = rect.x + rect.width/2;
    const center_y = rect.y + rect.height/2;
    return {
      x: (rect.x - center_x) * w / (max_x - min_x) + center_x,
      y: (rect.y - center_y) * h / (max_y - min_y) + center_y,
      width: rect.width * w / (max_x - min_x),
      height: rect.height * h / (max_y - min_y)
    }
  }

  private moveRectOverNode(rect: RectOnDOM, min_x: number, min_y: number): RectOnDOM {
    rect.x += min_x;
    rect.y += min_y;
    return rect;
  }

  private moveRectUpToFitCanvas(rect: RectOnDOM, max_y: number): RectOnDOM {
    if (rect.y + rect.height > max_y) rect.y = max_y - rect.height;
    return rect;
  }

  private moveRectDownToFitCanvas(rect: RectOnDOM, min_y: number): RectOnDOM {
    if (rect.y < min_y) rect.y = min_y;
    return rect;
  }

  private moveRectRightToFitCanvas(rect: RectOnDOM, max_x: number): RectOnDOM {
    if (rect.x + rect.width > max_x) rect.x = max_x - rect.width;
    return rect;
  }

  private moveRectLeftToFitCanvas(rect: RectOnDOM, min_x: number): RectOnDOM {
    if (rect.x < min_x) rect.x = min_x;
    return rect;
  }

  private cropRectToFitCanvas(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    if (rect.width > max_x - min_x) rect.width = max_x - min_x;
    if (rect.height > max_y - min_y) rect.height = max_y - min_y;
    return rect;
  }
}
