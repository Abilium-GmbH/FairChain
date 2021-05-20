import {IdType} from "vis-network/peer/esm/vis-network";
import { RectOnDOM } from "./RectOnDOM";

export interface NodeRelabelInfo {
    nodeId: IdType,
    active: boolean,
    label: string
    rect: RectOnDOM
}