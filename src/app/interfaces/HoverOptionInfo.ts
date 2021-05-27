import { IdType } from 'vis-network/peer/esm/vis-network';
import { HoverOptionOnDOM } from "./HoverOptionOnDOM";
import { RectOnDOM } from './RectOnDOM';

export interface HoverOptionInfo {
    active: boolean,
    nodeId: IdType,
    addChildNodeInfo: HoverOptionOnDOM,
    boundingBox: RectOnDOM
}