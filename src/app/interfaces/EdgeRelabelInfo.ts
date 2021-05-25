import { RectOnDOM } from './RectOnDOM'
import { IdType } from "vis-network/peer/esm/vis-network";

export interface EdgeRelabelInfo {
    active: boolean,
    edgeId: IdType,
    label: string,
    rect: RectOnDOM
}