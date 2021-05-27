import { IdType } from 'vis-network/peer/esm/vis-network';
import { DOMBoundingBox } from "./DOMBoundingBox";
import { HoverOptionOnDOM } from "./HoverOptionOnDOM";

export interface HoverOptionInfo {
    active: boolean,
    nodeId: IdType,
    addChildNodeInfo: HoverOptionOnDOM,
    boundingBox: DOMBoundingBox
}