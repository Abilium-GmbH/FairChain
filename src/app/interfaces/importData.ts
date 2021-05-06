export interface ImportData {
    nodes: NodesEntry[],
    edges: EdgesEntry[]
}

interface NodesEntry {
    id: string,
    label: string,
    x: number,
    y: number,
    color?: string,
    fixed?,
    font?,
    icon?,
    imagePadding?,
    margin?,
    scaling?,
    shadow?,
    shapeProperties?
}

interface EdgesEntry {
    id: string,
    from: string,
    to: string
}