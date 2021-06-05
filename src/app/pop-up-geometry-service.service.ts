import { Injectable } from '@angular/core';
import { Position } from 'vis-network/declarations/entry-esnext';
import { HoverOptionOnDOM } from './interfaces/HoverOptionOnDOM';
import { RectOnDOM } from './interfaces/RectOnDOM';

@Injectable({
  providedIn: 'root'
})

/**
 * Handles the geometry for the pop up components in the application
 */
export class PopUpGeometryService {

  private minHeight: number = 90;
  private minWidth: number = 150;
  private padding: number = 40;

  constructor() {
  }


  /**
   * Get the rectangle coordinates for the node relabel pop up component
   * @param node1_x x coordinate of the from node
   * @param node1_y y coordinate of the from node
   * @param node2_x x coordinate of the to node
   * @param node2_y y coordinate of the to node
   * @param min_x x coordinate of the top left corner of the canvas
   * @param min_y x coordinate of the top left corner of the canvas
   * @param max_x x coordinate of the bottom right corner of the canvas
   * @param max_y y coordinate of the bottom right corner of the canvas
   */
  public getNodeRelabelPopUpRect(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    rect = this.blowUpRect(rect);
    rect = this.offsetRect(rect, min_x, min_y);
    rect = this.rescaleRect(rect, min_x, min_y, max_x, max_y);
    rect = this.cropRectToFitCanvas(rect, min_x, min_y, max_x, max_y);
    rect = this.moveRectLeftToFitCanvas(rect, min_x);
    rect = this.moveRectRightToFitCanvas(rect, max_x);
    rect = this.moveRectDownToFitCanvas(rect, min_y);
    rect = this.moveRectUpToFitCanvas(rect, max_y);

    return rect;
  }

  /**
   * Get the rectangle coordinates for the edge relabel pop up component
   * @param node1_x x coordinate of the from node
   * @param node1_y y coordinate of the from node
   * @param node2_x x coordinate of the to node
   * @param node2_y y coordinate of the to node
   * @param min_x x coordinate of the top left corner of the canvas
   * @param min_y x coordinate of the top left corner of the canvas
   * @param max_x x coordinate of the bottom right corner of the canvas
   * @param max_y y coordinate of the bottom right corner of the canvas
   */
  public getEdgeRelabelPopUpRect(node1_x: number, node1_y: number, node2_x: number, node2_y: number,
    min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    let rect = this.createRectBetweenNodes(node1_x, node1_y, node2_x, node2_y);
    rect = this.blowUpRect(rect);
    rect = this.offsetRect(rect, min_x, min_y);
    rect = this.rescaleRect(rect, min_x, min_y, max_x, max_y);
    rect = this.cropRectToFitCanvas(rect, min_x, min_y, max_x, max_y);
    rect = this.moveRectLeftToFitCanvas(rect, min_x);
    rect = this.moveRectRightToFitCanvas(rect, max_x);
    rect = this.moveRectDownToFitCanvas(rect, min_y);
    rect = this.moveRectUpToFitCanvas(rect, max_y);

    return rect;
  }

  /**
   * Get the bounding box for the hover option component. If the mouse cursor
   * leaves this bounding box, the hover option disappears
   * @param corner1 the top left corner of the bounding box of the node
   * @param corner2 the bottom right corner of the bounding box of the node
   * @param min_x x coordinate of the top left corner of the canvas
   * @param min_y x coordinate of the top left corner of the canvas
   * @param max_x x coordinate of the bottom right corner of the canvas
   * @param max_y y coordinate of the bottom right corner of the canvas
   */
  public getHoverOptionBoundingBox(corner1: Position, corner2: Position, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    let bb: RectOnDOM = {
      x: corner1.x,
      y: corner1.y,
      width: corner2.x - corner1.x,
      height: corner2.y - corner1.y
    };
    bb = this.offsetRect(bb, min_x, min_y);
    bb = this.rescaleRect(bb, min_x, min_y, max_x, max_y);
    bb = this.padRect(bb);
    bb = this.cutRectToFitCanvas(bb, min_x, min_y, max_x, max_y);
    return bb;
  }
  
  /**
   * Get the position on the DOM of the node hover option. 
   * @param corner1 the top left corner of the bounding box of the node
   * @param corner2 the bottom right corner of the bounding box of the node
   * @param min_x x coordinate of the top left corner of the canvas
   * @param min_y x coordinate of the top left corner of the canvas
   * @param max_x x coordinate of the bottom right corner of the canvas
   * @param max_y y coordinate of the bottom right corner of the canvas
   */
  public getHoverOptionInfo(center: Position, min_x: number, min_y: number, max_x: number, max_y: number): HoverOptionOnDOM {
    let dx: number = -15;
    let dy: number = -70;

    return {
      x: center.x + min_x + dx,
      y: center.y + min_y + dy,
      scale: 2
    };
  }

  private blowUpRect(rect: RectOnDOM): RectOnDOM {
    let w: number = Math.max(this.minWidth, rect.width);
    let h: number = Math.max(this.minHeight, rect.height);
    rect.x = rect.x - (w - rect.width) / 2;
    rect.y = rect.y - (h - rect.height) / 2;
    rect.width = w;
    rect.height = h;
    return rect;
  }

  private createRectBetweenNodes(node1_x: number, node1_y: number, node2_x: number, node2_y: number): RectOnDOM {
    const center_x = (node1_x + node2_x) / 2;
    const center_y = (node1_y + node2_y) / 2;
    return {
      x: center_x - this.minWidth / 2,
      y: center_y - this.minHeight / 2,
      width: this.minWidth,
      height: this.minHeight
    };
  }

  private cropRectToFitCanvas(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    if (rect.width > max_x - min_x) {
      rect.width = (max_x - min_x) * 0.995;
    }
    if (rect.height > max_y - min_y) {
      rect.height = (max_y - min_y) * 0.995;
    }
    return rect;
  }

  private cutRectToFitCanvas(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    rect.x = Math.max(rect.x, min_x);
    rect.y = Math.max(rect.y, min_y);
    rect.width = Math.min(rect.width, max_x - rect.x);
    rect.height = Math.min(rect.height, max_y - rect.y);
    return rect;
  }

  private moveRectDownToFitCanvas(rect: RectOnDOM, min_y: number): RectOnDOM {
    if (rect.y < min_y) {
      rect.y = min_y;
    }
    return rect;
  }

  private moveRectLeftToFitCanvas(rect: RectOnDOM, min_x: number): RectOnDOM {
    if (rect.x < min_x) {
      rect.x = min_x;
    }
    return rect;
  }

  private moveRectRightToFitCanvas(rect: RectOnDOM, max_x: number): RectOnDOM {
    if (rect.x + rect.width > max_x) {
      rect.x = max_x - rect.width;
    }
    return rect;
  }

  private moveRectUpToFitCanvas(rect: RectOnDOM, max_y: number): RectOnDOM {
    if (rect.y + rect.height > max_y) {
      rect.y = max_y - rect.height - 3;
    }
    return rect;
  }

  private offsetRect(rect: RectOnDOM, min_x: number, min_y: number): RectOnDOM {
    rect.x += min_x;
    rect.y += min_y;
    return rect;
  }

  private padRect(rect: RectOnDOM): RectOnDOM {
    return {
      x: rect.x - this.padding,
      y: rect.y - this.padding,
      width: rect.width + 2 * this.padding,
      height: rect.height + 2 * this.padding
    };
  }

  private rescaleRect(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const center_x = rect.x + rect.width / 2;
    const center_y = rect.y + rect.height / 2;
    return {
      x: (rect.x - center_x) * w / (max_x - min_x) + center_x,
      y: (rect.y - center_y) * h / (max_y - min_y) + center_y,
      width: rect.width * w / (max_x - min_x),
      height: rect.height * h / (max_y - min_y)
    }
  }
}
